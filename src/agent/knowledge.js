// The agent's entire world: facts derived from src/data/resume.js.
// Nothing here is typed by hand as a claim — every fact points back at the
// résumé entry it came from, and every answer carries that citation.

import {
  profile,
  stats,
  about,
  skillGroups,
  work,
  alsoShipped,
  experience,
  education,
  workRights,
} from '../data/resume';

/** A citation: the label a reader sees, and where on the page it resolves. */
const cite = (label, anchor) => ({ label, anchor });

const roleYears = (role) => `${role.from.replace(/\s*—\s*$/, '').replace(/^[A-Za-z]{3}\s/, '')}–${
  role.current ? '' : role.to.replace(/^[A-Za-z]{3}\s/, '')
}`;

export const CITES = {
  profile: cite('Profile', 'top'),
  rights: cite('Work rights', 'education'),
  contact: cite('Contact', 'contact'),
  education: cite('Education', 'education'),
  stack: cite('Stack', 'stack'),
  experience: cite('Experience', 'experience'),
  work: (w) => cite(w.name, 'work'),
  role: (r) => cite(`${r.company} · ${roleYears(r)}`, 'experience'),
};

/**
 * Facts are short, self-contained sentences. `keys` are the words a question
 * would use to reach them; `text` is what the agent says; `cite` is proof.
 */
export const facts = [];

const add = (id, text, c, keys, weight = 1) => facts.push({ id, text, cite: c, keys, weight });

// --- Profile -------------------------------------------------------------
add('lead', profile.lead, CITES.profile, ['summary', 'overview', 'who', 'about', 'background', 'experience', 'years', 'senior', 'engineer'], 1.2);
add('sub', profile.sub, CITES.profile, ['affle', 'blueprix', 'qrank', 'mentor', 'current', 'now'], 1);
add(
  'headline',
  `${about.headline}: ${about.lead.charAt(0).toLowerCase()}${about.lead.slice(1)}`,
  CITES.profile,
  ['agents', 'philosophy', 'approach', 'guardrails', 'teammates'],
);
about.paragraphs.forEach((p, i) => add(`about-${i}`, p, CITES.profile, ['history', 'started', 'career', 'discipline', 'prototype', 'requirements', 'constraints', 'mentor']));

// --- Stats ---------------------------------------------------------------
stats.forEach((s, i) =>
  add(`stat-${i}`, `${s.value}${s.unit ?? ''}${s.suffix ?? ''} — ${s.label.toLowerCase()}.`, CITES.profile, s.label.toLowerCase().split(/\W+/)),
);

// --- Selected work -------------------------------------------------------
work.forEach((w) => {
  const c = CITES.work(w);
  add(`${w.name}-what`, `${w.name} — ${w.kicker.toLowerCase()} (${w.meta}).`, c, [w.name.toLowerCase(), ...w.kicker.toLowerCase().split(/\W+/)], 1.1);
  w.body.forEach((b, i) => add(`${w.name}-body-${i}`, b, c, [w.name.toLowerCase(), ...w.stack.map((s) => s.toLowerCase())]));
  if (w.figures) {
    add(
      `${w.name}-figures`,
      `${w.name} numbers: ${w.figures.map((f) => `${f.value}${f.unit ?? ''}${f.suffix ?? ''} ${f.label.toLowerCase()}`).join(', ')}.`,
      c,
      [w.name.toLowerCase(), 'numbers', 'views', 'users', 'subscribers', 'metrics', 'results'],
    );
  }
});
alsoShipped.forEach((a) => add(`also-${a.name}`, `${a.name}: ${a.body}`, CITES.role(experience[1]), [a.name.toLowerCase(), ...a.body.toLowerCase().split(/\W+/).slice(0, 12)]));

// --- Experience ----------------------------------------------------------
experience.forEach((r) => {
  const c = CITES.role(r);
  add(
    `${r.company}-role`,
    `${r.role} at ${r.company}${r.sub ? ` (${r.sub})` : ''}, ${r.from} ${r.to}.`,
    c,
    [r.company.toLowerCase(), ...r.role.toLowerCase().split(/\W+/), r.current ? 'current' : 'previous'],
  );
  r.bullets.forEach((b, i) =>
    add(`${r.company}-b${i}`, b, c, b.toLowerCase().split(/\W+/).filter((t) => t.length > 3)),
  );
});

// --- Stack ---------------------------------------------------------------
skillGroups.forEach((g) =>
  add(
    `skills-${g.n}`,
    `${g.title}: ${g.items.join(', ')}.`,
    CITES.stack,
    [...g.title.toLowerCase().split(/\W+/), ...g.items.flatMap((it) => it.toLowerCase().split(/[\s/(),]+/))],
    g.emphasis ? 1.1 : 0.9,
  ),
);

// --- Education & rights --------------------------------------------------
education.forEach((e, i) =>
  add(
    `edu-${i}`,
    `${e.degree}${e.major ? ` (${e.major})` : ''}, ${e.institution}, ${e.from} ${e.to}${e.figure ? ` — ${e.figure.label.toLowerCase()} ${e.figure.value}` : ''}.`,
    CITES.education,
    ['education', 'degree', 'university', 'study', 'studied', 'master', 'masters', 'bachelor', 'btech', 'deakin', 'cvr', 'qualification'],
  ),
);
add('rights', `${workRights.title} — ${workRights.body} ${workRights.note}.`, CITES.rights, ['visa', 'sponsorship', 'sponsor', 'citizen', 'rights', 'relocate', 'location', 'based', 'melbourne', 'australia'], 1.3);
add('contact', `Email ${profile.email}; LinkedIn ${profile.linkedinLabel}; GitHub ${profile.githubLabel}.`, CITES.contact, ['contact', 'email', 'reach', 'linkedin', 'github', 'call', 'interview', 'hire'], 1.2);

// Convenience lookups used by intents -------------------------------------
export const byId = (id) => facts.find((f) => f.id === id);

/** First bullet of a role whose text contains every given word (case-insensitive). */
export const bullet = (company, ...words) => {
  const r = experience.find((e) => e.company.toLowerCase().startsWith(company.toLowerCase()));
  if (!r) return null;
  const lw = words.map((w) => w.toLowerCase());
  const i = r.bullets.findIndex((b) => lw.every((w) => b.toLowerCase().includes(w)));
  return i >= 0 ? byId(`${r.company}-b${i}`) : null;
};

export const project = (name) => work.find((w) => w.name.toLowerCase() === name.toLowerCase());

export { profile, experience, skillGroups, workRights, education, work };
