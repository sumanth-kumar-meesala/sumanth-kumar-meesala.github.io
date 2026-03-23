import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';

const experiences = [
  {
    role: "Senior Full Stack Developer",
    company: "DashAnalysis",
    period: "Aug 2021 – Mar 2026",
    achievements: [
      "Built scalable web applications using Node.js and React.js → improved system performance by ~30%",
      "Designed RESTful APIs using Express.js → reduced frontend-backend latency",
      "Implemented AWS-based deployments (EC2, S3) → increased system reliability and uptime",
      "Introduced AI-assisted workflows (Claude Code, Cursor, Copilot) → improved dev speed by ~40%",
      "Optimized frontend using Redux and modern React patterns"
    ]
  },
  {
    role: "Full Stack Developer",
    company: "Blaque Fracture Technologies",
    period: "Feb 2019 – Aug 2021",
    achievements: [
      "Developed full-stack applications using Angular and Node.js",
      "Built modular frontend architecture → improved reusability",
      "Integrated backend APIs with UI → ensured seamless data flow",
      "Worked with MongoDB → optimized query performance"
    ]
  },
  {
    role: "Software Engineer",
    company: "Archimedes",
    period: "Jan 2017 – Feb 2019",
    achievements: [
      "Developed web applications using Angular and Node.js",
      "Built reusable UI components",
      "Implemented REST APIs",
      "Maintained SQL Server databases"
    ]
  },
  {
    role: "Software Engineer",
    company: "Blockfreight",
    period: "Jun 2015 – Dec 2016",
    achievements: [
      "Developed backend services using Node.js",
      "Built APIs for logistics workflows",
      "Integrated frontend components"
    ]
  },
  {
    role: "Software Engineer",
    company: "ContenTerra Software",
    period: "Jun 2013 – May 2015",
    achievements: [
      "Built web applications using JavaScript and backend technologies",
      "Developed UI components and assisted in database design"
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
                    {/* Subtle gradient corner */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />

                    <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{exp.role}</h3>
                    <h4 className="text-lg text-primary font-medium mb-3">{exp.company}</h4>

                    <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-secondary mb-5">
                      {exp.period}
                    </div>

                    <ul className={`text-slate-400 space-y-2 list-none text-sm`}>
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
                {/* Desktop Center Line */}
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
