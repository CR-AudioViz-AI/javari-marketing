// app/api/generate/route.ts — Marketing Command Center
// COST LAW: Groq (free) -> OpenAI fallback
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
    } catch (_e) { /* fallthrough */ }
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
  instagram:    "Instagram (max 2200 chars): Hook in first line, emojis throughout, hashtags at end only",
  linkedin:     "LinkedIn (max 3000 chars): Professional but personal, first 210 chars critical for see more",
  twitter:      "X/Twitter: STRICT 280 chars total. Strong hook. Max 2 hashtags",
  facebook:     "Facebook: Conversational, storytelling, ask a question at the end",
  tiktok:       "TikTok: Gen-Z energy. Under 150 chars. 3-5 hashtags",
  threads:      "Threads: Casual, authentic. Under 450 chars",
  youtube:      "YouTube Community: Engaging question, 300-500 words",
  pinterest:    "Pinterest: Descriptive and keyword-rich, focus on value/outcome",
  discord:      "Discord: Community-focused, conversational",
  telegram:     "Telegram: Direct and informative",
  bluesky:      "Bluesky: Authentic, tech-forward. Under 300 chars",
  mastodon:     "Mastodon: Open web values, thoughtful and community-oriented",
  craudiovizai: "CR AudioViz AI platform: Professional brand voice, highlight platform value",
  javariai:     "Javari AI platform: Showcase AI capabilities and features",
};

function extractContent(raw: string): { content: string; hashtags: string[] } {
  // Try structured format first
  const idx = raw.indexOf("CONTENT:");
  const hIdx = raw.indexOf("HASHTAGS:");
  if (idx !== -1) {
    const contentStart = idx + "CONTENT:".length;
    const contentEnd = hIdx !== -1 ? hIdx : raw.length;
    const content = raw.slice(contentStart, contentEnd).trim();
    const hashtagStr = hIdx !== -1 ? raw.slice(hIdx + "HASHTAGS:".length).trim() : "";
    const hashtags = (hashtagStr.match(/#\w+/g) || []).slice(0, 20);
    return { content, hashtags };
  }
  // Fallback: whole response is content, extract hashtags from end
  const lines = raw.split("\n");
  const hashtagLines = lines.filter(l => l.trim().startsWith("#") && l.trim().split(" ").every(w => w.startsWith("#")));
  const contentLines = lines.filter(l => !hashtagLines.includes(l));
  const content = contentLines.join("\n").trim();
  const hashtags = hashtagLines.join(" ").match(/#\w+/g)?.slice(0, 20) || [];
  return { content: content || raw.trim(), hashtags };
}

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
      title?: string;
      cadenceDays?: number;
    };

    const {
      type, platform = "instagram", tone = "professional", brief = "",
      brand = "CR AudioViz AI", contentType = "post", maxChars = 2200
    } = body;

    if (type === "social") {
      const rules = PLATFORM_RULES[platform] || platform + " platform";
      const charNote = maxChars < 500 ? "CRITICAL: Must be under " + maxChars + " characters total including hashtags." : "";
      const prompt = [
        "You are a world-class social media strategist.",
        "",
        "Platform rules: " + rules,
        "Tone: " + tone,
        "Brand: " + brand,
        "Content type: " + contentType,
        "Brief: " + brief,
        charNote,
        "",
        "Write an optimized " + contentType + " for " + platform + ".",
        "",
        "Output format:",
        "CONTENT:",
        "[post content here]",
        "",
        "HASHTAGS:",
        "[hashtags only, space-separated, if appropriate for platform]"
      ].join("\n");

      const raw = await callAI(prompt);
      const { content, hashtags } = extractContent(raw);
      return NextResponse.json({ content, hashtags, platform, tone });
    }

    if (type === "ebook_split") {
      const ebookContent = brief || "";
      const title = body.title || "Ebook Series";
      const cadenceDays = body.cadenceDays || 7;
      const wordCount = ebookContent.split(/\s+/).length;
      const targetChapters = Math.min(Math.max(Math.floor(wordCount / 400), 4), 15);

      const prompt = [
        "You are an expert content strategist and email copywriter.",
        "",
        "Split this ebook into " + targetChapters + " engaging chapters for a drip email campaign.",
        'Title: "' + title + '"',
        "",
        "Ebook Content:",
        ebookContent.slice(0, 8000),
        "",
        "Create " + targetChapters + ' chapters as a JSON array. Each object must have:',
        '- title: compelling chapter title',
        '- content: full chapter text (400-600 words minimum)',
        '- teaser: one sentence cliffhanger for the next chapter',
        "",
        "Return ONLY a valid JSON array. No other text.",
      ].join("\n");

      const raw = await callAI(prompt, 4000);
      let chapters: Array<{ title: string; content: string; teaser: string }> = [];
      try {
        const start = raw.indexOf("[");
        const end = raw.lastIndexOf("]");
        if (start !== -1 && end !== -1) {
          chapters = JSON.parse(raw.slice(start, end + 1));
        }
      } catch (_e) {
        const sections = ebookContent.split("\n## ").filter((s: string) => s.trim().length > 100);
        chapters = sections.slice(0, targetChapters).map((s: string, i: number) => ({
          title: "Chapter " + (i + 1),
          content: s.trim().slice(0, 1500),
          teaser: "Stay tuned for the next chapter...",
        }));
      }
      if (!chapters.length) {
        chapters = [{ title: "Chapter 1: Introduction", content: ebookContent.slice(0, 1500), teaser: "More coming next week!" }];
      }
      return NextResponse.json({ chapters, totalChapters: chapters.length, cadenceDays });
    }

    return NextResponse.json({ error: "Unknown type: " + type }, { status: 400 });

  } catch (err) {
    console.error("[generate]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
