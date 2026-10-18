import { useState, useRef, useEffect } from 'react';
import novaAiAvatar from '../assets/voice-assistant-avatar.jpg';

const FAQ_RESPONSES = {
  greeting: [
    "Hello! Welcome to Recruweb. How can I assist you today?",
    "Hi there! I'm your voice assistant. What can I help you with?",
    "Welcome to Recruweb! Ready to help you find the perfect solution.",
    "Hey! Great to see you. How may I help you today?"
  ],
  services: "At Recruweb, we offer Talent Acquisition, Payroll Management, HRMS Solutions, Training & Development, HR Outsourcing, Industry Manpower, Facility Management, and Compliance & Advisory services. We fulfill all requirements within a week!",
  recruitment: "Our Recruitment Services include End-to-end hiring, Executive search, Bulk hiring, Contract staffing, and Permanent placement. We serve all major cities across India.",
  industry: "Our Industry Manpower service provides skilled workforce for Manufacturing, Construction, Automotive, Electronics, Textile, and Food & Beverages sectors. Workers deployed within a week!",
  facility: "Facility Management services include Housekeeping, Security Personnel, Maintenance, Pantry & Admin staff. All managed with our integrated HRMS solution.",
  payroll: "Our Payroll Management services cover Salary processing, Compliance management, Statutory filings (PF, ESIC), and Employee benefits administration with 100% accuracy.",
  hrms: "Our HRMS Solutions include Employee database management, Attendance tracking, Performance management, Leave management, and Real-time reporting dashboard.",
  training: "Our Training & Development services offer Skill assessment, Onboarding training, Leadership development, and Compliance training. All customized for your workforce needs.",
  compliance: "Our Compliance & Advisory services cover Labor law adherence, PF & ESIC compliance, Bonus & gratuity management, and Regular audit support. Stay worry-free with our expert team.",
  pricing: "Our pricing is flexible and based on your specific workforce requirements. Contact us for a customized quote - we offer competitive rates with no hidden costs!",
  contact: "You can reach us at info@recruweb.com or call +91 9336532636. You can also visit our contact page at recruweb.com slash contact. We're here to help!",
  address: "Our office is at H-112, Sector 63, Nearby Electronic City Metro Station, Noida, Uttar Pradesh, India. Visit us during business hours!",
  hours: "We are open Monday to Saturday, from 9:30 AM to 6:30 PM. Sundays we are closed. What else would you like to know?",
  about: "Recruweb Resources Private Limited is a leading HR solutions provider specializing in recruitment services, payroll management, industry manpower, and HR outsourcing across India since 2015.",
  jobs: "We have positions across all sectors! Browse our jobs at recruweb.com slash jobs. We offer Full-time, Part-time, Remote, Internship, and Contract opportunities.",
  postJob: "Posting a job is easy! Visit our post-job page to create your listing. You'll reach thousands of qualified candidates. Your requirement will be fulfilled within a week!",
  apply: "Ready to apply? Visit our jobs page at recruweb.com slash jobs. Browse openings, upload your resume, and apply with just a few clicks. AI-powered screening included!",
  industries: "We serve Manufacturing, Construction, Automotive, Electronics, Textile, Food & Beverages, Hospitality, and more. All sectors covered across India!",
  manpowersupply: "We provide manpower supply to companies all over India. With our integrated HRMS solution, all types of workforce, payroll, and management requirements are fulfilled within a week.",
  contract: "Our Contractual Hiring service offers temporary and project-based workforce. Flexible duration from 1 month to 1 year with easy scaling options.",
  hospitality: "Hospitality Staffing includes Hotel Staff, Restaurant Crew, Event Support, and Guest Services. All managed with HRMS for seamless operations.",
  outsource: "Our HR Outsourcing service handles complete HR functions including Payroll, Compliance, Employee management, and Statutory filings. Focus on your core business while we manage HR!",
  quickhelp: "I can help you with: Our services, Recruitment process, Contact details, Pricing, Job listings, Posting jobs, or any general inquiry. Just ask!",
  thanks: "You're welcome! Is there anything else I can help you with? Feel free to ask about our services, jobs, or contact details.",
  goodbye: "Thank you for visiting Recruweb! Have a great day. Don't hesitate to reach out if you need any help. Goodbye!",
  default: "I'm here to help! Ask me about our services, recruitment, pricing, contact details, job listings, or anything else about Recruweb."
};

const getResponse = (userMessage) => {
  const msg = userMessage.toLowerCase();
  
  if (/\b(hello|hi|hey|good morning|good evening|greetings)\b/i.test(msg)) {
    return FAQ_RESPONSES.greeting[Math.floor(Math.random() * FAQ_RESPONSES.greeting.length)];
  }
  if (/\b(thanks|thank you|thx)\b/i.test(msg)) return FAQ_RESPONSES.thanks;
  if (/\b(bye|goodbye|see you|take care)\b/i.test(msg)) return FAQ_RESPONSES.goodbye;
  if (/\b(service|solution|offer)\b/i.test(msg)) return FAQ_RESPONSES.services;
  if (/\b(industry|industrial|manufacturing|construction|factory)\b/i.test(msg)) return FAQ_RESPONSES.industry;
  if (/\b(facility|housekeeping|security|maintenance)\b/i.test(msg)) return FAQ_RESPONSES.facility;
  if (/\b(recruit|hiring|hire)\b/i.test(msg)) return FAQ_RESPONSES.recruitment;
  if (/\b(manpower|workforce|worker|staff)\b/i.test(msg)) return FAQ_RESPONSES.manpowersupply;
  if (/\b(payroll|salary|wage)\b/i.test(msg)) return FAQ_RESPONSES.payroll;
  if (/\b(hrms|software|system|platform)\b/i.test(msg)) return FAQ_RESPONSES.hrms;
  if (/\b(train|development|skill)\b/i.test(msg)) return FAQ_RESPONSES.training;
  if (/\b(compliance|advisory|law|labor)\b/i.test(msg)) return FAQ_RESPONSES.compliance;
  if (/\b(outsource|outsourcing)\b/i.test(msg)) return FAQ_RESPONSES.outsource;
  if (/\b(price|cost|quote|rate|charge|budget)\b/i.test(msg)) return FAQ_RESPONSES.pricing;
  if (/\b(contact|reach|talk|call|email|message)\b/i.test(msg)) return FAQ_RESPONSES.contact;
  if (/\b(address|location|office|where|map)\b/i.test(msg)) return FAQ_RESPONSES.address;
  if (/\b(hour|time|open|close|business|schedule)\b/i.test(msg)) return FAQ_RESPONSES.hours;
  if (/\b(about|company|who|recruweb|ardhnarishwar)\b/i.test(msg)) return FAQ_RESPONSES.about;
  if (/\b(job|work|vacancy|opening|position)\b/i.test(msg)) {
    if (/\b(post|create|add|list)\b/i.test(msg)) return FAQ_RESPONSES.postJob;
    if (/\b(apply|application)\b/i.test(msg)) return FAQ_RESPONSES.apply;
    return FAQ_RESPONSES.jobs;
  }
  if (/\b(sector|industry|type)\b/i.test(msg)) return FAQ_RESPONSES.industries;
  if (/\b(contract|temporary|project|basis)\b/i.test(msg)) return FAQ_RESPONSES.contract;
  if (/\b(hospitality|hotel|restaurant|event)\b/i.test(msg)) return FAQ_RESPONSES.hospitality;
  if (/\b(help|assist|what can you do|capability|feature)\b/i.test(msg)) return FAQ_RESPONSES.quickhelp;
  
  return FAQ_RESPONSES.default;
};

const API_URL = (import.meta.env.VITE_API_URL || `${window.location.origin}/api`).replace(/\/+$/, '');

const QUICK_QUESTIONS = [
  { label: 'What services do you offer?', query: 'What services do you offer?', icon: 'service' },
  { label: 'Tell me about recruitment', query: 'Tell me about recruitment', icon: 'recruit' },
  { label: 'How can I post a job?', query: 'How can I post a job?', icon: 'post' },
  { label: 'Contact information', query: 'What is your contact information?', icon: 'contact' },
  { label: 'What are your working hours?', query: 'What are your working hours?', icon: 'hours' },
  { label: 'Tell me about your company', query: 'Tell me about your company', icon: 'about' }
];

const SERVICE_ICONS = {
  service: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 16v-4M12 8h.01"/>
    </svg>
  ),
  recruit: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  post: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
  contact: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  hours: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  about: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
};

const VoiceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isSupported] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showActions, setShowActions] = useState(false);
  const [aiMode, setAiMode] = useState('gpt');
  const inputRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const messagesEndRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const noSpeechTimerRef = useRef(null);
  const manualStopRef = useRef(false);

  // How long to wait after the user stops talking before auto-sending the answer.
  const SILENCE_DELAY_MS = 1400;
  // How long to wait for the user to start talking at all before giving up.
  const NO_SPEECH_LIMIT_MS = 8000;

  const clearVoiceTimers = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (noSpeechTimerRef.current) {
      clearTimeout(noSpeechTimerRef.current);
      noSpeechTimerRef.current = null;
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) synthRef.current.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
      clearVoiceTimers();
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      addMessage('system', 'Speech recognition is not supported. Please use Chrome or Edge browser.');
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    finalTranscriptRef.current = '';
    manualStopRef.current = false;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setCurrentTranscript('');
      clearVoiceTimers();
      // If the user never says anything, stop listening on our own instead
      // of leaving the mic open forever.
      noSpeechTimerRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (e) {}
        }
      }, NO_SPEECH_LIMIT_MS);
    };

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = finalTranscriptRef.current;
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece + ' ';
          finalTranscriptRef.current = finalTranscript;
        } else {
          interimTranscript += transcriptPiece;
        }
      }
      
      setCurrentTranscript(finalTranscript || interimTranscript);

      // The user is actively talking, so we no longer need the
      // "did they say anything at all" timeout.
      if (noSpeechTimerRef.current) {
        clearTimeout(noSpeechTimerRef.current);
        noSpeechTimerRef.current = null;
      }

      // Every time new speech comes in, push the silence timer back.
      // Once it fires uninterrupted, the user has finished talking, so
      // stop listening and reply right away instead of waiting for a
      // manual click.
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (e) {}
        }
      }, SILENCE_DELAY_MS);
    };

    recognitionRef.current.onerror = (event) => {
      setIsListening(false);
      clearVoiceTimers();
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      let errorMsg = 'Sorry, I didn\'t catch that. Please try again.';
      if (event.error === 'not-allowed') errorMsg = 'Microphone access denied. Please allow microphone access.';
      else if (event.error === 'network') errorMsg = 'Network error. Please check your internet connection.';
      addMessage('system', errorMsg);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      clearVoiceTimers();
      const transcript = finalTranscriptRef.current.trim();
      if (transcript && !manualStopRef.current) {
        processVoiceQuery(transcript);
      }
      finalTranscriptRef.current = '';
      manualStopRef.current = false;
    };

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.log('Recognition error:', e);
    }
  };

  const stopListening = () => {
    // Manually stopping the mic still sends whatever was said so far —
    // we just mark it so the async onend handler (fired by .stop()) doesn't
    // process the same transcript a second time.
    manualStopRef.current = true;
    clearVoiceTimers();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);

    const transcript = finalTranscriptRef.current.trim() || currentTranscript.trim();
    finalTranscriptRef.current = '';
    if (transcript) {
      processVoiceQuery(transcript);
    }
  };

  const processVoiceQuery = async (query) => {
    addMessage('user', query);
    setCurrentTranscript('');
    setIsTyping(true);
    setShowActions(false);
    
    try {
      const response = await fetch(`${API_URL}/ai-chat/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });
      
      const data = await response.json();
      setIsTyping(false);
      
      if (data.response) {
        addMessage('assistant', data.response);
        if (soundEnabled) {
          speakResponse(data.response);
        }
      } else if (data.error) {
        const fallback = getResponse(query);
        addMessage('assistant', fallback);
        if (soundEnabled) speakResponse(fallback);
      }
    } catch (error) {
      setIsTyping(false);
      const fallback = getResponse(query);
      addMessage('assistant', fallback);
      if (soundEnabled) speakResponse(fallback);
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim()) {
      processVoiceQuery(textInput.trim());
      setTextInput('');
    }
  };

  const handleQuickQuestion = (question) => {
    processVoiceQuery(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (textInput.trim()) {
        processVoiceQuery(textInput.trim());
        setTextInput('');
      }
    }
  };

  const speakResponse = (text) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      const voices = synthRef.current.getVoices();
      const englishVoice = voices.find(voice => voice.lang.startsWith('en')) || voices[0];
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      synthRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) synthRef.current.cancel();
    setIsSpeaking(false);
  };

  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { role, content, id: Date.now() + Math.random() }]);
  };

  const toggleListening = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (isListening) {
      stopListening();
    } else {
      if (!isOpen) {
        setIsOpen(true);
        setIsMinimized(false);
      } else if (isMinimized) {
        setIsMinimized(false);
      }
      startListening();
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const clearChat = () => {
    setMessages([]);
    setShowActions(false);
  };

  const closeWidget = () => {
    stopSpeaking();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsOpen(false);
    setIsMinimized(false);
    setMessages([]);
    setIsListening(false);
    setCurrentTranscript('');
    setTextInput('');
    setShowActions(false);
  };

  if (!isSupported) {
    return null;
  }

  return (
    <>
      <div className="voice-assistant-container">
        {isOpen && !isMinimized && (
          <div className="voice-chat-widget">
            <div className="voice-chat-header">
              <div className="voice-header-avatar">
                <div className="va-avatar-ring">
                  <img src={novaAiAvatar} alt="Recruweb Assistant" className="va-avatar-img" width="40" height="40" />
                  {isListening && <div className="pulse-ring"></div>}
                  {isSpeaking && <div className="sound-wave"></div>}
                </div>
              </div>
              <div className="voice-header-info">
                <div className="header-title-row">
                  <h3>Recruweb Assistant</h3>
                  <span className="ai-badge">AI</span>
                </div>
                <span className="voice-status-indicator">
                  {isListening ? (
                    <span className="status-listening">
                      <span className="status-dot pulse"></span>
                      Listening...
                    </span>
                  ) : isSpeaking ? (
                    <span className="status-speaking">
                      <span className="status-dot sound"></span>
                      Speaking
                    </span>
                  ) : (
                    <span className="status-online">
                      <span className="status-dot"></span>
                      Online & Ready
                    </span>
                  )}
                </span>
              </div>
              <div className="voice-header-actions">
                <button className="header-action-btn" onClick={() => setSoundEnabled(!soundEnabled)} title={soundEnabled ? 'Mute' : 'Unmute'}>
                  {soundEnabled ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                      <line x1="23" y1="9" x2="17" y2="15"/>
                      <line x1="17" y1="9" x2="23" y2="15"/>
                    </svg>
                  )}
                </button>
                {messages.length > 0 && (
                  <button className="header-action-btn" onClick={clearChat} title="Clear chat">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                )}
                <button className="header-action-btn" onClick={toggleMinimize} title="Minimize">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
                <button className="voice-close-btn" onClick={closeWidget}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="voice-chat-messages">
              <div className="messages-bg-pattern"></div>
              
              {messages.length === 0 && (
                <div className="voice-welcome">
                  <div className="welcome-illustration">
                    <div className="illustration-circle">
                      <img src={novaAiAvatar} alt="Recruweb Assistant" className="welcome-avatar-img" />
                    </div>
                    <div className="welcome-particles">
                      <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                    </div>
                  </div>
                  <h4>Hello! I'm your Recruweb Assistant</h4>
                  <p>Ask me anything about our HR services, jobs, or contact us!</p>
                  
                  <div className="topic-chips">
                    <span className="topic-label">Quick Topics</span>
                    <div className="chips-row">
                      {['Services', 'Jobs', 'Contact', 'Pricing', 'Manpower'].map((topic) => (
                        <span key={topic} className="topic-chip">{topic}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="voice-hints">
                    {QUICK_QUESTIONS.map((q, i) => (
                      <button key={i} onClick={() => handleQuickQuestion(q.query)} className="hint-clickable">
                        <span className="hint-icon">{SERVICE_ICONS[q.icon]}</span>
                        <span className="hint-text">{q.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`voice-message ${msg.role}`}>
                  {msg.role === 'assistant' && (
                    <div className="voice-msg-avatar">
                      <img src={novaAiAvatar} alt="Recruweb Assistant" width="40" height="40" style={{ borderRadius: '50%', display: 'block', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div className="voice-bubble">
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="voice-message assistant">
                  <div className="voice-msg-avatar">
                    <img src={novaAiAvatar} alt="Recruweb Assistant" width="40" height="40" style={{ borderRadius: '50%', display: 'block', objectFit: 'cover' }} />
                  </div>
                  <div className="voice-bubble typing">
                    <div className="typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                    <span className="typing-text">Assistant is thinking...</span>
                  </div>
                </div>
              )}

              {isListening && (
                <div className="voice-message user">
                  <div className="voice-bubble listening">
                    <div className="recording-indicator">
                      <span className="rec-dot"></span>
                      <span className="rec-dot"></span>
                      <span className="rec-dot"></span>
                    </div>
                    <p>{currentTranscript || 'Listening…'}</p>
                    {currentTranscript && (
                      <span className="listening-hint">I'll reply as soon as you pause</span>
                    )}
                  </div>
                </div>
              )}

              {isSpeaking && !isTyping && (
                <div className="voice-speaking-indicator">
                  <div className="waveform">
                    <span></span><span></span><span></span><span></span><span></span>
                    <span></span><span></span><span></span>
                  </div>
                  <span className="speaking-text">Assistant is speaking</span>
                  <button className="stop-speaking-btn" onClick={stopSpeaking}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="6" width="12" height="12" rx="2"/>
                    </svg>
                    Stop
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="voice-chat-footer">
              <form className="voice-chat-input" onSubmit={handleTextSubmit}>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type your message..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isListening || isSpeaking}
                />
                <button 
                  type="button"
                  className={`mic-btn ${isListening ? 'active' : ''}`}
                  onClick={toggleListening}
                  disabled={isSpeaking}
                  title={isListening ? 'Stop recording' : 'Start voice recording'}
                >
                  {isListening ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="6" width="12" height="12" rx="2"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                  )}
                </button>
                <button type="submit" disabled={!textInput.trim() || isListening || isSpeaking} className="send-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </form>
              <div className="input-hints">
                <span>Press Enter to send</span>
                <span className="hint-divider">|</span>
                <span>Click mic for voice</span>
              </div>
            </div>
          </div>
        )}

        <button 
          className={`voice-btn-new ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''} ${isOpen && !isMinimized ? 'hidden' : ''}`}
          onClick={toggleListening}
          title={isListening ? 'Stop listening' : isSpeaking ? 'Stop speaking' : 'Open voice assistant'}
        >
          <div className="voice-btn-glow"></div>
          <div className="voice-btn-inner voice-avatar-toggle-inner">
            <img src={novaAiAvatar} alt="Recruweb AI voice assistant" className="voice-toggle-avatar" />
            {(isSpeaking || isListening) && (
              <span className="voice-state-icon" aria-hidden="true">{isListening ? "●" : "Ⅱ"}</span>
            )}
          </div>
          {isListening && (
            <div className="voice-waves">
              <span></span><span></span><span></span><span></span><span></span>
            </div>
          )}
          {!isListening && !isSpeaking && (
            <div className="voice-btn-ring"></div>
          )}
        </button>
      </div>

      <style>{`
.voice-assistant-container {
          position: fixed;
          bottom: 28px;
          left: 28px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 16px;
        }

        @keyframes voice-slide {
          from { opacity: 0; transform: scale(0.85) translateY(30px) translateX(-30px); }
          to { opacity: 1; transform: scale(1) translateY(0) translateX(0); }
        }

        .voice-chat-widget {
          width: 380px;
          height: 520px;
          background: #ffffff;
          border-radius: 28px;
          box-shadow: 
            0 30px 60px -15px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(16, 185, 129, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: voice-slide 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes voice-slide {
          from { opacity: 0; transform: scale(0.85) translateY(30px) translateX(-30px); }
          to { opacity: 1; transform: scale(1) translateY(0) translateX(0); }
        }

        .voice-chat-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 20px;
          background: linear-gradient(135deg, #047857 0%, #059669 40%, #10b981 70%, #34d399 100%);
          color: white;
          position: relative;
          overflow: hidden;
        }

        .voice-chat-header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 60%);
          animation: header-shine 10s linear infinite;
        }

        @keyframes header-shine {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .voice-header-avatar {
          position: relative;
          z-index: 1;
        }

        .va-avatar-ring {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
        }

        .va-avatar-img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          display: block;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .pulse-ring {
          position: absolute;
          width: 70px;
          height: 70px;
          border: 3px solid rgba(255,255,255,0.6);
          border-radius: 50%;
          animation: pulse-expand 1.5s ease-out infinite;
        }

        @keyframes pulse-expand {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .sound-wave {
          position: absolute;
          width: 80px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .sound-wave::before,
        .sound-wave::after {
          content: '';
          position: absolute;
          width: 60px;
          height: 25px;
          border: 2px solid rgba(255,255,255,0.7);
          border-radius: 50%;
          animation: sound-pulse 1s ease-in-out infinite;
        }

        .sound-wave::after {
          animation-delay: 0.5s;
        }

        @keyframes sound-pulse {
          0%, 100% { transform: scale(0.8); opacity: 0.3; }
          50% { transform: scale(1.3); opacity: 0.9; }
        }

        .voice-header-info {
          flex: 1;
          z-index: 1;
        }

        .header-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }

        .header-title-row h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .ai-badge {
          background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.15));
          padding: 3px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          backdrop-filter: blur(10px);
        }

        .voice-status-indicator {
          font-size: 13px;
          opacity: 0.95;
          font-weight: 500;
        }

        .status-dot {
          display: inline-block;
          width: 10px;
          height: 10px;
          background: #86efac;
          border-radius: 50%;
          margin-right: 8px;
          animation: status-glow 2s ease-in-out infinite;
          box-shadow: 0 0 8px rgba(134, 239, 172, 0.6);
        }

        .status-dot.pulse {
          background: #fca5a5;
          animation: blink 0.8s ease-in-out infinite;
          box-shadow: 0 0 8px rgba(252, 165, 165, 0.6);
        }

        .status-dot.sound {
          background: #93c5fd;
          animation: sound-wave-anim 0.5s ease-in-out infinite;
        }

        @keyframes status-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }

        @keyframes sound-wave-anim {
          0%, 100% { transform: scaleX(1); }
          50% { transform: scaleX(1.5); }
        }

        .voice-header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 1;
        }

        .header-action-btn {
          width: 34px;
          height: 34px;
          border: none;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(10px);
          border-radius: 10px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .header-action-btn:hover {
          background: rgba(255,255,255,0.22);
          transform: scale(1.05);
        }

        .voice-close-btn {
          width: 34px;
          height: 34px;
          border: none;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          border-radius: 10px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          z-index: 1;
        }

        .voice-close-btn:hover {
          background: rgba(255,255,255,0.28);
          transform: scale(1.08);
        }

        .voice-chat-messages {
          flex: 1;
          min-height: 280px;
          max-height: 340px;
          padding: 18px 20px;
          overflow-y: auto;
          background: linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%);
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
        }

        .messages-bg-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100px;
          background: linear-gradient(180deg, rgba(16, 185, 129, 0.04) 0%, transparent 100%);
          pointer-events: none;
        }

        .voice-chat-messages::-webkit-scrollbar {
          width: 8px;
        }

        .voice-chat-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .voice-chat-messages::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #d1d5db, #9ca3af);
          border-radius: 4px;
        }

        .voice-chat-messages::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #9ca3af, #6b7280);
        }

        .voice-welcome {
          text-align: center;
          padding: 24px 20px;
          color: #6b7280;
          position: relative;
          z-index: 1;
        }

        .welcome-illustration {
          position: relative;
          margin-bottom: 16px;
        }

        .illustration-circle {
          display: inline-block;
          animation: float 3s ease-in-out infinite;
        }

        .welcome-avatar-img {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          display: block;
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .welcome-particles {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .welcome-particles span {
          position: absolute;
          width: 8px;
          height: 8px;
          background: linear-gradient(135deg, #10b981, #34d399);
          border-radius: 50%;
          opacity: 0.4;
        }

        .welcome-particles span:nth-child(1) { top: 5%; left: 10%; animation: particle-float 4.5s ease-in-out infinite; }
        .welcome-particles span:nth-child(2) { top: 15%; right: 15%; animation: particle-float 4s ease-in-out infinite 0.5s; }
        .welcome-particles span:nth-child(3) { bottom: 35%; left: 5%; animation: particle-float 5s ease-in-out infinite 1s; }
        .welcome-particles span:nth-child(4) { bottom: 25%; right: 10%; animation: particle-float 3.5s ease-in-out infinite 1.5s; }
        .welcome-particles span:nth-child(5) { top: 45%; left: 0%; animation: particle-float 4.2s ease-in-out infinite 2s; }
        .welcome-particles span:nth-child(6) { top: 30%; right: 5%; animation: particle-float 3.8s ease-in-out infinite 0.8s; }
        .welcome-particles span:nth-child(7) { bottom: 15%; left: 15%; animation: particle-float 4.8s ease-in-out infinite 1.2s; }

        @keyframes particle-float {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          50% { transform: translate(8px, -14px) scale(1.3); opacity: 0.7; }
        }

        .voice-welcome h4 {
          margin: 0 0 10px;
          font-size: 24px;
          font-weight: 800;
          color: #1f2937;
          letter-spacing: -0.5px;
        }

        .voice-welcome p {
          margin: 0 0 24px;
          font-size: 15px;
          line-height: 1.7;
          color: #6b7280;
        }

        .topic-chips {
          margin-bottom: 24px;
        }

        .topic-label {
          font-size: 12px;
          font-weight: 700;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 1px;
          display: block;
          margin-bottom: 12px;
        }

        .chips-row {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .topic-chip {
          padding: 8px 16px;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.06));
          color: #059669;
          border-radius: 24px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid rgba(16, 185, 129, 0.25);
          transition: all 0.2s;
        }

        .topic-chip:hover {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1));
          transform: translateY(-2px);
        }

        .voice-hints {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: stretch;
        }

        .voice-hints .hint-clickable {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 20px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          font-size: 15px;
          color: #374151;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          box-shadow: 0 2px 10px rgba(0,0,0,0.04);
        }

        .voice-hints .hint-clickable .hint-icon {
          color: #10b981;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .voice-hints .hint-clickable .hint-text {
          flex: 1;
        }

        .voice-hints .hint-clickable:hover {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border-color: #10b981;
          transform: translateX(6px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
        }

        .voice-hints .hint-clickable:hover .hint-icon {
          color: white;
        }

        .voice-message {
          display: flex;
          gap: 14px;
          animation: msg-fade 0.35s ease;
        }

        @keyframes msg-fade {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .voice-message.user {
          flex-direction: row-reverse;
        }

        .voice-msg-avatar {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          filter: drop-shadow(0 3px 6px rgba(16, 185, 129, 0.25));
        }

        .voice-bubble {
          max-width: 78%;
          padding: 16px 22px;
          border-radius: 20px;
          font-size: 15px;
          line-height: 1.7;
          background: white;
          color: #1f2937;
          box-shadow: 0 3px 15px rgba(0,0,0,0.08);
          position: relative;
        }

        .voice-bubble p {
          margin: 0;
        }

        .voice-message.user .voice-bubble {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-bottom-right-radius: 8px;
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
        }

        .voice-message.assistant .voice-bubble {
          border-bottom-left-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .voice-bubble.listening {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(220, 38, 38, 0.06));
          border: 2px dashed #ef4444;
          color: #dc2626;
        }

        .listening-hint {
          display: block;
          margin-top: 8px;
          font-size: 11.5px;
          font-weight: 600;
          color: #b91c1c;
          opacity: 0.75;
          letter-spacing: 0.2px;
        }

        .recording-indicator {
          display: flex;
          gap: 5px;
          margin-bottom: 10px;
        }

        .rec-dot {
          width: 10px;
          height: 10px;
          background: #ef4444;
          border-radius: 50%;
          animation: rec-blink 1s ease-in-out infinite;
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
        }

        .rec-dot:nth-child(2) { animation-delay: 0.2s; }
        .rec-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes rec-blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.8); }
        }

        .voice-bubble.typing {
          padding: 18px 28px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .typing-indicator {
          display: flex;
          gap: 5px;
          align-items: center;
        }

        .typing-indicator span {
          width: 10px;
          height: 10px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 50%;
          animation: typing-bounce 1.4s ease-in-out infinite;
        }

        .typing-indicator span:nth-child(2) { animation-delay: 0.15s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.3s; }

        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-10px); opacity: 1; }
        }

        .typing-text {
          font-size: 13px;
          color: #9ca3af;
          font-style: italic;
        }

        .voice-speaking-indicator {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(29, 78, 216, 0.06));
          border-radius: 16px;
          font-size: 14px;
          color: #3b82f6;
          margin-left: 58px;
          border: 1px solid rgba(59, 130, 246, 0.25);
        }

        .waveform {
          display: flex;
          align-items: center;
          gap: 3px;
          height: 20px;
        }

        .waveform span {
          width: 4px;
          background: linear-gradient(180deg, #3b82f6, #60a5fa);
          border-radius: 2px;
          animation: waveform 0.9s ease-in-out infinite;
        }

        .waveform span:nth-child(1) { animation-delay: 0s; height: 8px; }
        .waveform span:nth-child(2) { animation-delay: 0.1s; height: 14px; }
        .waveform span:nth-child(3) { animation-delay: 0.2s; height: 10px; }
        .waveform span:nth-child(4) { animation-delay: 0.3s; height: 18px; }
        .waveform span:nth-child(5) { animation-delay: 0.4s; height: 12px; }
        .waveform span:nth-child(6) { animation-delay: 0.5s; height: 8px; }
        .waveform span:nth-child(7) { animation-delay: 0.6s; height: 14px; }
        .waveform span:nth-child(8) { animation-delay: 0.7s; height: 10px; }

        @keyframes waveform {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1); }
        }

        .speaking-text {
          flex: 1;
          font-weight: 500;
        }

        .stop-speaking-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .stop-speaking-btn:hover {
          background: #2563eb;
          transform: scale(1.03);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .voice-chat-footer {
          padding: 14px 18px 12px;
          background: white;
          border-top: 1px solid #f3f4f6;
        }

        .voice-chat-input {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .voice-chat-input input {
          flex: 1;
          padding: 14px 22px;
          border: 2px solid #e5e7eb;
          border-radius: 28px;
          font-size: 15px;
          outline: none;
          transition: all 0.25s;
          background: #f9fafb;
        }

        .voice-chat-input input:focus {
          border-color: #10b981;
          background: white;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.12);
        }

        .voice-chat-input input:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }

        .voice-chat-input input::placeholder {
          color: #9ca3af;
        }

        .mic-btn {
          width: 48px;
          height: 48px;
          border: none;
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          color: #6b7280;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .mic-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          transform: scale(1.08);
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.35);
        }

        .mic-btn.active {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          animation: mic-pulse 1.2s ease-in-out infinite;
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
        }

        @keyframes mic-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .mic-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .send-btn {
          width: 48px;
          height: 48px;
          border: none;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          flex-shrink: 0;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
        }

        .send-btn:hover:not(:disabled) {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
        }

        .send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .input-hints {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 12px;
          font-size: 12px;
          color: #9ca3af;
        }

        .hint-divider {
          opacity: 0.5;
        }

        .voice-btn-new {
          position: relative;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            0 10px 35px rgba(16, 185, 129, 0.45),
            0 0 0 0 rgba(16, 185, 129, 0.4);
          transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .voice-btn-new:hover {
          transform: scale(1.15);
          box-shadow: 
            0 14px 45px rgba(16, 185, 129, 0.55),
            0 0 0 10px rgba(16, 185, 129, 0.12);
        }

        .voice-btn-new.hidden {
          opacity: 0;
          pointer-events: none;
          transform: scale(0.8);
        }

        .voice-btn-new.listening {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          box-shadow: 0 10px 35px rgba(239, 68, 68, 0.5);
        }

        .voice-btn-new.speaking {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          box-shadow: 0 10px 35px rgba(59, 130, 246, 0.5);
        }

        .voice-btn-glow {
          position: absolute;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.3);
          animation: glow-pulse 3s ease-in-out infinite;
        }

        .voice-btn-new:hover .voice-btn-glow {
          animation: none;
          transform: scale(1.4);
          opacity: 0.5;
        }

        @keyframes glow-pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.4); opacity: 0; }
        }

        .voice-btn-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid rgba(16, 185, 129, 0.35);
          border-radius: 50%;
          animation: ring-expand 2.5s ease-out infinite;
        }

        @keyframes ring-expand {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        .voice-btn-inner {
          position: relative;
          z-index: 1;
        }

        .voice-avatar-toggle-inner {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: visible;
        }

        .voice-toggle-avatar {
          width: 60px;
          height: 60px;
          display: block;
          object-fit: cover;
          object-position: center top;
          border-radius: 50%;
          border: 3px solid rgba(255,255,255,.95);
          box-sizing: border-box;
          box-shadow: 0 4px 16px rgba(5,80,60,.28);
        }

        .voice-state-icon {
          position: absolute;
          right: -2px;
          bottom: -2px;
          width: 20px;
          height: 20px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(15,23,42,.9);
          color: #fff;
          font: 900 10px/1 Arial, sans-serif;
          border: 2px solid #fff;
          box-shadow: 0 3px 10px rgba(0,0,0,.22);
        }

        .voice-waves {
          position: absolute;
          display: flex;
          gap: 5px;
          bottom: -16px;
        }

        .voice-waves span {
          width: 5px;
          background: linear-gradient(to top, #ef4444, transparent);
          border-radius: 4px;
          animation: wave-anim 0.8s ease-in-out infinite;
        }

        .voice-waves span:nth-child(1) { animation-delay: 0s; }
        .voice-waves span:nth-child(2) { animation-delay: 0.12s; }
        .voice-waves span:nth-child(3) { animation-delay: 0.24s; }
        .voice-waves span:nth-child(4) { animation-delay: 0.36s; }
        .voice-waves span:nth-child(5) { animation-delay: 0.48s; }

        @keyframes wave-anim {
          0%, 100% { height: 8px; }
          50% { height: 24px; }
        }

        @media (max-width: 768px) {
          .voice-assistant-container {
            bottom: 16px;
            right: 16px;
          }

          .voice-chat-widget {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            max-height: 100%;
            border-radius: 0;
          }

          .voice-btn-new {
            position: fixed;
            bottom: 100px;
            left: 16px;
            width: 62px;
            height: 62px;
          }
        }
      `}</style>
    </>
  );
};

export default VoiceAssistant;