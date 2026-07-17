import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';

const experiences = [
  {
    role: "Senior AI Engineer",
    company: "Affle",
    period: "Jun 2025 – Present",
    achievements: [
      "Own and operate a 360° review platform in production — now used by 600+ employees across Affle's global offices — turning peer, manager, and self feedback into structured, LLM-synthesised review reports.",
      "Scaled the platform from initial rollout to a global user base with a focus on reliability, consistent structured outputs, evals, and report quality.",
      "Build and maintain production LLM features on Node.js + AWS with cost, latency, and observability controls.",
      "Converted from a contract engagement (delivered via DashAnalysis from Apr 2025) to a full-time Senior AI Engineer role in Jun 2026."
    ]
  },
  {
    role: "Senior Full-Stack & AI Engineer",
    company: "DashAnalysis Pty Ltd",
    period: "Aug 2020 – Jun 2026",
    achievements: [
      "Architected enterprise RAG pipelines (LangChain + LlamaIndex) over technical-doc corpora — ~40% retrieval-efficiency uplift; sub-minute citation-backed answers replaced multi-day analyst lookups.",
      "Designed and operates autonomous AI agents using LangGraph and CrewAI to automate analytics, reporting, and DynamoDB orchestration workflows.",
      "Integrated Claude (Sonnet / Opus) and GPT-4o into Node.js + AWS Serverless backends with retry, guardrails, structured outputs, and prompt caching — measurably reduced hallucinations and cost.",
      "Productionised Claude Code, Cursor, and Augment Code as the default workflow — shared CLAUDE.md / AGENTS.md context, custom slash commands, MCP-style tool integrations; ~30% faster feature cycle.",
      "Led React 18 + TypeScript front-end re-architecture, retiring legacy AngularJS modules; built real-time dashboards over WebSocket streams.",
      "Co-built Moose (beige.tech/solutions/moose) — enterprise product platform on AngularJS + AWS serverless (Lambda, CloudFormation, S3, Cognito, DynamoDB); acquired by Kaluza in 2025.",
      "Designed and built the 360° review platform (qrank.it) on AngularJS + Node.js + AWS with LLM-generated review reports — later deployed at scale across Affle (600+ employees).",
      "Delivered bespoke multi-step agentic workflows (LangGraph + Node.js) for SMB / enterprise clients — replaced manual SOPs with bounded, auditable autonomous flows."
    ]
  },
  {
    role: "Senior Full-Stack Developer",
    company: "Blaque Fracture Technologies Pty Ltd",
    period: "Jul 2019 – Jul 2020",
    achievements: [
      "Translated business requirements into MERN-stack applications (MongoDB, Express, React, Node.js); owned features end-to-end from spec through to production deployment.",
      "Designed responsive, state-driven React + Redux interfaces with reusable component patterns; standardised form validation, error handling, and loading states.",
      "Built and maintained REST APIs with JWT-based authentication, RBAC, and audit logging; wrote MongoDB aggregation pipelines and indexes for read-heavy workloads.",
      "Integrated third-party services (payment, email, file storage) behind clean adapter layers."
    ]
  },
  {
    role: "Software Developer",
    company: "Archimedes",
    period: "Nov 2018 – Feb 2019",
    achievements: [
      "Built React frontends bridged to Node.js + MongoDB backend services; converted design specs into production-ready, accessible components.",
      "Implemented OAuth 2.0 authentication and authorization with secure session handling and refresh-token rotation.",
      "Wrote modular Express middleware for request validation, rate limiting, and structured error responses."
    ]
  },
  {
    role: "Software Developer",
    company: "Blockfreight, Inc.",
    period: "Aug 2018 – Oct 2018",
    achievements: [
      "Engineered single-page applications using React and Redux integrated with RESTful Node.js / Express endpoints backed by MongoDB.",
      "Built domain list/detail flows, search, and filtering with focus on perceived performance — skeleton loaders, optimistic updates, paginated lists.",
      "Authored API services with consistent input validation, error contracts, and logging."
    ]
  },
  {
    role: "Software Developer",
    company: "ContenTerra Software Pvt. Ltd.",
    period: "Feb 2015 – Jun 2018",
    achievements: [
      "Delivered .NET enterprise web applications (ASP.NET MVC, WCF, Entity Framework, C#, HTML5, JavaScript) across the full SDLC.",
      "Designed data-access layers; optimised SQL Server queries with LINQ, indexed views, and stored procedures to meet enterprise SLA requirements.",
      "Implemented authentication and authorization (Forms / Windows / claims-based) and integrated with third-party SOAP and REST services.",
      "Reviewed pull requests, ramped team members on the codebase, and maintained engineering standards across release cycles."
    ]
  }
];

const Experience = () => {
  return (
    <section id="experience" className="py-8 px-6 relative">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-2xl glass-card mb-6 text-primary">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white">Experience</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
        </motion.div>

        <div className="relative border-l border-white/10 ml-4 md:ml-0 md:border-none">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-12 ml-10 md:ml-0 md:flex md:justify-between md:items-center relative group"
            >
              {/* Timeline dot */}
              <div className="absolute w-4 h-4 bg-background border-2 border-primary rounded-full -left-[49px] md:left-1/2 md:-ml-2 top-6 md:top-1/2 md:-translate-y-1/2 z-10 group-hover:bg-primary transition-colors shadow-[0_0_10px_rgba(139,92,246,0.5)]" />

              <div className={`md:w-5/12 ${index % 2 === 0 ? 'md:order-1 md:text-right md:pr-14' : 'md:order-3 md:pl-14'}`}>
                <div className="glow-border rounded-2xl">
                  <div className="glass-card p-8 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors relative overflow-hidden text-left">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />

                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{exp.role}</h3>
                    <h4 className="text-lg text-primary font-medium mb-3">{exp.company}</h4>

                    <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-secondary mb-5">
                      {exp.period}
                    </div>

                    <ul className="text-slate-400 space-y-2 list-none text-sm">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-secondary mt-1 opacity-70">▹</span>
                          <span className="leading-relaxed">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="hidden md:block md:w-2/12 md:order-2 self-stretch relative">
                <div className="w-[1px] h-full bg-white/10 absolute left-1/2 top-0 transform -translate-x-1/2" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
