import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

// Where the registry file lives
const REGISTRY_PATH = path.join(process.env.HOME || '', '.zeroagent', 'registry.json');

// Execution modes
export type ExecutionMode = 'on-demand' | 'scheduled' | 'triggered';

// Tier requirement
export type SkillTier = 'free' | 'cloud';

// Skill status
export type SkillStatus = 'active' | 'locked' | 'inactive';

// Origin of the skill
export type SkillOrigin = 'skills.sh' | 'github' | 'npm' | 'url' | 'curated';

// A single skill entry in the registry
export interface SkillEntry {
  name: string;                  // Skill name e.g. "btc-price-tracker"
  version: string;               // Skill version e.g. "1.0.0"
  description: string;           // One line description
  origin: SkillOrigin;           // Where it came from
  executionMode: ExecutionMode;  // on-demand, scheduled or triggered
  tier: SkillTier;               // free or cloud
  status: SkillStatus;           // active, locked or inactive
  installedAt: string;           // ISO date string
  source: string;                // Original install source URL or identifier
  schedule?: string;             // Cron expression if scheduled e.g. "*/15 * * * *"
  trigger?: {                    // Trigger condition if triggered
    condition: string;           // e.g. "btc_price < 80000"
    value: number | string;      // The threshold value
  };
}

// The full registry
interface Registry {
  version: string;
  updatedAt: string;
  skills: Record<string, SkillEntry>;
}

// Load the registry from disk — creates empty one if it doesn't exist
async function loadRegistry(): Promise<Registry> {
  try {
    if (await fs.pathExists(REGISTRY_PATH)) {
      return await fs.readJson(REGISTRY_PATH);
    }
  } catch {
    // Registry corrupted or missing — start fresh
  }

  // Return a fresh empty registry
  return {
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
    skills: {}
  };
}

// Save the registry to disk
async function saveRegistry(registry: Registry): Promise<void> {
  await fs.ensureDir(path.dirname(REGISTRY_PATH));
  registry.updatedAt = new Date().toISOString();
  await fs.writeJson(REGISTRY_PATH, registry, { spaces: 2 });
}

// Register a newly installed skill
export async function registerSkill(entry: SkillEntry): Promise<void> {
  const registry = await loadRegistry();
  registry.skills[entry.name] = entry;
  await saveRegistry(registry);
  console.log(chalk.dim(`📋 ${entry.name} registered in skill registry`));
}

// Remove a skill from the registry
export async function unregisterSkill(skillName: string): Promise<void> {
  const registry = await loadRegistry();
  if (registry.skills[skillName]) {
    delete registry.skills[skillName];
    await saveRegistry(registry);
    console.log(chalk.dim(`📋 ${skillName} removed from skill registry`));
  }
}

// Get a single skill from the registry
export async function getSkill(skillName: string): Promise<SkillEntry | null> {
  const registry = await loadRegistry();
  return registry.skills[skillName] || null;
}

// Get all installed skills
export async function getAllSkills(): Promise<SkillEntry[]> {
  const registry = await loadRegistry();
  return Object.values(registry.skills);
}

// Get only active skills
export async function getActiveSkills(): Promise<SkillEntry[]> {
  const skills = await getAllSkills();
  return skills.filter(s => s.status === 'active');
}

// Get skills by execution mode
export async function getSkillsByMode(mode: ExecutionMode): Promise<SkillEntry[]> {
  const skills = await getAllSkills();
  return skills.filter(s => s.executionMode === mode);
}

// Update a skill's status
export async function updateSkillStatus(
  skillName: string,
  status: SkillStatus
): Promise<void> {
  const registry = await loadRegistry();
  if (registry.skills[skillName]) {
    registry.skills[skillName].status = status;
    await saveRegistry(registry);
  }
}

// Count total installed skills
export async function getSkillCount(): Promise<number> {
  const registry = await loadRegistry();
  return Object.keys(registry.skills).length;
}

// Check if user has hit the free tier limit (5 skills)
export async function isAtFreeLimit(): Promise<boolean> {
  const count = await getSkillCount();
  return count >= 5;
}

// Pretty print all installed skills to the terminal
export async function printSkillList(): Promise<void> {
  const skills = await getAllSkills();

  if (skills.length === 0) {
    console.log(chalk.dim('No skills installed yet.'));
    console.log(chalk.cyan('Run: zeroagent find "what you want to do"'));
    return;
  }

  console.log(chalk.bold(`\n📦 Installed Skills (${skills.length})\n`));

  for (const skill of skills) {
    const tierLabel = skill.tier === 'cloud'
      ? chalk.blue('🔵 Cloud')
      : chalk.green('🟢 Free');

    const statusLabel = skill.status === 'active'
      ? chalk.green('✅ Active')
      : skill.status === 'locked'
      ? chalk.yellow('🔒 Locked')
      : chalk.dim('⬜ Inactive');

    const modeLabel = chalk.dim(`[${skill.executionMode}]`);

    console.log(`  ${chalk.bold(skill.name)} ${modeLabel}`);
    console.log(`  ${skill.description}`);
    console.log(`  ${tierLabel}  ${statusLabel}  ${chalk.dim(skill.origin)}`);
    console.log();
  }
}
