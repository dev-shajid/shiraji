from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import httpx
import json
import asyncio
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Shiraji AI Assistant",
    description="Advanced AI Assistant for Shiraji Group",
    version="2.0.0"
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Configuration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "https://llm.shiraji.ae")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral")

# In-memory conversation storage (use Redis in production)
conversations: Dict[str, List[Dict]] = {}

class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = "default"
    user_context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    suggestions: List[str] = []
    context_analysis: Dict[str, Any] = {}

class ConversationAnalyzer:
    """Advanced conversation analysis and context management"""
    
    def __init__(self):
        self.company_context = {
            "name": "Shiraji Group",
            "location": "Al Nahyan, Abu Dhabi, UAE",
            "phone": "+971 55 942 5653",
            "email": "info@shiraji.ae",
            "services": [
                "Residential & Commercial Construction",
                "Electrical Systems", "HVAC & Climate Control",
                "Plumbing & Water Systems", "Swimming Pool Installation",
                "Interior Design", "Maintenance Services",
                "Security & Fencing", "Cleaning Services"
            ]
        }
    
    def analyze_intent(self, message: str, history: List[Dict]) -> Dict[str, Any]:
        """Analyze user intent and extract context"""
        message_lower = message.lower()
        
        # Intent detection
        intents = {
            "quote_request": any(word in message_lower for word in ["quote", "price", "cost", "estimate", "budget"]),
            "project_inquiry": any(word in message_lower for word in ["project", "build", "construct", "renovation"]),
            "service_question": any(word in message_lower for word in ["service", "maintenance", "repair", "install"]),
            "general_info": any(word in message_lower for word in ["about", "company", "experience", "portfolio"]),
            "contact_request": any(word in message_lower for word in ["contact", "call", "visit", "appointment"]),
            "technical_support": any(word in message_lower for word in ["problem", "issue", "help", "support"])
        }
        
        # Extract entities
        entities = {
            "project_type": self._extract_project_type(message_lower),
            "location": self._extract_location(message_lower),
            "budget_range": self._extract_budget(message_lower),
            "urgency": self._extract_urgency(message_lower),
            "services_mentioned": self._extract_services(message_lower)
        }
        
        # Conversation stage analysis
        stage = self._determine_conversation_stage(history, intents)
        
        return {
            "intents": {k: v for k, v in intents.items() if v},
            "entities": {k: v for k, v in entities.items() if v},
            "conversation_stage": stage,
            "message_count": len(history),
            "primary_intent": max(intents.items(), key=lambda x: x[1])[0] if any(intents.values()) else "general"
        }
    
    def _extract_project_type(self, message: str) -> Optional[str]:
        project_types = {
            "villa": ["villa", "house", "home", "residential"],
            "commercial": ["office", "commercial", "business", "shop", "restaurant"],
            "renovation": ["renovation", "remodel", "upgrade", "refurbish"],
            "maintenance": ["maintenance", "repair", "fix", "service"]
        }
        
        for project_type, keywords in project_types.items():
            if any(keyword in message for keyword in keywords):
                return project_type
        return None
    
    def _extract_location(self, message: str) -> Optional[str]:
        locations = ["abu dhabi", "dubai", "sharjah", "ajman", "ras al khaimah", "fujairah", "umm al quwain"]
        for location in locations:
            if location in message:
                return location.title()
        return None
    
    def _extract_budget(self, message: str) -> Optional[str]:
        import re
        budget_pattern = r'(\d+)\s*(aed|dirham|thousand|million|k|m)'
        match = re.search(budget_pattern, message, re.IGNORECASE)
        if match:
            return match.group(0)
        return None
    
    def _extract_urgency(self, message: str) -> Optional[str]:
        urgency_keywords = {
            "urgent": ["urgent", "asap", "immediately", "emergency"],
            "soon": ["soon", "quickly", "fast", "this week"],
            "flexible": ["flexible", "no rush", "when possible"]
        }
        
        for urgency, keywords in urgency_keywords.items():
            if any(keyword in message for keyword in keywords):
                return urgency
        return None
    
    def _extract_services(self, message: str) -> List[str]:
        services = ["electrical", "plumbing", "hvac", "swimming pool", "interior design", 
                   "maintenance", "painting", "tiling", "carpentry", "security"]
        return [service for service in services if service in message]
    
    def _determine_conversation_stage(self, history: List[Dict], intents: Dict[str, bool]) -> str:
        if len(history) == 0:
            return "greeting"
        elif len(history) <= 3:
            return "exploration"
        elif any(intents.get(intent, False) for intent in ["quote_request", "contact_request"]):
            return "conversion"
        else:
            return "discussion"
    
    def generate_suggestions(self, analysis: Dict[str, Any]) -> List[str]:
        """Generate smart follow-up suggestions based on context"""
        suggestions = []
        
        primary_intent = analysis.get("primary_intent", "general")
        entities = analysis.get("entities", {})
        stage = analysis.get("conversation_stage", "greeting")
        
        if primary_intent == "quote_request":
            if not entities.get("project_type"):
                suggestions.append("What type of project are you planning?")
            if not entities.get("location"):
                suggestions.append("Which emirate is your project located in?")
            suggestions.append("Schedule a site visit for accurate quote")
        
        elif primary_intent == "project_inquiry":
            suggestions.extend([
                "View our recent projects",
                "Get a cost estimate",
                "Schedule a consultation"
            ])
        
        elif stage == "conversion":
            suggestions.extend([
                "Call us now: +971 55 942 5653",
                "Send project details via email",
                "Book a site visit"
            ])
        
        else:
            suggestions.extend([
                "Tell me about your project",
                "Get a quick quote",
                "See our services"
            ])
        
        return suggestions[:3]  # Limit to 3 suggestions

analyzer = ConversationAnalyzer()

class SmartPromptBuilder:
    """Build intelligent prompts based on conversation context"""
    
    def build_prompt(self, message: str, history: List[Dict], analysis: Dict[str, Any]) -> str:
        base_context = f"""
You are Shiraji AI Assistant - an expert construction consultant for Shiraji Group in Abu Dhabi, UAE.

COMPANY INFO:
- Location: Al Nahyan, Abu Dhabi, UAE
- Phone: +971 55 942 5653
- Email: info@shiraji.ae
- Services: Construction, Electrical, HVAC, Plumbing, Swimming Pools, Interior Design, Maintenance

CONVERSATION ANALYSIS:
- Primary Intent: {analysis.get('primary_intent', 'general')}
- Stage: {analysis.get('conversation_stage', 'greeting')}
- Entities: {', '.join(f"{k}: {v}" for k, v in analysis.get('entities', {}).items() if v)}
- Message Count: {analysis.get('message_count', 0)}
"""
        
        # Add conversation history (last 6 messages)
        recent_history = history[-6:] if len(history) > 6 else history
        if recent_history:
            history_text = "\n".join([f"{msg['role'].upper()}: {msg['content']}" for msg in recent_history])
            base_context += f"\n\nRECENT CONVERSATION:\n{history_text}"
        
        # Add specific instructions based on intent
        intent_instructions = self._get_intent_instructions(analysis.get('primary_intent', 'general'))
        
        prompt = f"""{base_context}

CURRENT USER MESSAGE: "{message}"

{intent_instructions}

RESPONSE GUIDELINES:
- Be conversational and helpful (not robotic)
- Reference previous conversation naturally
- Ask ONE specific follow-up question
- Keep response under 100 words
- Use emojis appropriately
- Provide actionable advice
- Be specific and avoid generic responses

Respond as Shiraji AI Assistant:"""
        
        return prompt
    
    def _get_intent_instructions(self, intent: str) -> str:
        instructions = {
            "quote_request": "Focus on gathering project details (type, size, location, timeline) to provide accurate pricing. Offer to schedule a site visit.",
            "project_inquiry": "Discuss project specifics, share relevant experience, and guide toward next steps (consultation, quote, timeline).",
            "service_question": "Explain the specific service in detail, mention related services, and suggest how to proceed.",
            "contact_request": "Provide contact information and suggest the best way to connect based on their needs.",
            "technical_support": "Offer practical solutions, explain the process, and suggest professional assessment if needed.",
            "general": "Be welcoming, understand their needs, and guide the conversation toward specific services or projects."
        }
        return instructions.get(intent, instructions["general"])

prompt_builder = SmartPromptBuilder()

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(chat_request: ChatMessage):
    try:
        conversation_id = chat_request.conversation_id or "default"
        
        # Get or create conversation history
        if conversation_id not in conversations:
            conversations[conversation_id] = []
        
        history = conversations[conversation_id]
        
        # Add user message to history
        user_message = {
            "role": "user",
            "content": chat_request.message,
            "timestamp": datetime.now().isoformat()
        }
        history.append(user_message)
        
        # Analyze conversation context
        analysis = analyzer.analyze_intent(chat_request.message, history)
        
        # Build intelligent prompt
        prompt = prompt_builder.build_prompt(chat_request.message, history, analysis)
        
        # Call Ollama API
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "max_tokens": 200,
                        "top_p": 0.9,
                        "frequency_penalty": 0.8,
                        "presence_penalty": 0.6
                    }
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="AI service unavailable")
            
            ai_response_data = response.json()
            ai_response = ai_response_data.get("response", "I'm having trouble responding right now. Please try again.")
        
        # Clean up response
        ai_response = ai_response.replace("Shiraji AI Assistant:", "").strip()
        
        # Add AI response to history
        ai_message = {
            "role": "assistant",
            "content": ai_response,
            "timestamp": datetime.now().isoformat()
        }
        history.append(ai_message)
        
        # Generate smart suggestions
        suggestions = analyzer.generate_suggestions(analysis)
        
        # Limit conversation history (keep last 20 messages)
        if len(history) > 20:
            conversations[conversation_id] = history[-20:]
        
        return ChatResponse(
            response=ai_response,
            conversation_id=conversation_id,
            suggestions=suggestions,
            context_analysis=analysis
        )
        
    except Exception as e:
        print(f"Chat error: {e}")
        return ChatResponse(
            response="I'm experiencing some technical difficulties. Please try again or contact us directly at +971 55 942 5653.",
            conversation_id=conversation_id,
            suggestions=["Call us directly", "Try again", "Send email"]
        )

@app.get("/chat/stream")
async def chat_stream(message: str, conversation_id: str = "default"):
    """Streaming chat endpoint for real-time responses"""
    
    async def generate_stream():
        try:
            # Get conversation history
            history = conversations.get(conversation_id, [])
            
            # Analyze context
            analysis = analyzer.analyze_intent(message, history)
            
            # Build prompt
            prompt = prompt_builder.build_prompt(message, history, analysis)
            
            # Stream from Ollama
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream(
                    "POST",
                    f"{OLLAMA_BASE_URL}/api/generate",
                    json={
                        "model": OLLAMA_MODEL,
                        "prompt": prompt,
                        "stream": True,
                        "options": {
                            "temperature": 0.7,
                            "max_tokens": 200
                        }
                    }
                ) as response:
                    full_response = ""
                    async for chunk in response.aiter_lines():
                        if chunk:
                            try:
                                data = json.loads(chunk)
                                if "response" in data:
                                    token = data["response"]
                                    full_response += token
                                    yield f"data: {json.dumps({'token': token, 'done': data.get('done', False)})}\n\n"
                                    
                                if data.get("done", False):
                                    # Save to conversation history
                                    if conversation_id not in conversations:
                                        conversations[conversation_id] = []
                                    
                                    conversations[conversation_id].extend([
                                        {"role": "user", "content": message, "timestamp": datetime.now().isoformat()},
                                        {"role": "assistant", "content": full_response, "timestamp": datetime.now().isoformat()}
                                    ])
                                    break
                            except json.JSONDecodeError:
                                continue
                                
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(generate_stream(), media_type="text/plain")

@app.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    """Get conversation history"""
    return conversations.get(conversation_id, [])

@app.delete("/conversations/{conversation_id}")
async def clear_conversation(conversation_id: str):
    """Clear conversation history"""
    if conversation_id in conversations:
        del conversations[conversation_id]
    return {"message": "Conversation cleared"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            ollama_status = "healthy" if response.status_code == 200 else "unhealthy"
    except:
        ollama_status = "unreachable"
    
    return {
        "status": "healthy",
        "ollama_status": ollama_status,
        "active_conversations": len(conversations)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)