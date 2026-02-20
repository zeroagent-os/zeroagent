import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import { execSync } from 'child_process';
import ora from 'ora';
import chalk from 'chalk';

// Where all installed skills live on the user's machine
const SKILLS_DIR = path.join(process.env.HOME || '', '.zeroagent', 'skills');

// The four sources ZERO AGENT supports
type SkillSource = 'skills.sh' | 'github' | 'npm' | 'url';

interface SkillInstallOptions {
  source: string;
  skillName?: string;
}

// Detect where the skill is coming from
function detectSource(source: string): SkillSource {
  if (source.startsWith('github:')) return 'github';
  if (source.startsWith('npm:')) return 'npm';
  if (source.startsWith('skills:')) return 'skills.sh';
  if (source.startsWith('http://') || source.startsWith('https://')) return 'url';
  // Default — treat as skills.sh shorthand
  return 'skills.sh';
}

// Install a skill from skills.sh
async function installFromSkillsSh(skillName: string): Promise<void> {
  const spinner = ora(`Installing ${chalk.cyan(skillName)} from skills.sh...`).start();
  try {
    await fs.ensureDir(SKILLS_DIR);
    execSync(
      `npx skills add https://skills.sh/${skillName} --skill ${skillName}`,
      { stdio: 'pipe' }
    );
    spinner.succeed(chalk.green(`✅ ${skillName} installed from skills.sh`));
  } catch (error) {
    spinner.fail(chalk.red(`Failed to install ${skillName} from skills.sh`));
    throw error;
  }
}

// Install a skill from a GitHub repo
async function installFromGitHub(repoPath: string, skillName?: string): Promise<void> {
  const repo = repoPath.replace('github:', '');
  const name = skillName || repo.split('/').pop() || repo;
  const spinner = ora(`Installing ${chalk.cyan(name)} from GitHub...`).start();

  try {
    await fs.ensureDir(SKILLS_DIR);
    const skillDir = path.join(SKILLS_DIR, name);

    // Clone the repo into the skills directory
    execSync(
      `git clone https://github.com/${repo} ${skillDir}`,
      { stdio: 'pipe' }
    );

    // Install skill dependencies if package.json exists
    if (await fs.pathExists(path.join(skillDir, 'package.json'))) {
      execSync('npm install', { cwd: skillDir, stdio: 'pipe' });
    }

    spinner.succeed(chalk.green(`✅ ${name} installed from GitHub`));
  } catch (error) {
    spinner.fail(chalk.red(`Failed to install from GitHub: ${repoPath}`));
    throw error;
  }
}

// Install a skill from npm
async function installFromNpm(packageName: string): Promise<void> {
  const name = packageName.replace('npm:', '');
  const spinner = ora(`Installing ${chalk.cyan(name)} from npm...`).start();

  try {
    await fs.ensureDir(SKILLS_DIR);
    execSync(
      `npm install ${name} --prefix ${SKILLS_DIR}`,
      { stdio: 'pipe' }
    );
    spinner.succeed(chalk.green(`✅ ${name} installed from npm`));
  } catch (error) {
    spinner.fail(chalk.red(`Failed to install ${name} from npm`));
    throw error;
  }
}

// Install a skill from a direct URL
async function installFromUrl(url: string, skillName?: string): Promise<void> {
  const name = skillName || url.split('/').pop()?.replace('.git', '') || 'unknown-skill';
  const spinner = ora(`Installing ${chalk.cyan(name)} from URL...`).start();

  // Show unverified warning
  spinner.warn(
    chalk.yellow(`⚠️  This skill is from an unverified source. Install at your own risk.`)
  );

  try {
    await fs.ensureDir(SKILLS_DIR);
    const skillDir = path.join(SKILLS_DIR, name);

    // Try to clone as a git repo first
    if (url.endsWith('.git') || url.includes('github.com')) {
      execSync(`git clone ${url} ${skillDir}`, { stdio: 'pipe' });
    } else {
      // Download as a file
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      await fs.writeFile(path.join(SKILLS_DIR, name), response.data);
    }

    spinner.succeed(chalk.green(`✅ ${name} installed from URL`));
  } catch (error) {
    spinner.fail(chalk.red(`Failed to install from URL: ${url}`));
    throw error;
  }
}

// Main install function — detects source and routes to the right installer
export async function installSkill(options: SkillInstallOptions): Promise<void> {
  const { source, skillName } = options;
  const detectedSource = detectSource(source);

  console.log(chalk.dim(`📦 Source detected: ${detectedSource}`));

  switch (detectedSource) {
    case 'skills.sh':
      await installFromSkillsSh(source.replace('skills:', ''));
      break;
    case 'github':
      await installFromGitHub(source, skillName);
      break;
    case 'npm':
      await installFromNpm(source);
      break;
    case 'url':
      await installFromUrl(source, skillName);
      break;
  }
}

// Remove an installed skill
export async function removeSkill(skillName: string): Promise<void> {
  const skillDir = path.join(SKILLS_DIR, skillName);
  const spinner = ora(`Removing ${chalk.cyan(skillName)}...`).start();

  try {
    if (await fs.pathExists(skillDir)) {
      await fs.remove(skillDir);
      spinner.succeed(chalk.green(`✅ ${skillName} removed`));
    } else {
      spinner.fail(chalk.red(`Skill ${skillName} not found`));
    }
  } catch (error) {
    spinner.fail(chalk.red(`Failed to remove ${skillName}`));
    throw error;
  }
}

// Get the path to an installed skill
export function getSkillPath(skillName: string): string {
  return path.join(SKILLS_DIR, skillName);
}

// Check if a skill is installed
export async function isSkillInstalled(skillName: string): Promise<boolean> {
  return fs.pathExists(path.join(SKILLS_DIR, skillName));
}
