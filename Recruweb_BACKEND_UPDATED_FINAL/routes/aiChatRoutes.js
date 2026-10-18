import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

const SYSTEM_PROMPT = `You are a professional HR and recruitment assistant for Recruweb (Recruweb Resources Private Limited), a leading HR solutions provider in India since 2015. 

Your role is to help users with:
1. Recruitment services - job поиск, posting jobs, applying for positions
2. HR services - payroll management, HRMS solutions, compliance
3. Industry manpower - supplying skilled workforce for manufacturing, construction, automotive, electronics, textile, food & beverages
4. Facility management - housekeeping, security, maintenance staff
5. Training & development programs
6. Contact information and business inquiries

Company Details:
- Name: Recruweb Resources Private Limited
- Services: Talent Acquisition, Payroll Management, HRMS Solutions, Training & Development, HR Outsourcing, Industry Manpower, Facility Management, Compliance & Advisory
- Location: H-112, Sector 63, Nearby Electronic City Metro Station, Noida, Uttar Pradesh, India
- Phone: +91 9336532636
- Email: info@recruweb.com
- Hours: Monday to Saturday, 9:30 AM to 6:30 PM
- Special: All workforce requirements fulfilled within a week!

Always be helpful, professional, and concise. Keep responses conversational and natural.`;

let conversationHistory = [];

router.post('/chat', async (req, res) => {
  try {
    const { message, clearHistory } = req.body;

    if (clearHistory) {
      conversationHistory = [];
      return res.json({ response: 'Conversation cleared. How can I help you today?' });
    }

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!openai) {
      return res.status(503).json({ 
        error: 'AI service not configured. Please add OPENAI_API_KEY to .env file.' 
      });
    }

    conversationHistory.push({ role: 'user', content: message });

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-10)
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';

    conversationHistory.push({ role: 'assistant', content: aiResponse });

    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20);
    }

    res.json({ response: aiResponse });
  } catch (error) {
    console.error('AI Chat Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get AI response. Please try again later.' 
    });
  }
});

export default router;