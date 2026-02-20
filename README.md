# ZERO AGENT

**Your personal AI agent. No coding required.**

Free forever. Self-hostable. Community owned.

⭐ If you believe everyone deserves their own AI agent — star this repo and help us build it.

---

## What is ZERO AGENT?

ZERO AGENT gives anyone their own personal AI agent — without writing a single line of code.

You sign up, get your agent, browse skills from across the internet, install the ones you need, and run them from a simple dashboard. Your agent does exactly what you tell it to do, when you tell it to do it.

Think of it as an **app store for AI agents** — but the apps come from everywhere. skills.sh, GitHub, npm, or any URL on the internet. You're never locked into one source.

---

## How it Works

```
1. Sign up at zeroagentos.com
2. Get your personal agent (starts with zero skills)
3. Browse skills from across the internet
4. Install the ones you need — one click
5. Run them from your dashboard
6. Get results — no code, no complexity
```

You are always in control. Your agent only does what you tell it to do.

---

## Real Example

Meet Sara. She runs a small online store and has zero coding knowledge.

She signs up, gets her agent, and installs three skills:

- **Product Price Tracker** — monitors competitor prices
- **Customer Review Summariser** — turns 50 reviews into a 5 line summary
- **Daily Sales Report** — emails her a clean report every morning

She clicks Run when she needs them. Her agent does the work. Done.

She never writes a single line of code. She never opens a terminal. She just logs in and uses it.

**That's ZERO AGENT.**

---

## Install Skills From Anywhere

ZERO AGENT is a universal runtime. Skills can come from anywhere on the internet:

```bash
# From the ZERO AGENT marketplace
zeroagent install skills:price-tracker

# From skills.sh
zeroagent install skills:frontend-design

# From GitHub
zeroagent install github:username/skill-name

# From npm
zeroagent install npm:zero-skill-analytics

# From any URL
zeroagent install https://github.com/anthropics/skills --skill frontend-design
```

Every skill in the dashboard shows exactly where it came from — no hidden sources, no black boxes.

| Origin Tag | Meaning |
|---|---|
| 🟣 skills.sh | Verified, security audited |
| ⚫ GitHub | Community built |
| 🟡 npm | Package registry |
| ✅ ZERO AGENT Curated | Handpicked by the team |

---

## Features

- 🛒 **Universal Skill Marketplace** — browse skills from skills.sh, GitHub, npm and more in one place
- ⚡ **One Click Install** — install any skill from anywhere instantly
- 🎛️ **Simple Dashboard** — manage your agent and all your skills from one clean interface
- 🏷️ **Origin Tags** — see exactly where every skill comes from
- 🔒 **Security Checks** — skills from verified sources are audited before you install
- 📤 **Share Your Setup** — share your agent configuration as a public link so anyone can replicate it in one click
- 🔄 **Hot-swap Skills** — add or remove skills anytime without any downtime
- ↩️ **Rollback** — revert to a previous skill version if something breaks
- 🌐 **Self-hostable** — run ZERO AGENT on your own server, completely free

---

## Share Your Agent Setup

Share your agent skill configuration as a public link. Anyone who opens it can replicate your exact setup in one click.

Sara shares her e-commerce setup in a small business community. Everyone replicates it instantly. No setup, no configuration needed.

Build and share templates like:
- *"The E-commerce Starter Pack"*
- *"The Crypto Tracker Setup"*
- *"The Content Creator Bundle"*
- *"The Developer Toolkit"*

---

## Pricing

| Plan | Skills | Price |
|---|---|---|
| Free | Up to 5 skills | $0 forever |
| Cloud Pro | Unlimited skills | Coming soon |
| Skill Builder | Verified badge + featured placement | Coming soon |

**Self-hosting is always free and unlimited.** The cloud plan pays for managed hosting and convenience — not the software itself.

---

## Build a Skill

Anyone can build and publish a skill for ZERO AGENT. No approval process. Publish on GitHub, npm, skills.sh or anywhere — users can install it directly.

Skill builders get:
- Attribution and a public profile page
- Featured placement in the marketplace
- Verified badge on the Skill Builder plan

The more skills the community builds, the more powerful every agent becomes.

Skill building guide coming soon.

---

## Quick Start (Self-Hosting)

```bash
# Clone the repo
git clone https://github.com/zeroagent-os/zeroagent.git
cd zeroagent

# Install dependencies
npm install

# Boot your agent
zeroagent start
```

Your agent boots with **find-skills** pre-installed — a skill that helps you discover and install other skills in plain English.

```bash
# Find a skill for anything you want to do
zeroagent find "track btc price"
zeroagent find "summarise customer reviews"
zeroagent find "monitor competitor prices"

# Install a skill from skills.sh
zeroagent install skills:btc-price-tracker

# Run it
zeroagent run btc-price-tracker

# See all your installed skills
zeroagent list

# Check your agent status
zeroagent status
```

Install from anywhere:

```bash
zeroagent install skills:skill-name          # From skills.sh
zeroagent install github:username/repo       # From GitHub
zeroagent install npm:package-name           # From npm
zeroagent install https://any-url --skill name  # From any URL
```

Schedule a skill to run automatically (Cloud tier):

```bash
zeroagent schedule btc-price-tracker "*/15 * * * *"   # Every 15 minutes
zeroagent trigger btc-price-tracker "btc_price < 80000" --value 80000
```

Upgrade anytime:

```bash
zeroagent upgrade
```

---

## Roadmap

- [x] Core agent runtime
- [x] Universal skill installer (skills.sh, GitHub, npm, URL)
- [x] CLI — install, run, list, remove, find, schedule, trigger
- [ ] Skill aggregator with origin tags
- [ ] Dashboard (browse, install, run skills)
- [ ] Share My Agent Setup
- [ ] Skill builder profiles
- [ ] Cloud hosted tier
- [ ] Mobile dashboard

---

## Contributing

ZERO AGENT is built by the community, for the community. All contributions are welcome — whether it's a bug fix, a new skill, or improving the docs.

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

---

## Security

We take skill security seriously. See [SECURITY.md](SECURITY.md) for how ZERO AGENT handles skill verification and what to do if you find a vulnerability.

---

## Community

- 🐦 Twitter: [@zeroagentos](https://twitter.com/zeroagentos)
- 💬 Discord: Coming soon
- 🌐 Website: [zeroagentos.com](https://www.zeroagentos.com)

---

## License

MIT — free to use, modify, and distribute. Forever.

Self-host for free and unlimited. Or use our managed cloud when you want the convenience. Either way, the core is always open.

---

**Built by [@james_base_eth](https://twitter.com/james_base_eth) and the ZERO AGENT community.**
