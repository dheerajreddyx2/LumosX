const express = require('express');
const router = express.Router();
const axios = require('axios');

// POST /api/chatbot
router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, reply: 'No message provided.' });
  }

  // Provider flexibility: support OpenAI (default) or Gemini-style endpoints via env
  try {
    const provider = (process.env.CHATBOT_PROVIDER || 'openai').toLowerCase();

    if (provider === 'gemini') {
      const geminiUrl = process.env.GEMINI_API_URL; // full endpoint URL
      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiUrl) return res.status(500).json({ success: false, reply: 'Gemini API URL not configured.' });
      if (!geminiKey) return res.status(500).json({ success: false, reply: 'Gemini API key not configured.' });

      const sendKeyInQuery = (process.env.GEMINI_SEND_KEY_IN_QUERY || 'false').toLowerCase() === 'true';
      let url = geminiUrl;
      const axiosConfig = { headers: { 'Content-Type': 'application/json' } };
      if (sendKeyInQuery) url += (url.includes('?') ? '&' : '?') + `key=${encodeURIComponent(geminiKey)}`;
      else axiosConfig.headers['Authorization'] = `Bearer ${geminiKey}`;

      // Allow an optional system prompt to set the assistant persona (e.g. 'You are Lumos AI...')
      const systemPrompt = process.env.CHATBOT_SYSTEM_PROMPT;
      let promptText = message;
      if (systemPrompt) {
        // Prepend system prompt to the user message so Gemini sees it as context
        promptText = `${systemPrompt}\n\nUser: ${message}`;
      }

      const payload = { prompt: { text: promptText } };
      const response = await axios.post(url, payload, axiosConfig);

      // Try several shapes to extract reply
      let aiReply = null;
      if (response && response.data) {
        if (response.data.candidates && response.data.candidates[0] && response.data.candidates[0].content) aiReply = response.data.candidates[0].content;
        if (!aiReply && response.data.outputs && response.data.outputs[0] && response.data.outputs[0].content) {
          const out = response.data.outputs[0].content;
          aiReply = typeof out === 'string' ? out : (out.text || JSON.stringify(out));
        }
        if (!aiReply && response.data.result) aiReply = typeof response.data.result === 'string' ? response.data.result : JSON.stringify(response.data.result);
        if (!aiReply && response.data.output) aiReply = typeof response.data.output === 'string' ? response.data.output : JSON.stringify(response.data.output);
        if (!aiReply) aiReply = JSON.stringify(response.data).slice(0, 3000);
      }

      return res.json({ success: true, reply: aiReply });
    }

    // Default: OpenAI GPT-style
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(500).json({ success: false, reply: 'OpenAI API key not configured.' });
    }
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: process.env.CHATBOT_SYSTEM_PROMPT || 'You are a helpful assistant for an LMS platform.' },
          { role: 'user', content: message }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const aiReply = response.data.choices[0].message.content;
    res.json({ success: true, reply: aiReply });
  } catch (error) {
    // Log detailed error information for debugging (without exposing secrets)
    console.error('OpenAI/Gemini request error:', {
      message: error && error.message ? error.message : String(error),
      status: error && error.response && error.response.status ? error.response.status : null,
      responseData: error && error.response && error.response.data ? error.response.data : null,
    });

    const replyMessage = process.env.NODE_ENV === 'development'
      ? `AI service error: ${error && error.message ? error.message : 'unknown error'}`
      : 'AI service error. See server logs for details.';

    res.status(500).json({ success: false, reply: replyMessage });
  }
});

module.exports = router;
