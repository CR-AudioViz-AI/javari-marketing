// app/api/generate/route.ts — Marketing Generate API v5
// Routes through Javari AI (javariai.com) which is confirmed working
// Fallback: direct Groq, then Anthropic
// CR AudioViz AI · EIN 39-3646201 · June 2026
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 90;

const JAVARI_URL = process.env.NEXT_PUBLIC_JAVARI_AI_URL || "https://javariai.com";
const JAVARI_KEY = process.env.JAVARI_API_KEY || "";

async function callJavari(prompt: string): Promise<string> {
  const r = await fetch(JAVARI_URL + "/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: prompt }],
      stream: false,
      maxTier: "low",
    }),
    signal: AbortSignal.timeout(45000),
  });
  if (!r.ok) throw new Error("Javari AI error: " + r.status);
  const d = await r.json() as { choices?: Array<{ message?: { content?: string } }> };
  const text = d.choices?.[0]?.message?.content || "";
  if (!text) throw new Error("Javari AI returned empty response");
  return text;
}

async function callAnthropic(prompt: string): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY || "";
  if (!key) throw new Error("no anthropic key");
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(30000),
  });
  const d = await r.json() as { content?: Array<{ text?: string }> };
  return d.content?.[0]?.text || "";
}

async function callGroq(prompt: string): Promise<string> {
  const key = process.env.GROQ_API_KEY || "";
  if (!key) throw new Error("no groq key");
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile", max_tokens: 1500, temperature: 0.85,
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(28000),
  });
  const d = await r.json() as { choices?: Array<{ message?: { content?: string } }> };
  const text = d.choices?.[0]?.message?.content || "";
  if (!text) throw new Error("Groq returned empty");
  return text;
}

async function generate(prompt: string): Promise<string> {
  // Try Javari AI first (battle-tested, already works)
  try { return await callJavari(prompt); } catch (_) {}
  // Try Groq free
  try { return await callGroq(prompt); } catch (_) {}
  // Try Anthropic (key is plaintext in this project)
  try { return await callAnthropic(prompt); } catch (_) {}
  throw new Error("All AI providers failed");
}

const PLATFORM_RULES: Record<string, string> = {
  instagram:    "Instagram: Engaging hook in first line. Use emojis naturally. 5-10 hashtags at end on separate line. Max 2200 chars.",
  linkedin:     "LinkedIn: Professional yet personal. First 2 sentences critical (they appear before see more). Data or story-driven. End with question. Max 3000 chars.",
  twitter:      "X Twitter: 240 chars MAX total including hashtags. One punchy sentence. 1-2 hashtags.",
  facebook:     "Facebook: 2-3 paragraphs. Conversational storytelling. End with a question.",
  tiktok:       "TikTok: Ultra short, under 100 chars. Trendy Gen-Z language. 3-5 hashtags.",
  threads:      "Threads: Casual authentic voice. Under 400 chars. Like a tweet but friendlier.",
  youtube:      "YouTube Community: 2-3 sentences. Ask for engagement. Can be up to 300 chars.",
  pinterest:    "Pinterest: Keyword-rich, under 500 chars. Focus on outcome and benefit.",
  discord:      "Discord: Community-first. Brief and inviting. Under 300 chars.",
  telegram:     "Telegram: Clear announcement. Professional but direct. Under 400 chars.",
  bluesky:      "Bluesky: Thoughtful, under 280 chars. Similar to early Twitter.",
  mastodon:     "Mastodon: Open web friendly. Under 500 chars. No promotional language.",
  craudiovizai: "CR AudioViz AI: Highlight platform mission and impact. Inspire action. 2-3 paragraphs.",
  javariai:     "Javari AI: Showcase AI power. Specific feature highlight. Drive to javariai.com.",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      type: string; platform?: string; tone?: string; brief?: string;
      brand?: string; contentType?: string; title?: string; cadenceDays?: number;
    };

    const { type, platform = "instagram", tone = "professional",
            brief = "", brand = "CR AudioViz AI", contentType = "post" } = body;

    if (type === "social") {
      const rules = PLATFORM_RULES[platform] || "Write an engaging social media post.";
      const prompt =
        "You are a world-class social media copywriter. Write a single " + contentType + " for " + platform + ".

" +
        "Brand: " + brand + "
" +
        "Tone: " + tone + "
" +
        "Platform: " + rules + "

" +
        "Topic: " + brief + "

" +
        "Write only the post. No intro, no labels, no quotation marks around it. " +
        "Start directly with the content. Put hashtags at the end if appropriate.";

      const raw = await generate(prompt);

      // Extract hashtags from the end
      const lines = raw.trim().split("\n");
      const hashtagLine = lines[lines.length - 1]?.trim() || "";
      const isHashtagLine = hashtagLine.split(" ").every(w => w.startsWith("#") && w.length > 1);
      
      let content = raw.trim();
      let hashtags: string[] = [];
      
      if (isHashtagLine) {
        hashtags = hashtagLine.match(/#\w+/g) || [];
        content = lines.slice(0, -1).join("\n").trim();
      } else {
        // Extract any inline hashtags
        hashtags = (raw.match(/#\w+/g) || []).slice(0, 20);
      }

      return NextResponse.json({ content, hashtags, platform, tone });
    }

    if (type === "ebook_split") {
      const ebookContent = brief || "";
      const title = body.title || "Ebook";
      const cadenceDays = body.cadenceDays || 7;
      const wordCount = ebookContent.split(/\s+/).length;
      const targetChapters = Math.min(Math.max(Math.floor(wordCount / 400), 4), 12);

      const prompt =
        "Split this ebook into exactly " + targetChapters + " chapters for a weekly drip email campaign.\n" +
        "Title: " + title + "\n\n" +
        "Content:\n" + ebookContent.slice(0, 8000) + "\n\n" +
        "Return a JSON array with " + targetChapters + " objects, each having:\n" +
        "{ \"title\": \"chapter title\", \"content\": \"full chapter (300+ words)\", \"teaser\": \"one sentence cliffhanger\" }\n\n" +
        "Return ONLY the JSON array.";

      const raw = await generate(prompt);
      
      let chapters: Array<{ title: string; content: string; teaser: string }> = [];
      try {
        const start = raw.indexOf("[");
        const end = raw.lastIndexOf("]");
        if (start !== -1 && end > start) {
          chapters = JSON.parse(raw.slice(start, end + 1));
        }
      } catch (_) {
        chapters = [{ title: title, content: ebookContent.slice(0, 2000), teaser: "More coming next week!" }];
      }

      return NextResponse.json({ chapters: chapters || [], totalChapters: (chapters || []).length, cadenceDays });
    }

    return NextResponse.json({ error: "Unknown type: " + type }, { status: 400 });

  } catch (err) {
    console.error("[generate]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
