// app/api/generate/route.ts — Marketing Generate API
// Simple, reliable AI content generation for social posts and ebook splits
// COST LAW: Groq (free) -> OpenAI gpt-4o-mini fallback
// CR AudioViz AI · EIN 39-3646201 · June 2026
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 90;

async function callAI(prompt: string, maxTokens = 2000): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY || "";
  if (groqKey) {
    try {
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + groqKey },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: maxTokens,
          temperature: 0.85,
          messages: [{ role: "user", content: prompt }],
        }),
        signal: AbortSignal.timeout(45000),
      });
      if (r.ok) {
        const d = await r.json() as { choices?: Array<{ message?: { content?: string } }> };
        const text = d.choices?.[0]?.message?.content || "";
        if (text) return text;
      }
    } catch (_) { /* fallthrough */ }
  }
  const openaiKey = process.env.OPENAI_API_KEY || "";
  if (!openaiKey) throw new Error("No AI providers configured");
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + openaiKey },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: maxTokens,
      temperature: 0.85,
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(45000),
  });
  const d = await r.json() as { choices?: Array<{ message?: { content?: string } }> };
  return d.choices?.[0]?.message?.content || "";
}

const PLATFORM_RULES: Record<string, string> = {
  instagram:    "Instagram: Hook in first line. Emojis throughout. 5-10 hashtags at the very end after a blank line. Max 2200 chars.",
  linkedin:     "LinkedIn: Professional but personal. First 210 chars must make people want to click see more. Data or insight-driven. End with a question. Max 3000 chars.",
  twitter:      "X/Twitter: MUST be under 260 chars total. Strong punchy hook. Max 2 hashtags inline.",
  facebook:     "Facebook: Conversational storytelling. 2-4 paragraphs. Question at the end.",
  tiktok:       "TikTok: Under 150 chars. Gen-Z voice. 3-5 trending hashtags.",
  threads:      "Threads: Casual, authentic, like texting a friend. Under 450 chars.",
  youtube:      "YouTube Community: Engaging question or poll. 200-400 words.",
  pinterest:    "Pinterest: Keyword-rich description. Focus on outcome/benefit. Under 500 chars.",
  discord:      "Discord: Community-first. Casual and engaging.",
  telegram:     "Telegram: Clear and direct announcement style.",
  bluesky:      "Bluesky: Authentic and thoughtful. Under 280 chars.",
  mastodon:     "Mastodon: Open web values. Community-oriented.",
  craudiovizai: "CR AudioViz AI blog/platform post: Brand voice. Highlight unique value and community impact.",
  javariai:     "Javari AI platform post: Showcase AI power and features. Link to specific capability.",
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
      title?: string;
      cadenceDays?: number;
    };

    const { type, platform = "instagram", tone = "professional", brief = "",
            brand = "CR AudioViz AI", contentType = "post" } = body;

    if (type === "social") {
      const rules = PLATFORM_RULES[platform] || "Social media post. Be engaging and appropriate for the platform.";
      const prompt =
        "You are a world-class social media copywriter.\n" +
        "Brand: " + brand + "\n" +
        "Platform rules: " + rules + "\n" +
        "Tone: " + tone + "\n" +
        "Content type: " + contentType + "\n\n" +
        "Write the post for this brief:\n" + brief + "\n\n" +
        "Important:\n" +
        "- Write ONLY the post content and hashtags\n" +
        "- Do NOT include any labels, headers, or explanations\n" +
        "- Put hashtags on a separate line at the end (if appropriate for the platform)\n" +
        "- Make it scroll-stopping and authentic";

      const raw = await callAI(prompt);

      // Simple extraction: split content from hashtags
      const lines = raw.split("\n");
      const hashtagOnlyLines: string[] = [];
      const contentLines: string[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        const words = trimmed.split(/\s+/);
        const allHashtags = words.length > 0 && words.every(w => w.startsWith("#"));
        if (allHashtags && trimmed.length > 0) {
          hashtagOnlyLines.push(trimmed);
        } else {
          contentLines.push(line);
        }
      }

      // Also extract inline hashtags from content
      const content = contentLines.join("\n").trim();
      const inlineHashtags = content.match(/#\w+/g) || [];
      const separateHashtags = hashtagOnlyLines.join(" ").match(/#\w+/g) || [];
      const allHashtags = Array.from(new Set([...inlineHashtags, ...separateHashtags])).slice(0, 20);

      return NextResponse.json({ content, hashtags: allHashtags, platform, tone });
    }

    if (type === "ebook_split") {
      const ebookContent = brief || "";
      const title = body.title || "Ebook Series";
      const cadenceDays = body.cadenceDays || 7;
      const wordCount = ebookContent.split(/\s+/).length;
      const targetChapters = Math.min(Math.max(Math.floor(wordCount / 400), 4), 15);

      const prompt =
        "You are an expert content strategist splitting an ebook into a drip email campaign.\n\n" +
        "Ebook title: " + title + "\n" +
        "Create exactly " + targetChapters + " chapters.\n\n" +
        "Content to split:\n" + ebookContent.slice(0, 8000) + "\n\n" +
        "Return a JSON array. Each element must have these exact keys:\n" +
        "- title: compelling chapter title\n" +
        "- content: full chapter content (minimum 300 words)\n" +
        "- teaser: one sentence teaser/cliffhanger for the next chapter\n\n" +
        "Return ONLY the JSON array, nothing else.";

      const raw = await callAI(prompt, 4000);

      let chapters: Array<{ title: string; content: string; teaser: string }> = [];
      try {
        const start = raw.indexOf("[");
        const end = raw.lastIndexOf("]");
        if (start !== -1 && end > start) {
          chapters = JSON.parse(raw.slice(start, end + 1));
        }
      } catch (_) {
        // Fallback: one chapter with all content
        chapters = [{
          title: "Chapter 1: " + title,
          content: ebookContent.slice(0, 2000),
          teaser: "More valuable insights coming next week...",
        }];
      }

      if (!Array.isArray(chapters) || chapters.length === 0) {
        chapters = [{
          title: title,
          content: ebookContent.slice(0, 2000),
          teaser: "Continue reading next week...",
        }];
      }

      return NextResponse.json({ chapters, totalChapters: chapters.length, cadenceDays });
    }

    return NextResponse.json({ error: "Unknown type: " + type }, { status: 400 });

  } catch (err) {
    console.error("[generate]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
