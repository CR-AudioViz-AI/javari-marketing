// app/page.tsx — Javari Marketing
// Full-stack AI marketing suite
// CR AudioViz AI · EIN 39-3646201 · May 2026
"use client";
import { useState } from "react";

const TOOLS = [
  { href:"/social",    icon:"📱", label:"Social Posts",    desc:"Platform-native content for every network" },
  { href:"/email",     icon:"📧", label:"Email Campaigns", desc:"Subject lines to full campaigns" },
  { href:"/ads",       icon:"🎯", label:"Ad Copy",         desc:"Google, Facebook, LinkedIn ads" },
  { href:"/seo",       icon:"🔍", label:"SEO Content",     desc:"Blog posts and landing pages" },
  { href:"/brand",     icon:"✨", label:"Brand Voice",     desc:"Messaging framework and tone guide" },
  { href:"/strategy",  icon:"🗺️", label:"Strategy",        desc:"Marketing plans and campaign briefs" },
];

export default function MarketingHome() {
  const [brief, setBrief] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!brief.trim()) return;
    setLoading(true); setOutput("");
    try {
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          messages:[{role:"user", content:`Create a complete 30-day marketing plan for: "${brief}"

Include:
1. Target audience definition
2. Key messaging (3 core messages)
3. Channel strategy (which platforms, why)
4. Weekly content calendar overview
5. KPIs to track
6. Budget allocation guidance (% breakdown)

Be specific and actionable.`}],
          stream:false,
          systemOverride:"You are a senior marketing strategist with expertise in digital marketing, brand building, and growth. Create specific, actionable marketing plans that drive measurable results.",
        }),
      });
      const data = await res.json();
      setOutput(data?.choices?.[0]?.message?.content || data?.content || "Error.");
    } catch { setOutput("Connection error."); }
    setLoading(false);
  }

  return (
    <div style={{ minHeight:"100vh", background:"#040912", color:"#e2e8f0", fontFamily:"system-ui" }}>
      <nav style={{ background:"#1E3A5F", padding:"0 20px", height:52, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:18 }}>📣</span>
          <span style={{ fontWeight:800, color:"#00B4D8", fontSize:15 }}>Javari Marketing</span>
        </div>
        <a href="https://craudiovizai.com/auth/signup" style={{ background:"#FF0800", color:"#fff", borderRadius:7, padding:"5px 14px", fontSize:12, fontWeight:700, textDecoration:"none" }}>Sign Up Free</a>
      </nav>

      <section style={{ background:"linear-gradient(135deg,#1E3A5F,#040912)", padding:"56px 24px 48px", textAlign:"center" }}>
        <h1 style={{ fontSize:"clamp(26px,4vw,46px)", fontWeight:900, color:"#fff", margin:"0 0 14px", lineHeight:1.05 }}>
          Your Entire Marketing Team.<br /><span style={{ color:"#00B4D8" }}>Powered by AI.</span>
        </h1>
        <p style={{ color:"rgba(255,255,255,0.7)", fontSize:15, lineHeight:1.65, margin:"0 0 28px", maxWidth:500, marginLeft:"auto", marginRight:"auto" }}>
          Social posts, email campaigns, ad copy, SEO, strategy — everything your business needs to grow.
        </p>
      </section>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"32px 20px 0" }}>
        <div style={{ background:"#0F1F32", border:"1px solid rgba(0,180,216,0.12)", borderRadius:16, padding:"24px 28px", marginBottom:32 }}>
          <h2 style={{ margin:"0 0 14px", fontSize:16, fontWeight:800, color:"#fff" }}>Quick 30-Day Marketing Plan</h2>
          <div style={{ display:"flex", gap:10 }}>
            <input value={brief} onChange={e=>setBrief(e.target.value)} onKeyDown={e=>e.key==="Enter"&&generate()}
              placeholder="Describe your product, service, or business..."
              style={{ flex:1, background:"#172D48", border:"1px solid rgba(0,180,216,0.15)", borderRadius:8, padding:"11px 14px", color:"#e2e8f0", fontSize:13, outline:"none", fontFamily:"system-ui" }} />
            <button onClick={generate} disabled={loading||!brief.trim()}
              style={{ background: loading||!brief.trim() ? "#0F1F32":"#FF0800", color: loading||!brief.trim() ? "#374151":"#fff", border:"none", borderRadius:8, padding:"11px 18px", fontSize:13, fontWeight:700, cursor: loading||!brief.trim()?"not-allowed":"pointer", fontFamily:"system-ui", whiteSpace:"nowrap" }}>
              {loading ? "..." : "🗺️ Build Plan"}
            </button>
          </div>
          {output && (
            <div style={{ marginTop:16, padding:"14px 16px", background:"rgba(0,180,216,0.05)", border:"1px solid rgba(0,180,216,0.1)", borderRadius:10 }}>
              <pre style={{ margin:0, fontSize:13, color:"#e2e8f0", lineHeight:1.7, whiteSpace:"pre-wrap", fontFamily:"system-ui", maxHeight:400, overflowY:"auto" }}>{output}</pre>
            </div>
          )}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12, paddingBottom:72 }}>
          {TOOLS.map(t => (
            <a key={t.href} href={t.href} style={{ background:"#0F1F32", border:"1px solid rgba(0,180,216,0.08)", borderRadius:14, padding:"18px 16px", textDecoration:"none", display:"block" }}>
              <span style={{ fontSize:28, display:"block", marginBottom:8 }}>{t.icon}</span>
              <div style={{ fontWeight:700, fontSize:13, color:"#e2e8f0", marginBottom:4 }}>{t.label}</div>
              <div style={{ fontSize:11, color:"#6B7280", lineHeight:1.4 }}>{t.desc}</div>
            </a>
          ))}
        </div>
      </div>

      <footer style={{ borderTop:"1px solid rgba(0,180,216,0.08)", padding:"14px 24px", textAlign:"center" }}>
        <p style={{ color:"#374151", fontSize:11, margin:0 }}>© 2026 CR AudioViz AI, LLC — EIN: 39-3646201 · <a href="https://craudiovizai.com/auth/signup" style={{ color:"#FF0800", textDecoration:"none", fontWeight:600 }}>Sign Up Free</a></p>
      </footer>
    </div>
  );
}