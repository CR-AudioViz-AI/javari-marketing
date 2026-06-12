// app/api/generate/route.ts — Marketing Command Center
// Handles: social posts, ebook splits, email content
// COST LAW: Groq (free) → OpenAI fallback
// CR AudioViz AI · EIN 39-3646201 · June 2026
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 90;

async function callAI(prompt: string, maxTokens = 2500): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY || "";
  if (groqKey) {
    try {
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", max_tokens: maxTokens, temperature: 0.8,
          messages: [{ role: "user", content: prompt }] }),
        signal: AbortSignal.timeout(45000),
      });
      if (r.ok) {
        const d = await r.json() as { choices?: Array<{ message?: { content?: string } }> };
        const text = d.choices?.[0]?.message?.content || "";
        if (text) return text;
      }
    } catch {}
  }
  const openaiKey = process.env.OPENAI_API_KEY || "";
  if (!openaiKey) throw new Error("No AI providers configured");
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
    body: JSON.stringify({ model: "gpt-4o-mini", max_tokens: maxTokens, temperature: 0.8,
      messages: [{ role: "user", content: prompt }] }),
    signal: AbortSignal.timeout(45000),
  });
  const d = await r.json() as { choices?: Array<{ message?: { content?: string } }> };
  return d.choices?.[0]?.message?.content || "";
}

const PLATFORM_RULES: Record<string, string> = {
  instagram: "Instagram (max 2200 chars): Hook in first line, emojis throughout, hashtags at end only. Breaks for readability.",
  linkedin:  "LinkedIn (max 3000 chars): Professional but personal. First 210 chars must compel 'see more'. Data-driven. End with a question.",
  twitter:   "X/Twitter: STRICT 280 chars total. Strong hook. Max 2 hashtags. Punchy.",
  facebook:  "Facebook: Conversational. Storytelling. Ask a question at the end.",
  tiktok:    "TikTok: Gen-Z energy. Hook like 'POV:' or 'Tell me you...'. 3-5 hashtags.",
  threads:   "Threads: Casual, authentic. Like a text to a smart friend. Under 450 chars.",
  youtube:   "YouTube: Community post. Engaging question or poll idea. 300-500 words.",
  pinterest: "Pinterest: Descriptive and keyword-rich. Focus on the value/outcome.",
  discord:   "Discord: Community-focused. Conversational. Use @here sparingly.",
  telegram:  "Telegram: Direct and informative. Good for updates and announcements.",
  bluesky:   "Bluesky: Authentic, tech-forward. Under 300 chars.",
  mastodon:  "Mastodon: Open web values. Thoughtful and community-oriented.",
  craudiovizai: "CR AudioViz AI platform post: Professional brand voice. Highlight platform value. Link to relevant app.",
  javariai:  "Javari AI platform post: Showcase AI capabilities. Highlight new features or use cases.",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      type: string;
      platform?: string;
      tone?: string;
      brief?: string;
      brand?: string;
      contentType?: string;
      maxChars?: number;
      // ebook_split specific
      title?: string;
      cadenceDays?: number;
    };

    const { type, platform = "instagram", tone = "professional", brief = "",
            brand = "CR AudioViz AI", contentType = "post", maxChars = 2200 } = body;

    // ── Social post generation ──────────────────────────────────────────────
    if (type === "social") {
      const rules = PLATFORM_RULES[platform] || `${platform} platform`;
      const prompt = `You are a world-class social media strategist.

Platform: ${rules}
Tone: ${tone}
Brand: ${brand}
Content type: ${contentType}

Brief: ${brief}

Write an optimized ${contentType} for ${platform}. 
${maxChars < 500 ? `CRITICAL: Must be under ${maxChars} characters total.` : ""}

Output format:
CONTENT:
[post content here]

HASHTAGS:
[hashtags only, space-separated, if appropriate for platform]`;

      const raw = await callAI(prompt);
      const contentMatch = raw.match(/CONTENT:\s*([\s\S]+?)(?:HASHTAGS:|$)/i);
      const hashtagMatch = raw.match(/HASHTAGS:\s*([\s\S]+?)$/i);
      const content = contentMatch?.[1]?.trim() || raw.trim();
      const hashtags = (hashtagMatch?.[1]?.match(/#\w+/g) || []).slice(0, 20);

      return NextResponse.json({ content, hashtags, platform, tone });
    }

    // ── Ebook split into chapters ───────────────────────────────────────────
    if (type === "ebook_split") {
      const { title = "Ebook Series", brief: ebookContent = "", cadenceDays = 7 } = body;
      const wordCount = ebookContent.split(/\s+/).length;
      const targetChapters = Math.min(Math.max(Math.floor(wordCount / 400), 4), 15);

      const prompt = `You are an expert content strategist and email copywriter.

Split this ebook content into ${targetChapters} engaging chapters for a drip email campaign. Each chapter should take about ${cadenceDays} minutes to read.

Title: "${title}"

Ebook Content:
${ebookContent.slice(0, 8000)}

Create ${targetChapters} chapters. For each chapter output EXACTLY this JSON format (one per line in a JSON array):
{
  "title": "Chapter title (compelling, specific)",
  "content": "Full chapter content (400-600 words minimum)",
  "teaser": "One enticing sentence that makes people want the next chapter (cliffhanger or promise)"
}

Rules:
- Each chapter must stand alone and be valuable on its own
- End each chapter with a teaser that makes subscribers eagerly await the next
- Keep the original content but organize and enhance it
- Make titles specific and benefit-driven

Return ONLY a valid JSON array of chapter objects. No other text.`;

      const raw = await callAI(prompt, 4000);

      let chapters: Array<{ title: string; content: string; teaser: string }> = [];
      try {
        const jsonMatch = raw.match(/\[[\s\S]+\]/);
        chapters = JSON.parse(jsonMatch?.[0] || "[]");
      } catch {
        // Fallback: split by natural breaks
        const sections = ebookContent.split(/
#+\s+/).filter(s => s.trim().length > 100);
        chapters = sections.slice(0, targetChapters).map((s, i) => ({
          title: `Chapter ${i + 1}`,
          content: s.trim().slice(0, 1500),
          teaser: "Stay tuned for the next chapter where we dive deeper...",
        }));
      }

      if (!chapters.length) {
        chapters = [{ title: "Chapter 1: Introduction", content: ebookContent.slice(0, 1500), teaser: "More coming next week!" }];
      }

      return NextResponse.json({ chapters, totalChapters: chapters.length, cadenceDays });
    }

    return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });

  } catch (err) {
    console.error("[generate]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
