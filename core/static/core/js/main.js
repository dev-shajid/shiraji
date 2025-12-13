// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })

    // Auto-hide alerts after 5 seconds
    setTimeout(function() {
        var alerts = document.querySelectorAll('.alert');
        alerts.forEach(function(alert) {
            var bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        });
    }, 5000);

    // Project filter functionality
    var filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length > 0) {
        filterButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                var category = this.getAttribute('data-filter');
                
                filterButtons.forEach(function(btn) {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
                
                if (category === 'all') {
                    document.querySelectorAll('.project-item').forEach(function(item) {
                        item.style.display = 'block';
                    });
                } else {
                    document.querySelectorAll('.project-item').forEach(function(item) {
                        if (item.getAttribute('data-category') === category) {
                            item.style.display = 'block';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                }
            });
        });
    }


});



// CSRF cookie helper function
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}



// Team stats counter animation
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current);
                setTimeout(updateCounter, 20);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    });
}

// Trigger animation when team section is in view
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

const teamStats = document.querySelector('.team-stats');
if (teamStats) {
    observer.observe(teamStats);
}

// Cost Calculator
function calculateCost() {
    const projectType = document.getElementById('project-type').value;
    const area = parseInt(document.getElementById('area').value);
    const quality = document.getElementById('quality').value;
    const location = document.getElementById('location').value;
    
    if (!area || area <= 0) {
        alert('Please enter a valid area');
        return;
    }
    
    // Base rates per sq ft
    const baseRates = {
        residential: 150,
        commercial: 200,
        renovation: 100,
        infrastructure: 250
    };
    
    // Quality multipliers
    const qualityMultipliers = {
        standard: 1,
        premium: 1.3,
        luxury: 1.6
    };
    
    // Location multipliers
    const locationMultipliers = {
        'abu-dhabi': 1.1,
        'dubai': 1.2,
        'sharjah': 1
    };
    
    const baseRate = baseRates[projectType];
    const qualityMultiplier = qualityMultipliers[quality];
    const locationMultiplier = locationMultipliers[location];
    
    const totalCost = area * baseRate * qualityMultiplier * locationMultiplier;
    
    document.getElementById('estimated-cost').textContent = 
        'AED ' + totalCost.toLocaleString() + ' - ' + (totalCost * 1.2).toLocaleString();
    document.getElementById('cost-result').style.display = 'block';
}

// Smart search functionality
function initSmartSearch() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search projects, services, or ask a question...';
    searchInput.className = 'form-control smart-search';
    searchInput.id = 'smart-search';
    
    // Add to navigation
    const navbar = document.querySelector('.navbar .container');
    if (navbar) {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container ms-3';
        searchContainer.appendChild(searchInput);
        navbar.appendChild(searchContainer);
        
        // Smart search with suggestions
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            if (query.length > 2) {
                showSearchSuggestions(query);
            }
        });
    }
}

function showSearchSuggestions(query) {
    const suggestions = [
        'Residential Construction',
        'Commercial Buildings',
        'Project Management',
        'Cost Estimation',
        'Building Permits',
        'Interior Design',
        'Renovation Services',
        'Infrastructure Development'
    ].filter(item => item.toLowerCase().includes(query));
    
    // Create suggestions dropdown
    let dropdown = document.getElementById('search-suggestions');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'search-suggestions';
        dropdown.className = 'search-suggestions';
        document.querySelector('.search-container').appendChild(dropdown);
    }
    
    dropdown.innerHTML = suggestions.map(suggestion => 
        `<div class="suggestion-item" onclick="selectSuggestion('${suggestion}')">${suggestion}</div>`
    ).join('');
    
    dropdown.style.display = suggestions.length > 0 ? 'block' : 'none';
}

function selectSuggestion(suggestion) {
    document.getElementById('smart-search').value = suggestion;
    document.getElementById('search-suggestions').style.display = 'none';
    // Trigger search or navigation
    performSmartSearch(suggestion);
}

function performSmartSearch(query) {
    // Smart search logic - could integrate with your existing pages
    const searchMap = {
        'residential': '/services/',
        'commercial': '/services/',
        'project': '/projects/',
        'cost': '#cost-calculator',
        'contact': '/contact/'
    };
    
    for (let [key, url] of Object.entries(searchMap)) {
        if (query.toLowerCase().includes(key)) {
            if (url.startsWith('#')) {
                document.querySelector(url)?.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.location.href = url;
            }
            return;
        }
    }
}

// Weather-based theme system
function initWeatherTheme() {
    // Simulate weather API call (replace with real API)
    const weatherConditions = ['sunny', 'cloudy', 'rainy', 'sandstorm'];
    const currentWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    
    const themes = {
        sunny: {
            primary: '#FF7F00',
            secondary: '#FFB347',
            background: 'linear-gradient(135deg, #FFE5B4 0%, #FFCC80 100%)',
            text: '#2C3E50'
        },
        cloudy: {
            primary: '#607D8B',
            secondary: '#90A4AE',
            background: 'linear-gradient(135deg, #ECEFF1 0%, #CFD8DC 100%)',
            text: '#37474F'
        },
        rainy: {
            primary: '#3F51B5',
            secondary: '#7986CB',
            background: 'linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%)',
            text: '#1A237E'
        },
        sandstorm: {
            primary: '#8D6E63',
            secondary: '#A1887F',
            background: 'linear-gradient(135deg, #EFEBE9 0%, #D7CCC8 100%)',
            text: '#3E2723'
        }
    };
    
    const theme = themes[currentWeather];
    
    // Apply theme
    document.documentElement.style.setProperty('--primary-color', theme.primary);
    document.documentElement.style.setProperty('--secondary-color', theme.secondary);
    const heroEnhanced = document.querySelector('.hero-enhanced');
    if (heroEnhanced) {
        heroEnhanced.style.background = theme.background;
    }
    
    // Add weather indicator
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        const weatherIndicator = document.createElement('div');
        weatherIndicator.className = 'weather-indicator';
        weatherIndicator.innerHTML = `
            <i class="fas fa-${getWeatherIcon(currentWeather)}"></i>
            <span>Theme: ${currentWeather.charAt(0).toUpperCase() + currentWeather.slice(1)}</span>
        `;
        heroContent.appendChild(weatherIndicator);
    }
}

function getWeatherIcon(weather) {
    const icons = {
        sunny: 'sun',
        cloudy: 'cloud',
        rainy: 'cloud-rain',
        sandstorm: 'wind'
    };
    return icons[weather] || 'sun';
}

// Initialize animations when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Animate counters when they come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                observer.unobserve(entry.target);
            }
        });
    });
    
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        observer.observe(statsSection);
    }
    
    init3DVisualizer();
    initConstructionSimulator();
    initProjectConfigurator();
});

// Smart form validation
function initSmartContactForm() {
    const contactForm = document.querySelector('#contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            validateSmartForm(this);
        });
        
        // Real-time smart suggestions
        const messageField = contactForm.querySelector('textarea');
        if (messageField) {
            messageField.addEventListener('input', function() {
                provideSuggestions(this.value);
            });
        }
    }
}

function validateSmartForm(form) {
    const formData = new FormData(form);
    const message = formData.get('message');
    
    // Smart message analysis
    const urgencyKeywords = ['urgent', 'asap', 'emergency', 'immediately'];
    const projectKeywords = ['build', 'construct', 'renovate', 'design'];
    
    let priority = 'normal';
    if (urgencyKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
        priority = 'high';
    }
    
    let category = 'general';
    if (projectKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
        category = 'project';
    }
    
    // Add smart categorization to form data
    formData.append('priority', priority);
    formData.append('category', category);
    
    // Submit with smart enhancements
    submitSmartForm(formData);
}

function provideSuggestions(message) {
    const suggestions = {
        'cost': 'Try our Smart Cost Calculator above for instant estimates!',
        'time': 'Project timelines vary by scope. Use our calculator for estimates.',
        'material': 'We source high-quality materials from certified suppliers.',
        'permit': 'We handle all permits and regulatory approvals for you.'
    };
    
    for (let [keyword, suggestion] of Object.entries(suggestions)) {
        if (message.toLowerCase().includes(keyword)) {
            showSuggestionTooltip(suggestion);
            break;
        }
    }
}
// Submit price counter animation
document.addEventListener("DOMContentLoaded", function () {
  const counters = document.querySelectorAll('.count-up');
  counters.forEach((counter) => {
    const updateCount = () => {
      const target = +counter.getAttribute("data-target");
      const count = +counter.innerText.replace(/[^\d]/g, "");
      const speed = 50; // Lower is faster
      const increment = Math.ceil(target / speed);

      if (count < target) {
        counter.innerText = "AED " + (count + increment).toLocaleString();
        setTimeout(updateCount, 20);
      } else {
        counter.innerText = "AED " + target.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      }
    };
    updateCount();
  });
});

// Smart Service Filtering and Search
document.addEventListener('DOMContentLoaded', function() {
    // Initialize service filtering
    initServiceFilter();
    
    // Initialize search functionality
    initServiceSearch();
    
    // Initialize quote system
    initQuoteSystem();
});

function initServiceFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const serviceItems = document.querySelectorAll('.service-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            // Filter service items
            serviceItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 100);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
            
            // Update results count
            updateResultsCount(filter);
        });
    });
}

function initServiceSearch() {
    const searchInput = document.getElementById('serviceSearch');
    const serviceItems = document.querySelectorAll('.service-item');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        serviceItems.forEach(item => {
            const keywords = item.getAttribute('data-keywords').toLowerCase();
            const title = item.querySelector('h5').textContent.toLowerCase();
            const description = item.querySelector('.card-text').textContent.toLowerCase();
            
            if (keywords.includes(searchTerm) || 
                title.includes(searchTerm) || 
                description.includes(searchTerm) ||
                searchTerm === '') {
                item.style.display = 'block';
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    });
}

function updateResultsCount(filter) {
    const serviceItems = document.querySelectorAll('.service-item');
    let visibleCount = 0;
    
    serviceItems.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
            visibleCount++;
        }
    });
    
    // You can add a results counter here if needed
    console.log(`Showing ${visibleCount} services`);
}

// Smart Quote System
function initQuoteSystem() {
    // Initialize Bootstrap modal if not already done
    if (typeof bootstrap !== 'undefined') {
        window.quoteModal = new bootstrap.Modal(document.getElementById('quoteModal'));
    }
}

function requestQuote(serviceName) {
    document.getElementById('selectedService').value = serviceName;
    
    if (window.quoteModal) {
        window.quoteModal.show();
    } else {
        // Fallback for older Bootstrap versions
        $('#quoteModal').modal('show');
    }
}

function submitQuote() {
    const form = document.getElementById('quoteForm');
    const formData = new FormData(form);
    
    // Add loading state
    const submitBtn = event.target;
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading"></span> Sending...';
    submitBtn.disabled = true;
    
    // Simulate form submission (replace with actual AJAX call)
    setTimeout(() => {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Show success message
        showSuccessMessage('Quote request sent successfully! We will contact you soon.');
        
        // Close modal
        if (window.quoteModal) {
            window.quoteModal.hide();
        } else {
            $('#quoteModal').modal('hide');
        }
        
        // Reset form
        form.reset();
    }, 2000);
}

function showSuccessMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'success-message';
    alertDiv.textContent = message;
    
    // Insert at top of services section
    const servicesSection = document.querySelector('#servicesGrid').parentElement;
    servicesSection.insertBefore(alertDiv, servicesSection.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Smart Analytics (Optional)
function trackServiceInteraction(serviceName, action) {
    // Track user interactions for analytics
    console.log(`User ${action} for service: ${serviceName}`);
    
    // You can integrate with Google Analytics or other tracking services here
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': 'Services',
            'event_label': serviceName
        });
    }
}

// Add click tracking to service cards
document.addEventListener('DOMContentLoaded', function() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('click', function() {
            const serviceName = this.querySelector('h5').textContent;
            trackServiceInteraction(serviceName, 'card_click');
        });
    });
    
    // Initialize AI Chat
    initAIChat();
});

// Enhanced AI Chat Integration with Ollama API
function initAIChat() {
    const chatButton = document.getElementById('chat-button');
    const chatPopup = document.getElementById('chat-popup');
    const closeChat = document.getElementById('close-chat');
    const userInput = document.getElementById('user-input');
    const sendMessage = document.getElementById('send-message');
    const chatMessages = document.getElementById('chat-messages');
    const chatNotification = document.getElementById('chat-notification');

    // Enhanced conversation memory and context
    let conversationHistory = [];
    let userProfile = {
        name: null,
        interests: [],
        projectType: null,
        budget: null,
        location: null,
        previousQuestions: [],
        conversationStage: 'greeting' // greeting, exploring, discussing, closing
    };

        // Smart company context with dynamic responses
const smartCompanyContext = `
We are Shiraji-Group AI Assistant – a smart, helpful construction expert for Shiraji General Contracting and its group of companies based in Abu Dhabi, UAE.

ABOUT SHIRAJI GROUP:
Shiraji Group is a trusted collection of companies providing expert construction, maintenance, and technical services across the UAE. We collaborate with top-tier brands and ensure precision, safety, and client satisfaction in every project.

GROUP COMPANIES:

1. Shiraji General Contracting 🏗️
- Leading general contracting company
- Specializes in construction and project management
- Website: https://www.shiraji.ae/

2. Happy Future General Maintenance 🧰
- Full maintenance solutions for residential and commercial properties
- Website: https://happy-future.shiraji.ae/

3. Mariner Technical Services ⚙️
- Expert in technical services, maintenance, and cleaning
- Delivers safe, efficient, and high-quality support
- Website: https://mariner.shiraji.ae/

OFFICIAL CONTACTS:
- Location: Al Nahyan, Abu Dhabi, UAE
- Phone: +971 26 76 7004
- Emails:
  • info@shiraji.ae (main contact)
  • md@shirajiuea.ae (Group Managing Director)
  • imadfouri@shiraji.ae (technical founder)

IMPORTANT RULES FOR EMAILS AND NAMES:
- You must ONLY provide emails exactly as listed:
  • General contact: info@shiraji.ae
  • Group Managing Director Alaa Msyah: md@shirajiuea.com
  • Technical Founder Imad Fouri: imadfouri@shiraji.ae
- NEVER invent or hallucinate emails or names.
- If asked for an email or contact not in the above list, respond:
  "Sorry, I don't have that information."
- NEVER create variants like alaa@shirajiuea.ae or similar.
- ALWAYS check before sharing an email that it matches exactly one from the list.

TEAM:
- SALIM MOSHI UDDOWLA (Founder & CEO) – Over 15 years in construction leadership.
- ABDULRAHMAN ALBREIKI (Board Member)
- MOHAMMAD ARIFUL ISLAM (MEP Project Engineer) – Delivers technical innovations and engineering solutions.
  • LinkedIn: https://www.linkedin.com/in/mohammad-ariful-islam-867997b1/
- ALAE MSYAH (Group Managing Director) – Ensures timely, budgeted, and high-quality project delivery.
  • LinkedIn: https://www.linkedin.com/in/alaemsyah/
- BASEERUDDIN (Construction Manager) – Directs all construction site operations.

TECHNICAL LEADERSHIP:
- Imad Fouri – Technical Founder and AI Systems Engineer.
  • Expert in advanced AI, system architecture, and digital automation.
  • LinkedIn: https://www.linkedin.com/in/imadfouri/
  • You (the assistant) support construction while acknowledging Imad is technical direction.

LINKEDIN PROFILES:
- Company: https://www.linkedin.com/company/shiraji/?viewAsMember=true

YOUR PERSONALITY:
- Friendly and conversational (not robotic)
- Smart and contextual (remember what was said)
- Helpful and solution-focused
- Use emojis naturally 😊
- Ask follow-up questions
- Provide specific examples
- Match the user’s communication tone

CONVERSATION STAGES:
- greeting, exploring, discussing, closing

IMPORTANT RULES:
1. NEVER invent names, people, or email addresses.
2. ONLY mention these official emails: info@shiraji.ae, md@shirajiuea.ae, imadfouri@shiraji.ae
3. NEVER mention or guess names or emails like “Ahmed” or “ahmed@shiraji.ae”
4. NEVER repeat information twice.
5. ALWAYS reference previous conversation history.
6. Provide actionable, short answers under 100 words.
7. Acknowledge when the user shares or creates something.
8. If a question is unclear, ask for clarification.
9. If you don’t know the answer, say: “Sorry, I don’t have that information.”
10. Never give generic information dumps – always tailor responses to user intent.
11. Be confident, helpful, and clear.
12. Promote the group’s trust, professionalism, and expertise in every answer.

LIMITATIONS:
- You are an internal assistant running via Ollama (locally hosted).
- You do NOT access the internet.
- You respond only using the provided information.
`;




















    // Toggle chat popup
    chatButton.addEventListener('click', function() {
        if (chatPopup.style.display === 'none' || chatPopup.style.display === '') {
            chatPopup.style.display = 'flex';
            userInput.focus();
            chatNotification.style.display = 'none';
        } else {
            chatPopup.style.display = 'none';
        }
    });

    // Close chat popup
    closeChat.addEventListener('click', function() {
        chatPopup.style.display = 'none';
    });

    // Enhanced message function with context awareness
    function addMessage(content, isUser = false, showTyping = false) {
        if (showTyping) {
            const typingDiv = document.createElement('div');
            typingDiv.classList.add('typing-indicator');
            typingDiv.id = 'typing-indicator';
            typingDiv.innerHTML = `
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
                <span>Thinking...</span>
            `;
            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            return;
        }

        // Remove typing indicator
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'assistant-message');
        
        const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        if (isUser) {
            messageDiv.innerHTML = `
                <div class="message-content user-content">
                    <span>${content}</span>
                    <span class="message-time">${currentTime}</span>
                </div>
            `;
            // Store user message in history
            conversationHistory.push({role: 'user', content: content, timestamp: new Date()});
            analyzeUserInput(content);
        } else {
            messageDiv.innerHTML = `
                <img src="/static/core/images/logo-full.png" alt="AI" class="message-avatar">
                <div class="message-content">
                    <span>${content}</span>
                    <span class="message-time">${currentTime}</span>
                </div>
            `;
            // Store AI response in history
            conversationHistory.push({role: 'assistant', content: content, timestamp: new Date()});
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        if (!isUser) {
            playNotificationSound();
        }
    }

    // Enhanced user input analysis
    function analyzeUserInput(message) {
        const lowerMessage = message.toLowerCase();
        
        // Detect conversation stage
        if (conversationHistory.length <= 2) {
            userProfile.conversationStage = 'greeting';
        } else if (conversationHistory.length <= 6) {
            userProfile.conversationStage = 'exploring';
        } else {
            userProfile.conversationStage = 'discussing';
        }
        
        // Detect project types
        if (lowerMessage.includes('villa') || lowerMessage.includes('house') || lowerMessage.includes('home')) {
            userProfile.projectType = 'residential';
        } else if (lowerMessage.includes('office') || lowerMessage.includes('commercial') || lowerMessage.includes('business')) {
            userProfile.projectType = 'commercial';
        }
        
        // Detect budget mentions
        const budgetMatch = lowerMessage.match(/(\d+)\s*(aed|dirham|thousand|million)/i);
        if (budgetMatch) {
            userProfile.budget = budgetMatch[0];
        }
        
        // Track interests
        const services = ['electrical', 'plumbing', 'hvac', 'swimming pool', 'renovation', 'maintenance', 'painting', 'tiling'];
        services.forEach(service => {
            if (lowerMessage.includes(service) && !userProfile.interests.includes(service)) {
                userProfile.interests.push(service);
            }
        });
        
        userProfile.previousQuestions.push(message);
    }

    // Enhanced AI communication with better context
    async function sendToAI(userMessage) {
        try {
            // Build conversation context (last 4 exchanges)
            const recentHistory = conversationHistory.slice(-8);
            const contextHistory = recentHistory.map(msg => 
                `${msg.role.toUpperCase()}: ${msg.content}`
            ).join('\n');
            
            // Build enhanced context
            const conversationContext = `
CONVERSATION STAGE: ${userProfile.conversationStage}
MESSAGE COUNT: ${conversationHistory.length}
USER INTERESTS: ${userProfile.interests.join(', ') || 'None detected'}
PROJECT TYPE: ${userProfile.projectType || 'Unknown'}
BUDGET: ${userProfile.budget || 'Not mentioned'}

RECENT CONVERSATION:
${contextHistory}

CURRENT USER MESSAGE: "${userMessage}"

INSTRUCTIONS:
- Respond naturally to what the user just said
- Reference previous conversation if relevant
- Ask ONE specific follow-up question
- Be helpful and conversational
- Keep response under 80 words
- Use emojis appropriately
- If user mentions creating something, acknowledge it specifically
- If unclear, ask for clarification

RESPOND AS SHIRAJI AI:`;

            const enhancedPrompt = `${smartCompanyContext}${conversationContext}`;

            const response = await fetch('https://llm.shiraji.ae/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'mistral',
                    prompt: enhancedPrompt,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        max_tokens: 150,
                        top_p: 0.9,
                        frequency_penalty: 0.8,
                        presence_penalty: 0.6,
                        stop: ['USER:', 'ASSISTANT:']
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            let aiResponse = data.response || generateFallbackResponse(userMessage);
            
            // Clean up response
            aiResponse = aiResponse.replace(/^(SHIRAJI AI:|AI:|ASSISTANT:)/i, '').trim();
            
            return aiResponse;
        } catch (error) {
            console.error('AI API Error:', error);
            return generateFallbackResponse(userMessage);
        }
    }

    // Smart fallback responses based on context
    function generateFallbackResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('create') || lowerMessage.includes('made') || lowerMessage.includes('built')) {
            return `That sounds interesting! 🤔 I'd love to hear more about what you've created. Could you tell me more details about your project? I might be able to help with construction or improvement ideas! 🏗️`;
        }
        
        if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('quote')) {
            return `I'd be happy to help with pricing! 💰 To give you an accurate estimate, could you tell me:\n\n• What type of project? (villa, office, renovation)\n• Approximate size?\n• Location in UAE?\n\nThis helps me provide better guidance! 📋`;
        }
        
        if (lowerMessage.includes('time') || lowerMessage.includes('duration') || lowerMessage.includes('how long')) {
            return `Good question about timing! ⏰ Project duration varies based on scope and complexity. What specific project are you planning? I can give you a more accurate timeline estimate! 🏗️`;
        }
        
        // Default contextual response
        if (conversationHistory.length > 2) {
            return `I want to make sure I understand you correctly. 🤔 Could you clarify what you're asking about? I'm here to help with any construction or service questions! 😊`;
        }
        
        return `Hi there! 👋 I'm Shiraji's AI assistant. I'm here to help with construction, maintenance, and project questions. What can I help you with today? 🏗️`;
    }

    // Enhanced send message function
    async function sendUserMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        addMessage(message, true);
        userInput.value = '';
        
        addMessage('', false, true);
        
        const aiResponse = await sendToAI(message);
        addMessage(aiResponse, false);
        
        // Suggest follow-up actions based on conversation
        setTimeout(() => {
            suggestFollowUpActions();
        }, 2000);
    }

    // Smart follow-up suggestions
    function suggestFollowUpActions() {
        if (conversationHistory.length >= 4 && !document.querySelector('.follow-up-suggestions')) {
            const suggestionsDiv = document.createElement('div');
            suggestionsDiv.classList.add('follow-up-suggestions');
            
            let suggestions = [];
            
            if (userProfile.projectType && !userProfile.budget) {
                suggestions.push('Get cost estimate');
            }
            if (userProfile.interests.length > 0) {
                suggestions.push('Schedule consultation');
            }
            suggestions.push('View our projects');
            suggestions.push('Contact our team');
            
            suggestionsDiv.innerHTML = `
                <div class="suggestion-header">💡 What would you like to do next?</div>
                <div class="suggestion-buttons">
                    ${suggestions.map(suggestion => 
                        `<button class="suggestion-btn" data-action="${suggestion}">${suggestion}</button>`
                    ).join('')}
                </div>
            `;
            
            chatMessages.appendChild(suggestionsDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Add click handlers
            document.querySelectorAll('.suggestion-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const action = this.getAttribute('data-action');
                    userInput.value = action;
                    sendUserMessage();
                    suggestionsDiv.remove();
                });
            });
        }
    }

    // Event listeners
    sendMessage.addEventListener('click', sendUserMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendUserMessage();
        }
    });

    // Notification sound
    function playNotificationSound() {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
            audio.volume = 0.3;
            audio.play().catch(e => console.log('Audio play failed:', e));
        } catch (e) {
            console.log('Notification sound not available');
        }
    }

    // Enhanced quick actions with smart suggestions
    function addSmartQuickActions() {
        const quickActionsDiv = document.createElement('div');
        quickActionsDiv.classList.add('quick-actions');
        quickActionsDiv.innerHTML = `
            <div class="quick-action-buttons">
                <button class="quick-btn" data-message="I need a quote for my project">💰 Get Quote</button>
                <button class="quick-btn" data-message="What's your experience with villa construction?">🏠 Villa Projects</button>
                <button class="quick-btn" data-message="Do you handle commercial buildings?">🏢 Commercial</button>
                <button class="quick-btn" data-message="I need maintenance services">🔧 Maintenance</button>
            </div>
        `;
        chatMessages.appendChild(quickActionsDiv);
        
        document.querySelectorAll('.quick-btn').forEach(button => {
            button.addEventListener('click', function() {
                const message = this.getAttribute('data-message');
                userInput.value = message;
                sendUserMessage();
                quickActionsDiv.remove();
            });
        });
    }

    // Initialize with smart welcome
    setTimeout(() => {
        addSmartQuickActions();
    }, 1000);
}

// Smart Service Filtering and Search
document.addEventListener('DOMContentLoaded', function() {
    // Initialize service filtering
    initServiceFilter();
    
    // Initialize search functionality
    initServiceSearch();
    
    // Initialize quote system
    initQuoteSystem();
});

function initServiceFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const serviceItems = document.querySelectorAll('.service-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            // Filter service items
            serviceItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 100);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
            
            // Update results count
            updateResultsCount(filter);
        });
    });
}

function initServiceSearch() {
    const searchInput = document.getElementById('serviceSearch');
    const serviceItems = document.querySelectorAll('.service-item');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        serviceItems.forEach(item => {
            const keywords = item.getAttribute('data-keywords').toLowerCase();
            const title = item.querySelector('h5').textContent.toLowerCase();
            const description = item.querySelector('.card-text').textContent.toLowerCase();
            
            if (keywords.includes(searchTerm) || 
                title.includes(searchTerm) || 
                description.includes(searchTerm) ||
                searchTerm === '') {
                item.style.display = 'block';
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            } else {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    });
}

function updateResultsCount(filter) {
    const serviceItems = document.querySelectorAll('.service-item');
    let visibleCount = 0;
    
    serviceItems.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
            visibleCount++;
        }
    });
    
    // You can add a results counter here if needed
    console.log(`Showing ${visibleCount} services`);
}

// Smart Quote System
function initQuoteSystem() {
    // Initialize Bootstrap modal if not already done
    if (typeof bootstrap !== 'undefined') {
        window.quoteModal = new bootstrap.Modal(document.getElementById('quoteModal'));
    }
}

function requestQuote(serviceName) {
    document.getElementById('selectedService').value = serviceName;
    
    if (window.quoteModal) {
        window.quoteModal.show();
    } else {
        // Fallback for older Bootstrap versions
        $('#quoteModal').modal('show');
    }
}

function submitQuote() {
    const form = document.getElementById('quoteForm');
    const formData = new FormData(form);
    
    // Add loading state
    const submitBtn = event.target;
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading"></span> Sending...';
    submitBtn.disabled = true;
    
    // Simulate form submission (replace with actual AJAX call)
    setTimeout(() => {
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Show success message
        showSuccessMessage('Quote request sent successfully! We will contact you soon.');
        
        // Close modal
        if (window.quoteModal) {
            window.quoteModal.hide();
        } else {
            $('#quoteModal').modal('hide');
        }
        
        // Reset form
        form.reset();
    }, 2000);
}

function showSuccessMessage(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'success-message';
    alertDiv.textContent = message;
    
    // Insert at top of services section
    const servicesSection = document.querySelector('#servicesGrid').parentElement;
    servicesSection.insertBefore(alertDiv, servicesSection.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Smart Analytics (Optional)
function trackServiceInteraction(serviceName, action) {
    // Track user interactions for analytics
    console.log(`User ${action} for service: ${serviceName}`);
    
    // You can integrate with Google Analytics or other tracking services here
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': 'Services',
            'event_label': serviceName
        });
    }
}

// Add click tracking to service cards
document.addEventListener('DOMContentLoaded', function() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('click', function() {
            const serviceName = this.querySelector('h5').textContent;
            trackServiceInteraction(serviceName, 'card_click');
        });
    });
});
// Add to main.js
function initSmartContactForm() {
    const contactForm = document.querySelector('#contactForm');
    if (contactForm) {
        // Auto-fill service if coming from services page
        const urlParams = new URLSearchParams(window.location.search);
        const service = urlParams.get('service');
        if (service) {
            const serviceField = contactForm.querySelector('[name="service"]');
            if (serviceField) serviceField.value = service;
        }
        
        // Smart form validation
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            validateAndSubmitForm(this);
        });
    }
}

// Smart Project Configurator
function initProjectConfigurator() {
    const configurator = document.getElementById('project-configurator');
    if (!configurator) return;
    
    const options = {
        type: ['Villa', 'Apartment', 'Office', 'Warehouse'],
        style: ['Modern', 'Traditional', 'Contemporary', 'Industrial'],
        floors: [1, 2, 3, 4, 5],
        features: ['Swimming Pool', 'Garden', 'Parking', 'Solar Panels', 'Smart Home']
    };
    
    let selectedOptions = {
        type: options.type[0],
        style: options.style[0],
        floors: options.floors[0],
        features: []
    };
    
    function renderConfigurator() {
        configurator.innerHTML = `
            <div class="project-configurator">
                <div class="configurator-preview">
                    <div class="building-preview" id="building-preview">
                        <div class="building-visualization">
                            ${generateBuildingVisualization()}
                        </div>
                    </div>
                    <div class="estimated-cost">
                        <h4>Estimated Cost</h4>
                        <div class="cost-display">
                            <span class="currency">AED</span>
                            <span class="amount">${calculateEstimatedCost().toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                <div class="configurator-options">
                    ${Object.entries(options).map(([key, values]) => `
                        <div class="option-group">
                            <h5>${key.charAt(0).toUpperCase() + key.slice(1)}</h5>
                            <div class="option-buttons">
                                ${key === 'features' ? 
                                    values.map(value => `
                                        <button class="option-btn ${selectedOptions.features.includes(value) ? 'active' : ''}" 
                                                onclick="toggleFeature('${value}')">
                                            ${value}
                                        </button>
                                    `).join('') :
                                    values.map(value => `
                                        <button class="option-btn ${selectedOptions[key] === value ? 'active' : ''}" 
                                                onclick="selectOption('${key}', '${value}')">
                                            ${value}
                                        </button>
                                    `).join('')
                                }
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    function generateBuildingVisualization() {
        const floors = selectedOptions.floors;
        const style = selectedOptions.style.toLowerCase();
        
        return `
            <div class="building-structure ${style}">
                ${Array.from({length: floors}, (_, i) => `
                    <div class="floor floor-${floors - i}">
                        <div class="floor-content"></div>
                    </div>
                `).join('')}
                <div class="building-base"></div>
                ${selectedOptions.features.includes('Swimming Pool') ? '<div class="pool"></div>' : ''}
                ${selectedOptions.features.includes('Garden') ? '<div class="garden"></div>' : ''}
            </div>
        `;
    }
    
    function calculateEstimatedCost() {
        const baseCosts = {
            Villa: 500000,
            Apartment: 300000,
            Office: 400000,
            Warehouse: 200000
        };
        
        const styleMultipliers = {
            Modern: 1.2,
            Traditional: 1.0,
            Contemporary: 1.1,
            Industrial: 0.9
        };
        
        const featureCosts = {
            'Swimming Pool': 50000,
            'Garden': 20000,
            'Parking': 15000,
            'Solar Panels': 30000,
            'Smart Home': 40000
        };
        
        let cost = baseCosts[selectedOptions.type] * styleMultipliers[selectedOptions.style];
        cost *= selectedOptions.floors;
        
        selectedOptions.features.forEach(feature => {
            cost += featureCosts[feature] || 0;
        });
        
        return Math.round(cost);
    }
    
    // Global functions for option selection
    window.selectOption = function(key, value) {
        selectedOptions[key] = value;
        renderConfigurator();
    };
    
    window.toggleFeature = function(feature) {
        const index = selectedOptions.features.indexOf(feature);
        if (index > -1) {
            selectedOptions.features.splice(index, 1);
        } else {
            selectedOptions.features.push(feature);
        }
        renderConfigurator();
    };
    
    renderConfigurator();
}

// 3D Building Visualizer
function init3DVisualizer() {
    const visualizerContainer = document.getElementById('building-visualizer');
    if (!visualizerContainer) return;
    
    // Create interactive 3D building showcase
    const buildings = [
        { name: 'Modern Villa', model: '/static/models/villa.obj', price: 2500000 },
        { name: 'Office Complex', model: '/static/models/office.obj', price: 8500000 },
        { name: 'Apartment Building', model: '/static/models/apartment.obj', price: 12000000 }
    ];
    
    let currentBuilding = 0;
    
    function renderBuilding(index) {
        const building = buildings[index];
        visualizerContainer.innerHTML = `
            <div class="building-viewer">
                <div class="building-model" data-model="${building.model}">
                    <div class="model-placeholder">
                        <i class="fas fa-building fa-5x"></i>
                        <p>Click to rotate and explore</p>
                    </div>
                </div>
                <div class="building-info">
                    <h4>${building.name}</h4>
                    <p class="price">Starting from AED ${building.price.toLocaleString()}</p>
                    <button class="btn btn-primary" onclick="requestQuote('${building.name}')">Get Quote</button>
                </div>
            </div>
        `;
        
        // Add rotation controls
        addRotationControls(visualizerContainer);
    }
    
    function addRotationControls(container) {
        const model = container.querySelector('.building-model');
        let isRotating = false;
        let rotation = 0;
        
        model.addEventListener('mousedown', () => isRotating = true);
        model.addEventListener('mouseup', () => isRotating = false);
        model.addEventListener('mousemove', (e) => {
            if (isRotating) {
                rotation += e.movementX * 0.5;
                model.style.transform = `rotateY(${rotation}deg)`;
            }
        });
    }
    
    // Initialize with first building
    renderBuilding(0);
    
    // Auto-rotate through buildings
    setInterval(() => {
        currentBuilding = (currentBuilding + 1) % buildings.length;
        renderBuilding(currentBuilding);
    }, 10000);
}

// Construction Progress Simulator
function initConstructionSimulator() {
    const simulatorContainer = document.getElementById('construction-simulator');
    if (!simulatorContainer) return;
    
    const phases = [
        { name: 'Foundation', duration: 2000, icon: 'fas fa-layer-group' },
        { name: 'Structure', duration: 3000, icon: 'fas fa-building' },
        { name: 'Roofing', duration: 1500, icon: 'fas fa-home' },
        { name: 'Finishing', duration: 2500, icon: 'fas fa-paint-brush' },
        { name: 'Completion', duration: 1000, icon: 'fas fa-check-circle' }
    ];
    
    let currentPhase = 0;
    let progress = 0;
    
    function renderSimulator() {
        simulatorContainer.innerHTML = `
            <div class="construction-simulator">
                <div class="building-animation">
                    <div class="building-layers">
                        ${phases.map((phase, index) => `
                            <div class="layer layer-${index} ${index <= currentPhase ? 'active' : ''}">
                                <i class="${phase.icon}"></i>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="progress-info">
                    <h4>Construction Progress</h4>
                    <div class="current-phase">
                        <i class="${phases[currentPhase].icon}"></i>
                        <span>${phases[currentPhase].name}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(currentPhase + 1) / phases.length * 100}%"></div>
                    </div>
                    <p>${Math.round((currentPhase + 1) / phases.length * 100)}% Complete</p>
                </div>
            </div>
        `;
    }
    
    function animateConstruction() {
        renderSimulator();
        
        setTimeout(() => {
            currentPhase = (currentPhase + 1) % phases.length;
            if (currentPhase === 0) {
                // Reset animation
                setTimeout(animateConstruction, 2000);
            } else {
                animateConstruction();
            }
        }, phases[currentPhase].duration);
    }
    
    animateConstruction();
}