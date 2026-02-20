import chalk from 'chalk';
import path from 'path';
import { loadState, setAgentStatus, recordSkillRun, isFreeTier, printAgentSummary } from './state.js';
import { getSkill, getAllSkills, isAtFreeLimit, registerSkill, unregisterSkill, getSkillCount } from '../skills/registry.js';
import { installSkill, removeSkill, isSkillInstalled } from '../skills/loader.js';
import { startScheduledSkill, stopScheduledSkill, startTriggeredSkill, stopTriggeredSkill, startAllScheduledSkills, stopAllScheduledSkills, getSchedulerStatus } from './scheduler.js';

// ─────────────────────────────────────────
// AGENT BOOT
// ─────────────────────────────────────────

// Boot the agent — loads state, starts scheduled skills
export async function bootAgent(): Promise<void> {
  console.log(chalk.bold('\n🤖 ZERO AGENT\n'));
  console.log(chalk.dim('Booting agent...\n'));

  const state = await loadState();

  console.log(chalk.green(`✅ Agent loaded: ${chalk.bold(state.agentName)}`));
  console.log(chalk.dim(`   Tier: ${state.tier} | Skills: ${state.activeSkillCount}`));

  // Start all scheduled and triggered skills if on cloud tier
  await startAllScheduledSkills();

  await setAgentStatus('idle');
  console.log(chalk.green('\n✅ Agent ready.\n'));
}

// ─────────────────────────────────────────
// INSTALL A SKILL
// ─────────────────────────────────────────

export async function agentInstall(
  source: string,
  skillName?: string
): Promise<void> {
  const state = await loadState();

  // Determine skill name from source if not provided
  const name = skillName
    || source.split('/').pop()?.replace('.git', '')
    || source.replace('skills:', '').replace('npm:', '').replace('github:', '')
    || 'unknown-skill';

  // Check if already installed
  if (await isSkillInstalled(name)) {
    console.log(chalk.yellow(`⚠️  ${name} is already installed.`));
    return;
  }

  // Detect execution mode from source metadata
  // Default to on-demand — scheduler updates this after install if needed
  const skillMeta = await fetchSkillMetadata(source, name);

  // Free tier limit check — only for non-base skills
  if (await isFreeTier() && await isAtFreeLimit() && !state.baseSkills.includes(name)) {
    console.log(chalk.yellow('\n⚠️  You have reached the free tier limit of 5 skills.'));
    console.log(chalk.dim('   Upgrade to Cloud for unlimited skills.'));
    console.log(chalk.cyan('   zeroagentos.com\n'));

    // Still allow install but lock the skill
    skillMeta.status = 'locked';
  }

  // Cloud tier check for scheduled/triggered skills
  if (
    (skillMeta.executionMode === 'scheduled' || skillMeta.executionMode === 'triggered') &&
    await isFreeTier()
  ) {
    console.log(chalk.blue(`\n🔵 ${name} requires Cloud tier — it runs continuously in the background.`));
    console.log(chalk.dim('   Installing anyway — upgrade to activate it.'));
    console.log(chalk.cyan('   zeroagentos.com\n'));
    skillMeta.status = 'locked';
  }

  // Install the skill files
  await installSkill({ source, skillName: name });

  // Register in registry
  await registerSkill(skillMeta);

  // Show post-install summary
  const remaining = 5 - (await getSkillCount());
  if (await isFreeTier() && remaining <= 2) {
    console.log(
      chalk.yellow(`\n  💡 ${remaining} free skill slot(s) remaining. Upgrade for unlimited.`)
    );
  }
}

// ─────────────────────────────────────────
// RUN A SKILL
// ─────────────────────────────────────────

export async function agentRun(skillName: string, inputs?: Record<string, unknown>): Promise<void> {
  const skill = await getSkill(skillName);

  if (!skill) {
    console.log(chalk.red(`❌ Skill "${skillName}" is not installed.`));
    console.log(chalk.dim(`   Run: zeroagent install skills:${skillName}`));
    return;
  }

  // Check if skill is locked
  if (skill.status === 'locked') {
    if (skill.tier === 'cloud') {
      console.log(chalk.blue(`\n🔵 ${skillName} requires Cloud tier to run.`));
      console.log(chalk.dim('   Upgrade at zeroagentos.com to activate this skill.\n'));
    } else {
      console.log(chalk.yellow(`\n⚠️  ${skillName} is locked. Check your skill limit.\n`));
    }
    return;
  }

  console.log(chalk.bold(`\n▶  Running ${skillName}...\n`));

  try {
    await setAgentStatus('running');

    // Load and execute the skill
    const skillPath = path.join(
      process.env.HOME || '',
      '.zeroagent',
      'skills',
      skillName,
      'index.js'
    );

    const skillModule = await import(skillPath);

    if (typeof skillModule.run !== 'function') {
      throw new Error(`Skill "${skillName}" does not export a run() function`);
    }

    // Pass inputs to the skill if provided
    const result = await skillModule.run(inputs || {});

    // Show result if returned
    if (result) {
      console.log(chalk.bold('\n📊 Result:\n'));
      if (typeof result === 'object') {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(result);
      }
    }

    await recordSkillRun(skillName, true);
    await setAgentStatus('idle');
    console.log(chalk.green(`\n✅ ${skillName} completed successfully.\n`));

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(chalk.red(`\n❌ ${skillName} failed: ${message}\n`));
    await recordSkillRun(skillName, false);
    await setAgentStatus('error');
  }
}

// ─────────────────────────────────────────
// REMOVE A SKILL
// ─────────────────────────────────────────

export async function agentRemove(skillName: string): Promise<void> {
  const skill = await getSkill(skillName);

  if (!skill) {
    console.log(chalk.red(`❌ Skill "${skillName}" is not installed.`));
    return;
  }

  // Stop any running scheduled or triggered jobs first
  if (skill.executionMode === 'scheduled') {
    await stopScheduledSkill(skillName);
  } else if (skill.executionMode === 'triggered') {
    await stopTriggeredSkill(skillName);
  }

  // Remove files and registry entry
  await removeSkill(skillName);
  await unregisterSkill(skillName);

  console.log(chalk.green(`✅ ${skillName} removed successfully.`));
}

// ─────────────────────────────────────────
// SCHEDULE A SKILL
// ─────────────────────────────────────────

export async function agentSchedule(
  skillName: string,
  cronExpression: string
): Promise<void> {
  const skill = await getSkill(skillName);

  if (!skill) {
    console.log(chalk.red(`❌ Skill "${skillName}" is not installed.`));
    return;
  }

  // Update skill with schedule
  skill.schedule = cronExpression;
  skill.executionMode = 'scheduled';

  await startScheduledSkill(skill);
}

// ─────────────────────────────────────────
// SET A TRIGGER ON A SKILL
// ─────────────────────────────────────────

export async function agentTrigger(
  skillName: string,
  condition: string,
  value: number | string,
  checkFn: () => Promise<boolean>
): Promise<void> {
  const skill = await getSkill(skillName);

  if (!skill) {
    console.log(chalk.red(`❌ Skill "${skillName}" is not installed.`));
    return;
  }

  // Update skill with trigger
  skill.trigger = { condition, value };
  skill.executionMode = 'triggered';

  await startTriggeredSkill(skill, checkFn);
}

// ─────────────────────────────────────────
// STATUS & INFO
// ─────────────────────────────────────────

export async function agentStatus(): Promise<void> {
  await printAgentSummary();
  getSchedulerStatus();
}

export async function agentList(): Promise<void> {
  const { printSkillList } = await import('../skills/registry.js');
  await printSkillList();
}

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

// Fetch skill metadata from skill.json or use defaults
async function fetchSkillMetadata(source: string, name: string) {
  const skillPath = path.join(
    process.env.HOME || '',
    '.zeroagent',
    'skills',
    name,
    'skill.json'
  );

  try {
    const { default: meta } = await import(skillPath, { assert: { type: 'json' } });
    return {
      name: meta.name || name,
      version: meta.version || '1.0.0',
      description: meta.description || 'No description provided',
      origin: detectOrigin(source),
      executionMode: meta.executionMode || 'on-demand',
      tier: meta.tier || 'free',
      status: 'active' as const,
      installedAt: new Date().toISOString(),
      source,
      schedule: meta.schedule,
      trigger: meta.trigger
    };
  } catch {
    // skill.json not found — use defaults
    return {
      name,
      version: '1.0.0',
      description: 'No description provided',
      origin: detectOrigin(source),
      executionMode: 'on-demand' as const,
      tier: 'free' as const,
      status: 'active' as const,
      installedAt: new Date().toISOString(),
      source
    };
  }
}

// Detect origin from install source
function detectOrigin(source: string) {
  if (source.startsWith('skills:')) return 'skills.sh' as const;
  if (source.startsWith('github:')) return 'github' as const;
  if (source.startsWith('npm:')) return 'npm' as const;
  return 'url' as const;
}
