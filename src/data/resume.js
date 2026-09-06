// Source of truth: Sumanth_Resume_V2 (latest parsed version).
// Keep this file in sync with the résumé; components render from it.

export const profile = {
  name: 'Sumanth Kumar Meesala',
  firstName: 'Sumanth',
  middleName: 'Kumar',
  lastName: 'Meesala',
  role: 'Senior AI Engineer',
  discipline: 'LLM & Agent Applications',
  location: 'Melbourne, VIC',
  citizenship: 'Australian Citizen',
  email: 'meesalasumanth1@gmail.com',
  linkedin: 'https://linkedin.com/in/sumanthkumarmeesala',
  linkedinLabel: 'in/sumanthkumarmeesala',
  github: 'https://github.com/sumanth-kumar-meesala/',
  githubLabel: 'sumanth-kumar-meesala',
  resume: '/Sumanth_Resume.pdf',
  detailedCv: '/Sumanth_Detailed_CV.pdf',
  lead:
    'Eleven years building production Node.js, React and Angular systems — now an AI-native product engineer shipping LLM-powered features, autonomous agents and multi-step agentic workflows on AWS.',
  sub:
    'At Affle: core contributor to Blueprix, an MCP-enabled agent-orchestration platform; owner of Qrank, a 360° review platform running for 600+ employees globally; mentor to the AI team.',
};

export const stats = [
  { value: '11', suffix: '+', label: 'Years in production' },
  { value: '600', suffix: '+', label: 'Qrank users, global' },
  { value: '600', unit: 'K', suffix: '+', label: 'Views — solo AI channel' },
  { value: '~40', unit: '%', label: 'RAG retrieval uplift' },
];

export const about = {
  headline: 'AI agents as engineering teammates',
  lead:
    'Given explicit responsibilities, context and guardrails — reviewable like any other part of the system, not a black box bolted on the side.',
  paragraphs: [
    'I started in .NET and AngularJS in 2015 and spent a decade shipping full-stack product systems. Today I build the LLM layer on top of that same discipline — typed JavaScript services on AWS, tested, observable, and gated on evals rather than vibes.',
    'Strongest where unclear product requirements meet hard system constraints. I own 0→1 prototypes through to hardened production — and I mentor the engineers who maintain them.',
  ],
  dailyDriver: ['Claude Code', 'Cursor', 'GitHub Copilot', 'Augment Code', 'MCP servers'],
  pillars: [
    {
      n: '01',
      title: 'Agent orchestration',
      body:
        'State machines, MCP tool integration, checkpoint/resume, multi-agent handoff. Bounded and auditable, not open-ended.',
    },
    {
      n: '02',
      title: 'Retrieval that holds up',
      body:
        'LangChain and LlamaIndex pipelines over technical corpora — citation-backed answers in under a minute where analysts took days.',
    },
    {
      n: '03',
      title: 'Evals and observability',
      body:
        'LLM-as-judge evals, prompt versioning, Langfuse and CloudWatch tracing, cost and latency budgets. Releases gate on regressions.',
    },
    {
      n: '04',
      title: 'Mentoring & standards',
      body:
        'Code review, pairing and design reviews; shared CLAUDE.md / AGENTS.md context standards and AI-tooling onboarding across the team.',
    },
  ],
};

export const skillGroups = [
  {
    n: '01',
    title: 'AI-Native Engineering',
    emphasis: true,
    items: [
      'Generative AI & LLM application development',
      'Retrieval-Augmented Generation (RAG)',
      'Agentic AI',
      'Multi-agent systems & orchestration',
      'Tool / function calling',
      'Structured output',
      'LLM evaluation (evals, LLM-as-judge)',
      'Prompt & context engineering',
      'Guardrails',
    ],
  },
  {
    n: '02',
    title: 'AI Tooling — daily driver',
    emphasis: true,
    items: [
      'Claude Code',
      'Cursor',
      'GitHub Copilot',
      'Augment Code',
      'MCP servers',
      'Autonomous coding agents',
      'AGENTS.md / CLAUDE.md context engineering',
      'N8N',
    ],
  },
  {
    n: '03',
    title: 'LLM Stack',
    emphasis: true,
    items: [
      'OpenAI GPT-4o',
      'Anthropic Claude (Sonnet / Opus)',
      'Llama',
      'Hugging Face',
      'Amazon Bedrock (Converse, InvokeModel, Titan Embeddings, Guardrails)',
      'LangChain',
      'LangGraph',
      'LlamaIndex',
      'CrewAI',
      'Pinecone',
      'ChromaDB',
      'FAISS',
      'pgvector',
    ],
  },
  {
    n: '04',
    title: 'Languages',
    items: ['TypeScript', 'JavaScript (ES6+)', 'Node.js', 'Python', 'C#', 'HTML5', 'CSS'],
  },
  {
    n: '05',
    title: 'Full-Stack Development',
    items: [
      'React 18',
      'Next.js',
      'Redux / Zustand',
      'Tailwind',
      'Material UI',
      'Angular',
      'Express.js',
      'REST / API design',
      'WebSockets',
      'SSE',
      'Event-driven Node.js microservices',
      'Distributed systems',
    ],
  },
  {
    n: '06',
    title: 'Cloud & DevOps',
    items: [
      'AWS (Lambda, EC2, API Gateway, S3, CloudFront, EventBridge, SQS, ECS, RDS, IAM)',
      'AWS CDK',
      'CloudFormation',
      'Serverless Framework',
      'Infrastructure as Code',
      'Docker',
      'GitHub Actions',
      'GitLab CI',
      'Bitbucket Pipelines',
      'Git',
    ],
  },
  {
    n: '07',
    title: 'Data',
    items: [
      'PostgreSQL',
      'DynamoDB',
      'MongoDB',
      'SQL Server',
      'MySQL',
      'Supabase',
      'Schema design & migrations',
    ],
  },
  {
    n: '08',
    title: 'Testing',
    items: ['Jest', 'Vitest', 'Playwright', 'Unit / integration / end-to-end', 'TDD'],
  },
  {
    n: '09',
    title: 'Security & Responsible AI',
    items: [
      'OAuth 2.0',
      'JWT',
      'RBAC',
      'Least-privilege IAM',
      'Secrets Manager / SSM',
      'Bedrock Guardrails',
      'PII redaction',
      'Prompt-injection defenses',
    ],
  },
  {
    n: '10',
    title: 'Observability',
    items: ['CloudWatch', 'Structured logging', 'Metrics', 'Tracing', 'Langfuse'],
  },
  {
    n: '11',
    title: 'Leadership & Methods',
    items: [
      'Mentoring',
      'Code review',
      'Stakeholder management',
      'Agile / Scrum',
      'System & software architecture',
      'Technical leadership',
      'JIRA',
    ],
  },
];

export const work = [
  {
    key: 'A',
    meta: 'Affle · 2026–',
    name: 'Blueprix',
    kicker: 'Agent-orchestration platform',
    body: [
      'State-machine-based, MCP-enabled platform for shipping reliable production agents. I built the MCP servers and tool integration, multi-agent orchestration, checkpoint/resume state handling and RAG context management, and standardised model access on Amazon Bedrock.',
      "I own its CI/CD — GitHub Actions and Bitbucket Pipelines, pre-commit linting, secret scanning, least-privilege IAM, secrets via SSM — gating every release.",
    ],
    stack: ['MCP', 'Bedrock', 'Node.js', 'Langfuse'],
  },
  {
    key: 'B',
    meta: 'qrank.it.com',
    name: 'Qrank',
    kicker: '360° review platform',
    href: 'https://qrank.it.com',
    body: [
      'Designed, built and still operate it: a multi-tenant, LLM-powered review platform that turns peer, manager and self feedback into structured review reports.',
      "Started at DashAnalysis on Angular, Node.js and AWS; now deployed across Affle's global offices and used by 600+ employees.",
    ],
    figures: [{ value: '600', suffix: '+', label: 'Employees, global offices' }],
    stack: ['Angular', 'Node.js', 'AWS', 'Multi-tenant'],
  },
  {
    key: 'C',
    meta: 'Solo · Founder',
    name: 'Content Factory',
    kicker: 'Autonomous video pipeline',
    href: 'https://www.youtube.com/@RashiPhalalu_Telugu/',
    repo: 'https://github.com/sumanth-kumar-meesala/content-factory',
    body: [
      'An end-to-end AI content system I built and run alone. Claude Agent SDK writes persona-driven scripts, a Parler-TTS server voices them in six Indian languages, Remotion renders word-level animated subtitles, and the pipeline auto-publishes to YouTube.',
    ],
    figures: [
      { value: '600', unit: 'K', suffix: '+', label: 'Views' },
      { value: '2.2', unit: 'K', suffix: '+', label: 'Subscribers' },
      { value: '4', label: 'Months' },
    ],
    stack: ['Next.js', 'Agent SDK', 'Parler-TTS', 'Remotion'],
  },
];

export const alsoShipped = [
  {
    name: 'Moose',
    body:
      'Enterprise product platform on Angular and AWS serverless, infrastructure as code with AWS CDK and Serverless Framework. Acquired by Kaluza in 2025.',
  },
  {
    name: 'Moonee Valley Council',
    body:
      'Regulated public-sector systems on C#, .NET Core, Entity Framework and SQL Server, deployed on Azure/IIS.',
  },
];

export const experience = [
  {
    from: 'Jul 2026 —',
    to: 'Present',
    current: true,
    company: 'Affle',
    sub: 'Melbourne',
    role: 'Senior AI Engineer',
    bullets: [
      'Core contributor to Blueprix, a state-machine-based, MCP-enabled agent-orchestration platform — built its MCP servers and tool integration, multi-agent orchestration, checkpoint/resume state handling, and RAG context management plus agent UIs; standardised model access on Amazon Bedrock (Converse / InvokeModel streaming, Titan Embeddings, Guardrails for content and PII filtering).',
      "Own and operate Qrank (qrank.it.com), an LLM-powered multi-tenant 360° review platform used by 600+ employees across Affle's global offices — turning peer, manager and self feedback into structured review reports.",
      "Own Blueprix's CI/CD — GitHub Actions and Bitbucket Pipelines build, test and deploy agent services to AWS, with pre-commit linting, secret scanning, least-privilege IAM and secrets via SSM gating every release.",
      'Built the evaluation and observability loop — LLM-as-judge evals, prompt versioning, and tracing (Langfuse + CloudWatch) with cost and latency controls — so agent releases are gated on eval regressions.',
      'Mentor engineers across the AI team on agent design, prompt and context engineering, and AI-tooling adoption (Claude Code / Cursor onboarding, shared CLAUDE.md standards).',
    ],
  },
  {
    from: 'Aug 2020 —',
    to: 'Jun 2026',
    company: 'DashAnalysis Pty Ltd',
    sub: 'Melbourne',
    role: 'Senior Full-Stack & AI Engineer',
    bullets: [
      'Architected enterprise RAG pipelines (LangChain + LlamaIndex on Node.js / Python services) over technical documentation — ~40% retrieval-efficiency gain; multi-day analyst lookups replaced with sub-minute answers.',
      'Designed and ran autonomous AI agents (LangGraph, CrewAI) automating analytics, reporting and DynamoDB orchestration; delivered bespoke multi-step agentic workflows for SMB and enterprise clients replacing manual SOP-driven back-office tasks.',
      'Integrated Claude and GPT-4o into event-driven Node.js microservices on AWS Lambda, EventBridge and SQS with retry and guardrail layers, structured outputs and prompt caching — reduced hallucination incidents and stabilised production cost.',
      'Owned CI/CD across GitHub, GitLab and Bitbucket — pipeline templates, branch strategies and automated multi-environment deploys for a multi-client delivery team.',
      'Introduced automated testing across services — Jest unit and integration suites and Playwright end-to-end tests wired into CI, blocking merges on failures.',
      'Co-built Moose (beige.tech/solutions/moose) — enterprise product platform on Angular and AWS serverless; owned full-stack delivery and provisioned infrastructure as code with AWS CDK (TypeScript) and Serverless Framework. Acquired by Kaluza in 2025.',
      'Supported and enhanced Moonee Valley Council systems — a regulated public-sector environment — on C#, .NET Core, Entity Framework and SQL Server; managed Azure/IIS-hosted application deployments.',
      'Designed and built Qrank (qrank.it.com), a 360° review platform on Angular + Node.js + AWS with LLM-generated review reports — later deployed at scale across Affle.',
      'Mentored developers through code review, pairing and design reviews; productionised Claude Code, Cursor and Augment Code as the team default (shared CLAUDE.md / AGENTS.md, custom slash commands) — ~30% faster feature cycle.',
      'Led the React 18 + TypeScript re-architecture replacing legacy Angular modules; built real-time dashboards over WebSocket streams.',
    ],
  },
  {
    from: 'Jul 2019 —',
    to: 'Jul 2020',
    company: 'Blaque Fracture Technologies',
    sub: 'Pty Ltd',
    role: 'Senior Full-Stack Developer',
    bullets: [
      'Translated business requirements into MERN-stack applications (MongoDB, Express, React, Node.js) for B2B clients; owned features end-to-end from spec to production.',
      'Designed responsive React + Redux interfaces with reusable component patterns; standardised form validation, error handling and loading states.',
      'Built REST APIs with JWT auth, role-based access control and audit logging; wrote MongoDB aggregation pipelines and indexes for read-heavy workloads.',
      'Integrated third-party services (payment, email, file storage) behind clean adapter layers; participated in technical-design and code reviews.',
    ],
  },
  {
    from: 'Nov 2018 —',
    to: 'Feb 2019',
    company: 'Archimedes',
    role: 'Software Developer',
    bullets: [
      'Built React frontends bridged to Node.js + MongoDB backend services; converted design specs into production-ready, accessible components.',
      'Implemented OAuth 2.0 authentication and authorization with secure session handling, refresh-token rotation and protected routes.',
      'Wrote modular Express middleware for request validation, rate limiting and structured error responses.',
    ],
  },
  {
    from: 'Aug 2018 —',
    to: 'Oct 2018',
    company: 'Blockfreight, Inc.',
    role: 'Software Developer',
    bullets: [
      'Engineered single-page applications using React and Redux integrated with RESTful Node.js / Express endpoints backed by MongoDB.',
      'Built domain list and detail flows, search and filtering with focus on perceived performance — skeleton loaders, optimistic updates, paginated lists.',
      'Authored API services with consistent input validation, error contracts and logging.',
    ],
  },
  {
    from: 'Feb 2015 —',
    to: 'Jun 2018',
    company: 'ContenTerra Software',
    sub: 'Pvt. Ltd.',
    role: 'Software Developer',
    bullets: [
      'Delivered .NET enterprise web applications (ASP.NET MVC, AngularJS, WCF, Entity Framework, C#, HTML5, JavaScript) across the full SDLC in Agile/Scrum teams.',
      'Designed data-access layers and optimised SQL Server queries with LINQ, indexed views and stored procedures to meet enterprise SLA requirements.',
      'Implemented authentication and authorization (Forms, Windows, claims-based) and integrated with third-party SOAP and REST services.',
      'Reviewed pull requests, mentored and ramped junior developers on the codebase, and maintained engineering standards across release cycles.',
    ],
  },
];

export const education = [
  {
    from: '2018 —',
    to: '2020',
    degree: 'Master of Information Technology',
    major: 'Data Analytics',
    institution: 'Deakin University, Australia',
    figure: { value: '81.25', label: 'Weighted average mark' },
  },
  {
    from: '2011 —',
    to: '2015',
    degree: 'B.Tech, Computer Science Engineering',
    institution: 'CVR College of Engineering',
  },
];

export const workRights = {
  title: 'Australian citizen',
  body: 'Full working rights, no restrictions. Based in Melbourne, VIC.',
  note: 'No sponsorship required',
};
