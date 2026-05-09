import React from 'react';
import { motion } from 'framer-motion';
import { Boxes } from 'lucide-react';

const skillCategories = [
  {
    title: "AI-Native Engineering",
    skills: ["LLM application engineering", "RAG pipelines", "Agentic workflows", "Multi-agent orchestration", "Tool / function calling", "Structured output", "Evals & guardrails", "Prompt engineering", "Context engineering"]
  },
  {
    title: "AI Tooling (Daily Driver)",
    skills: ["Claude Code", "Cursor", "GitHub Copilot", "Augment Code", "MCP servers", "Autonomous coding agents", "AI code review", "CLAUDE.md / AGENTS.md"]
  },
  {
    title: "LLM Stack",
    skills: ["Anthropic Claude", "Claude Agent SDK", "OpenAI GPT-4o", "Llama", "Hugging Face", "Parler-TTS", "LangChain", "LangGraph", "LlamaIndex", "CrewAI", "Pinecone", "ChromaDB", "FAISS", "pgvector"]
  },
  {
    title: "Languages & Runtime",
    skills: ["TypeScript", "JavaScript (ES6+)", "Node.js", "Python (LLM tooling)", "C# (legacy)"]
  },
  {
    title: "Backend & Cloud",
    skills: ["Node.js", "Express", "Next.js", "AWS Lambda", "Serverless", "CloudFormation", "Cognito", "API Gateway", "S3", "DynamoDB", "PostgreSQL", "MongoDB", "REST", "WebSockets", "OAuth 2.0", "JWT", "Docker", "CI/CD"]
  },
  {
    title: "Frontend",
    skills: ["React 18", "AngularJS", "Redux", "Zustand", "Tailwind", "Material UI", "DaisyUI", "Framer Motion", "Remotion", "Real-time UIs"]
  }
];

const Skills = () => {
  return (
    <section id="skills" className="py-8 px-6 relative">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-3 rounded-2xl glass-card mb-6 text-secondary">
            <Boxes className="w-6 h-6" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white">Core Skills</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-secondary to-primary rounded-full"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-white">
          {skillCategories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="glow-border rounded-2xl h-full"
            >
              <div className="glass-card rounded-2xl p-6 h-full flex flex-col items-start border border-white/5 transition-transform hover:-translate-y-1 duration-300">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {category.title}
                </h3>
                <div className="flex flex-wrap gap-2.5 mt-auto">
                  {category.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 text-sm font-medium rounded-lg bg-surface border border-white/10 text-slate-300 hover:text-white hover:border-primary/50 transition-colors shadow-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
