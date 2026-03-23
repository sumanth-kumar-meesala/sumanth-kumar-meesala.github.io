import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';

const projects = [
  {
    title: "AI-Assisted Development Workflow",
    description: "Integrated Claude Code, Cursor, and GitHub Copilot into the development lifecycle, significantly accelerating feature delivery and improving codebase quality across multiple services.",
    tags: ["AI Tools", "DevOps", "Cursor", "Claude"],
    metrics: ["Reduced dev time by 40%", "Fewer production bugs"]
  },
  {
    title: "Scalable Web Platform",
    description: "Architected a full-stack system utilizing Node.js, React, and AWS to serve high-volume traffic. Designed intuitive REST APIs and optimized database interactions.",
    tags: ["Node.js", "React", "AWS", "REST API"],
    metrics: ["High Availability", "Performance Boost"]
  }
];

const Projects = () => {
  return (
    <section id="projects" className="py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Project Highlights</h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="card bg-base-100 shadow-xl border border-base-300 hover:-translate-y-2 transition-transform duration-300 group"
            >
              <div className="card-body">
                <h3 className="card-title text-2xl group-hover:text-primary transition-colors">{project.title}</h3>
                <p className="text-base-content/70 mt-2 mb-4">{project.description}</p>
                
                <div className="space-y-4 mt-auto">
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, i) => (
                      <span key={i} className="badge badge-secondary badge-sm">{tag}</span>
                    ))}
                  </div>
                  
                  <div className="divider my-2">Impact</div>
                  
                  <ul className="text-sm list-disc list-inside text-base-content/80">
                    {project.metrics.map((metric, i) => (
                      <li key={i}>{metric}</li>
                    ))}
                  </ul>

                  <div className="card-actions justify-end mt-4">
                    <button className="btn btn-sm btn-ghost gap-2">
                      <FaGithub /> Code
                    </button>
                    <button className="btn btn-sm btn-primary gap-2">
                      <FaExternalLinkAlt /> Live
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
