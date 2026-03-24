#!/usr/bin/env node

// find-skills — pre-installed ZERO AGENT skill
// Searches skills.sh and suggests skills to install
// No API key required

const https = require('https');

// Curated skill suggestions by keyword
// Maps common queries to real skills on skills.sh and GitHub
const SKILL_MAP = [
  {
    keywords: ['crypto', 'bitcoin', 'btc', 'price', 'coin', 'ethereum', 'eth'],
    name: 'crypto-price',
    description: 'Get live price of any cryptocurrency',
    install: 'zeroagent install skills:crypto-price',
    origin: '🟣 skills.sh'
  },
  {
    keywords: ['news', 'headlines', 'latest', 'breaking', 'articles'],
    name: 'news',
    description: 'Get latest headlines on any topic',
    install: 'zeroagent install skills:news',
    origin: '🟣 skills.sh'
  },
  {
    keywords: ['url', 'shorten', 'link', 'short', 'tiny'],
    name: 'url-shortener',
    description: 'Shorten any URL instantly',
    install: 'zeroagent install skills:url-shortener',
    origin: '🟣 skills.sh'
  },
  {
    keywords: ['weather', 'temperature', 'forecast', 'rain', 'sun', 'climate'],
    name: 'weather',
    description: 'Get current weather for any city',
    install: 'zeroagent install github:zeroagent-os/skills --skill weather',
    origin: '⚫ GitHub'
  },
  {
    keywords: ['email', 'gmail', 'mail', 'inbox', 'send', 'message'],
    name: 'email',
    description: 'Send and manage emails',
    install: 'npx skills add ComposioHQ/awesome-claude-skills@gmail',
    origin: '🟣 skills.sh'
  },
  {
    keywords: ['calendar', 'schedule', 'meeting', 'event', 'appointment'],
    name: 'calendar',
    description: 'Manage your calendar and events',
    install: 'npx skills add ComposioHQ/awesome-claude-skills@googlecalendar',
    origin: '🟣 skills.sh'
  },
  {
    keywords: ['github', 'code', 'repo', 'pull request', 'commit', 'deploy'],
    name: 'github',
    description: 'Manage GitHub repos, issues, and PRs',
    install: 'npx skills add vercel-labs/agent-skills@github',
    origin: '🟣 skills.sh'
  },
  {
    keywords: ['search', 'google', 'web', 'browse', 'internet', 'find'],
    name: 'web-search',
    description: 'Search the web for anything',
    install: 'npx skills add ComposioHQ/awesome-claude-skills@tavily',
    origin: '🟣 skills.sh'
  },
  {
    keywords: ['slack', 'notify', 'notification', 'alert', 'message', 'chat'],
    name: 'slack',
    description: 'Send messages and notifications to Slack',
    install: 'npx skills add ComposioHQ/awesome-claude-skills@slack',
    origin: '🟣 skills.sh'
  },
  {
    keywords: ['image', 'photo', 'picture', 'generate', 'dalle', 'vision'],
    name: 'image-gen',
    description: 'Generate images from text descriptions',
    install: 'npx skills add vercel-labs/agent-skills@image-generation',
    origin: '🟣 skills.sh'
  }
];

function searchSkills(query) {
  const lower = query.toLowerCase();
  const words = lower.split(/\s+/);

  const results = SKILL_MAP.filter(skill =>
    skill.keywords.some(keyword =>
      words.some(word => keyword.includes(word) || word.includes(keyword))
    )
  );

  return results;
}

async function run(inputs) {
  const query = (inputs.query || '').trim();

  if (!query) {
    return {
      success: false,
      error: 'Please describe what you want your agent to do.'
    };
  }

  const results = searchSkills(query);

  if (results.length === 0) {
    const output = [
      ``,
      `  🔍  No matching skills found for "${query}"`,
      ``,
      `  Try browsing the full skills directory:`,
      `  https://skills.sh`,
      ``,
      `  Or install any skill directly:`,
      `  zeroagent install github:username/skill-name`,
      `  zeroagent install npm:skill-package`,
      `  zeroagent install https://any-url`,
      ``,
    ].join('\n');

    return { success: true, count: 0, output };
  }

  const lines = [
    ``,
    `  🔍  Skills found for "${query}"`,
    ``,
  ];

  results.forEach((skill, i) => {
    lines.push(`  ${i + 1}. ${skill.name}`);
    lines.push(`     ${skill.description}`);
    lines.push(`     ${skill.origin}`);
    lines.push(`     Install: ${skill.install}`);
    lines.push('');
  });

  lines.push(`  Browse more at: https://skills.sh`);
  lines.push('');

  return {
    success: true,
    count: results.length,
    skills: results,
    output: lines.join('\n')
  };
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  const query = args.join(' ') || 'top skills';

  run({ query }).then(result => {
    if (result.success) {
      console.log(result.output);
    } else {
      console.error(`❌ ${result.error}`);
      process.exit(1);
    }
  }).catch(err => {
    console.error(`❌ Unexpected error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { run };
