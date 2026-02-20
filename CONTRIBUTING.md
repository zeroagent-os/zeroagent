# Contributing to ZERO AGENT

First off — thank you for being here! 🎉

ZERO AGENT is built by the community, for the community. Whether you're fixing a typo, reporting a bug, building a skill, or improving the core — every contribution matters.

---

## Ways to Contribute

- **Report a bug** — something not working? Open an issue
- **Suggest a feature** — have an idea? We'd love to hear it
- **Build a skill** — create a skill and share it with the world
- **Improve docs** — help make ZERO AGENT easier to understand
- **Fix a bug** — pick up an open issue and submit a PR
- **Share your setup** — publish your agent configuration as a template

---

## Getting Started

1. **Fork the repo**
   - Click "Fork" on the top right of the repo page

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/zeroagent.git
   cd zeroagent
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **Make your changes**
   - Keep changes focused — one feature or fix per PR

6. **Commit your changes**
   ```bash
   git commit -m "feat: describe what you did"
   ```

7. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Open a Pull Request**
   - Go to `github.com/zeroagent-os/zeroagent`
   - Click "New Pull Request"
   - Describe what you changed and why

---

## Commit Message Format

```
feat: add new skill loader feature
fix: resolve agent crash on skill unload
docs: update quick start guide
chore: clean up dependencies
```

---

## Building a Skill

Skills are the heart of ZERO AGENT. Anyone can build one and publish it anywhere — GitHub, npm, skills.sh. No approval process needed.

**Basic skill structure:**
```
my-skill/
├── skill.json       # Skill metadata (name, version, description, inputs)
├── index.ts         # Skill logic
└── README.md        # How to use this skill
```

**skill.json example:**
```json
{
  "name": "my-skill",
  "version": "1.0.0",
  "description": "What this skill does in one line",
  "inputs": [
    { "name": "url", "type": "string", "description": "URL to process" }
  ]
}
```

Publish to GitHub, npm or skills.sh and users can install it directly:
```bash
zeroagent install github:your-username/my-skill
```

Full skill building guide coming soon.

---

## Code Style

- Use **TypeScript** where possible
- Keep functions small and focused
- Add comments for anything non-obvious
- No unused variables or imports

---

## Reporting Bugs

When reporting a bug please include:

- What you were trying to do
- What you expected to happen
- What actually happened
- Your OS and Node.js version

Open an issue at: `github.com/zeroagent-os/zeroagent/issues`

---

## Community Guidelines

- Be respectful and welcoming to everyone
- Give constructive, helpful feedback
- Help others when you can
- No spam or self-promotion

---

## Questions?

- 🐦 Twitter: [@zeroagentos](https://twitter.com/zeroagentos)
- 💬 Discord: Coming soon
- 🌐 Website: [zeroagentos.com](https://www.zeroagentos.com)

---

**Built with ❤️ by [@james_base_eth](https://twitter.com/james_base_eth) and the ZERO AGENT community.**
