import Groq from 'groq-sdk'
import type { NewsItem } from '@/types/news'

let groqClient: Groq | null = null

function getGroq(): Groq | null {
  if (groqClient) return groqClient
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return null
  groqClient = new Groq({ apiKey })
  return groqClient
}

export async function summarizeNews(articles: NewsItem[]): Promise<string> {
  const groq = getGroq()
  if (!groq || articles.length === 0) return ''

  const articleList = articles
    .slice(0, 15)
    .map((a, i) => `${i + 1}. [${a.source}] ${a.title}`)
    .join('\n')

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content:
          'You are a concise news analyst. Summarize the following Japanese news headlines into 3-5 bullet points in both Japanese and English. Focus on the most impactful stories. Keep each bullet under 100 characters.',
      },
      {
        role: 'user',
        content: `Here are the latest news headlines from Japan:\n\n${articleList}\n\nProvide a brief summary.`,
      },
    ],
    max_tokens: 500,
    temperature: 0.3,
  })

  return response.choices[0]?.message?.content ?? ''
}
