import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Youtube, ExternalLink } from 'lucide-react';

const stack = [
  { label: "Next.js 16", hot: true },
  { label: "TypeScript", hot: true },
  { label: "Claude Agent SDK", tool: true },
  { label: "Hugging Face Parler-TTS", tool: true },
  { label: "Remotion" },
  { label: "PostgreSQL" },
  { label: "YouTube OAuth" },
  { label: "Instagram OAuth" },
  { label: "Tailwind / DaisyUI" },
  { label: "Cheerio · RSS" }
];

const features = [
  "Multi-channel content (Astrology · Current Affairs · Trending) with channel-specific AI personas",
  "Multi-language TTS — English, Hindi, Kannada, Malayalam, Tamil, Telugu",
  "Word-level animated subtitles synced to TTS audio",
  "Batch render of all 12 zodiac signs in one run",
  "Auto-publish to YouTube + Instagram with metadata, playlists, scheduling",
  "Vedic Jatakam: lagna, dasha, dosha + PDF export",
  "Live YouTube channel running unattended end-to-end"
];

const Projects = () => {
  return (
    <section id="projects" className="py-8 px-6 relative">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-12 text-center"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-2xl glass-card mb-6 text-secondary">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white">Personal Project</h2>
          <p className="text-slate-400 max-w-xl text-sm md:text-base">A solo AI side project that ships videos to a real audience, built end-to-end on a typed full-stack with open-source models.</p>
          <div className="w-24 h-1 bg-gradient-to-r from-secondary to-primary rounded-full mt-5"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="glow-border rounded-3xl"
        >
          <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h3 className="text-2xl md:text-3xl font-bold text-white">Telugu Astrology Content Factory</h3>
                <span className="text-[11px] tracking-[.14em] font-mono uppercase px-3 py-1 rounded-full text-secondary border border-secondary/30 bg-secondary/10">500+ subs · 2 lakh+ views</span>
                <span className="text-[11px] tracking-[.14em] font-mono uppercase px-3 py-1 rounded-full text-primary border border-primary/30 bg-primary/10">Live in production</span>
              </div>

              <div className="grid md:grid-cols-5 gap-8 items-start">
                <div className="md:col-span-3 space-y-4 text-slate-300 leading-relaxed">
                  <p>
                    End-to-end AI content factory I designed, built, and run solo. Automates the full <strong className="text-white">script &rarr; TTS &rarr; video &rarr; publish</strong> pipeline for a Telugu astrology YouTube channel.
                  </p>
                  <p>
                    <strong className="text-white">Claude Agent SDK</strong> generates persona-driven scripts; a custom <strong className="text-white">Hugging Face Parler-TTS</strong> server (plus Edge TTS) produces multi-language audio across six Indian languages; <strong className="text-white">Remotion</strong> renders videos with word-level animated subtitles synced to TTS; the whole pipeline auto-publishes to YouTube via OAuth.
                  </p>
                  <p>
                    Trend discovery scrapes Google Trends / YouTube / Twitter / News for content ideas. Festival-aware (panchangam) plus a Vedic Jatakam birth-chart generator with PDF export.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {stack.map((s, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                          s.hot
                            ? 'bg-primary/10 border-primary/40 text-white'
                            : s.tool
                              ? 'bg-secondary/10 border-secondary/40 text-secondary'
                              : 'bg-surface border-white/10 text-slate-300 hover:text-white hover:border-primary/50'
                        }`}
                      >
                        {s.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="rounded-2xl p-5 bg-white/[.03] border border-white/10">
                    <div className="flex items-center gap-2 mb-3 text-xs font-mono uppercase tracking-widest text-slate-500">
                      <Sparkles className="w-3.5 h-3.5" /> What it does
                    </div>
                    <ul className="space-y-2.5 text-sm text-slate-300">
                      {features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                          <span className="text-primary mt-[3px]">▸</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap gap-2">
                      <a
                        href="https://www.youtube.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
                      >
                        <Youtube className="w-4 h-4" /> YouTube channel
                      </a>
                      <a
                        href="https://github.com/sumanth-kumar-meesala/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
                      >
                        <ExternalLink className="w-4 h-4" /> GitHub
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
