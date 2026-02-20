# Contributing to ZERO AGENT

First off — thank you for taking the time to contribute! 🎉

ZERO AGENT is built by the community, for the community. Every contribution matters, whether it's fixing a typo, reporting a bug, building a new skill, or improving the core runtime.

---

## Ways to Contribute

- **Report a bug** — something not working? Open an issue
- **Suggest a feature** — have an idea? We'd love to hear it
- **Build a skill** — create a new skill and share it with the community
- **Improve docs** — help make ZERO AGENT easier to understand
- **Fix a bug** — pick up an open issue and submit a PR

---

## Getting Started

1. **Fork the repo**
   - Click "Fork" on the top right of the repo page
   - This creates your own copy of ZERO AGENT

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
   - Keep changes focused and minimal
   - One feature or fix per PR

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

We use a simple convention for commit messages:

```
feat: add new skill loader feature
fix: resolve agent crash on skill unload
docs: update quick start guide
chore: clean up dependencies
```

---

## Building a Skill

Skills are the core of ZERO AGENT. If you want to contribute a skill:

1. Create a new folder under `/skills/your-skill-name`
2. Add a `skill.json` with name, version, and description
3. Add your skill logic in `index.js` or `index.ts`
4. Write a basic README for your skill
5. Submit a PR

Skill contribution guide coming soon.

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

- Be respectful and welcoming to all contributors
- Give constructive feedback
- Help others when you can
- No spam, self-promotion, or off-topic content

---

## Questions?

Reach out on Twitter: [@zeroagentos](https://twitter.com/zeroagentos)

Or open a discussion on GitHub.

---

**Built with ❤️ by [@james_eth_base](https://twitter.com/james_eth_base) and the ZERO AGENT community.**
