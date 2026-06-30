import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type Message = { role: 'user' | 'assistant'; content: string };
const contextWindow: Message[] = [];
const MAX_CONTEXT = 10;

app.post('/ask', async (req: Request, res: Response) => {
  const { prompt } = req.body as { prompt: string };
  if (!prompt?.trim()) {
    res.status(400).json({ error: 'prompt required' });
    return;
  }

  contextWindow.push({ role: 'user', content: prompt });
  if (contextWindow.length > MAX_CONTEXT) contextWindow.splice(0, contextWindow.length - MAX_CONTEXT);

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: 'You are an interview assistant. Help the candidate answer technical questions concisely and accurately. When given a screenshot or code snippet, analyze it and provide a clear solution.',
      messages: contextWindow,
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    contextWindow.push({ role: 'assistant', content: text });
    if (contextWindow.length > MAX_CONTEXT) contextWindow.splice(0, contextWindow.length - MAX_CONTEXT);

    res.json({ result: text });
  } catch (err) {
    console.error('Claude API error:', err);
    res.status(500).json({ error: 'LLM request failed' });
  }
});

app.post('/audio-chunk', async (req: Request, res: Response) => {
  const { chunk } = req.body as { chunk: string };
  if (!chunk) {
    res.status(400).json({ error: 'chunk required' });
    return;
  }

  try {
    await axios.post('http://localhost:8766/transcribe-chunk', { chunk });
    res.json({ ok: true });
  } catch (err) {
    // STT server might not be running yet
    res.json({ ok: false, reason: 'stt unavailable' });
  }
});

app.listen(5001, () => {
  console.log('Backend listening on port 5001');
});
