# Security Policy

ZERO AGENT takes skill security seriously. Every skill you install into your agent comes from somewhere on the internet — and we want you to always know exactly where, and whether it's safe.

---

## How Skill Security Works

Every skill in ZERO AGENT has an origin tag that tells you exactly where it came from and what level of trust it carries:

| Origin Tag | Source | Security Level |
|---|---|---|
| ✅ ZERO AGENT Curated | Handpicked by the ZERO AGENT team | Highest — manually reviewed |
| 🟣 skills.sh | skills.sh registry | High — passes 3 independent audits |
| 🟡 npm | npm package registry | Medium — community maintained |
| ⚫ GitHub | GitHub repository | Medium — community built |
| ⚠️ Unverified URL | Direct URL install | Low — install at your own risk |

---

## Skills.sh Security Audits

Skills installed from skills.sh are automatically checked against three independent security tools:

- **Gen Agent Trust Hub** — agent-specific threat detection
- **Socket** — supply chain attack prevention
- **Snyk** — vulnerability scanning

Skills that pass all three show a verified badge. We recommend installing verified skills wherever possible.

---

## GitHub & npm Skills

Skills installed from GitHub or npm go through ZERO AGENT's own basic static analysis before being loaded into your agent. This checks for:

- Suspicious API calls or network requests
- Attempts to access your file system unexpectedly
- Known malicious code patterns

This is a basic check — not a guarantee. Always check the skill's GitHub repo and author before installing from unverified sources.

---

## Unverified URL Installs

When you install a skill directly from a URL that isn't skills.sh, GitHub or npm, ZERO AGENT will show a clear warning:

> ⚠️ This skill is from an unverified source. Install at your own risk.

We recommend only installing from URLs you fully trust.

---

## Reporting a Vulnerability

If you discover a security vulnerability in ZERO AGENT itself — not in a third party skill — please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, report directly via Twitter DM: [@zeroagentos](https://twitter.com/zeroagentos)

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Your suggested fix if you have one

We will respond within 48 hours and work with you to resolve the issue before any public disclosure.

---

## Responsible Disclosure

We believe in responsible disclosure. If you report a valid security vulnerability we will:

- Acknowledge your report within 48 hours
- Keep you updated on our progress
- Credit you in the fix if you'd like
- Not take legal action against good faith security researchers

---

## Self-Hosted Security

If you are self-hosting ZERO AGENT, you are responsible for your own infrastructure security. We recommend:

- Keeping your Node.js version up to date
- Using environment variables for all secrets
- Never exposing your ZERO AGENT instance publicly without authentication
- Regularly updating your installed skills

---

**Questions about security?** Reach out on Twitter: [@zeroagentos](https://twitter.com/zeroagentos)
