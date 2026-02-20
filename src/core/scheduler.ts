import cron from 'node-cron';
import chalk from 'chalk';
import { getSkillsByMode, updateSkillStatus, SkillEntry } from '../skills/registry.js';
import { setAgentStatus, recordSkillRun, isCloudTier } from './state.js';

// Store all active cron jobs so we can stop them later
const activeJobs: Map<string, cron.ScheduledTask> = new Map();

// Store all active trigger watchers
const activeTriggers: Map<string, NodeJS.Timeout> = new Map();

// ─────────────────────────────────────────
// SCHEDULED SKILLS
// Runs a skill on a cron schedule
// e.g. every 15 minutes: "*/15 * * * *"
// ─────────────────────────────────────────

// Start a scheduled skill
export async function startScheduledSkill(skill: SkillEntry): Promise<void> {
  // Cloud tier check
  if (!(await isCloudTier())) {
    console.log(chalk.blue(`🔵 ${skill.name} requires Cloud tier to run on a schedule.`));
    console.log(chalk.dim('   Upgrade at zeroagentos.com to activate scheduled skills.'));
    await updateSkillStatus(skill.name, 'locked');
    return;
  }

  if (!skill.schedule) {
    console.log(chalk.red(`❌ No schedule defined for ${skill.name}`));
    return;
  }

  // Don't start if already running
  if (activeJobs.has(skill.name)) {
    console.log(chalk.yellow(`⚠️  ${skill.name} is already scheduled.`));
    return;
  }

  console.log(
    chalk.green(`⏰ Scheduling ${chalk.bold(skill.name)} — ${skill.schedule}`)
  );

  const job = cron.schedule(skill.schedule, async () => {
    console.log(chalk.dim(`\n[${new Date().toLocaleTimeString()}] Running ${skill.name}...`));
    await runSkillExecution(skill);
  });

  activeJobs.set(skill.name, job);
  await updateSkillStatus(skill.name, 'active');
  console.log(chalk.green(`✅ ${skill.name} is now running on schedule.`));
}

// Stop a scheduled skill
export async function stopScheduledSkill(skillName: string): Promise<void> {
  const job = activeJobs.get(skillName);
  if (job) {
    job.stop();
    activeJobs.delete(skillName);
    await updateSkillStatus(skillName, 'inactive');
    console.log(chalk.yellow(`⏹  ${skillName} schedule stopped.`));
  } else {
    console.log(chalk.dim(`${skillName} is not currently scheduled.`));
  }
}

// ─────────────────────────────────────────
// TRIGGERED SKILLS
// Runs a skill when a condition is met
// e.g. "alert me when BTC drops below $80,000"
// ─────────────────────────────────────────

// Start watching a trigger condition
export async function startTriggeredSkill(
  skill: SkillEntry,
  checkFn: () => Promise<boolean>  // Function that returns true when condition is met
): Promise<void> {
  // Cloud tier check
  if (!(await isCloudTier())) {
    console.log(chalk.blue(`🔵 ${skill.name} requires Cloud tier to run as a trigger.`));
    console.log(chalk.dim('   Upgrade at zeroagentos.com to activate triggered skills.'));
    await updateSkillStatus(skill.name, 'locked');
    return;
  }

  if (!skill.trigger) {
    console.log(chalk.red(`❌ No trigger condition defined for ${skill.name}`));
    return;
  }

  // Don't start if already watching
  if (activeTriggers.has(skill.name)) {
    console.log(chalk.yellow(`⚠️  ${skill.name} trigger is already active.`));
    return;
  }

  console.log(
    chalk.green(`👁  Watching ${chalk.bold(skill.name)} — condition: ${skill.trigger.condition}`)
  );

  // Check the condition every 60 seconds
  const interval = setInterval(async () => {
    try {
      const conditionMet = await checkFn();
      if (conditionMet) {
        console.log(
          chalk.green(`\n🔔 [${new Date().toLocaleTimeString()}] Trigger fired: ${skill.name}`)
        );
        console.log(chalk.dim(`   Condition met: ${skill.trigger?.condition}`));
        await runSkillExecution(skill);
      }
    } catch (error) {
      console.log(chalk.red(`❌ Error checking trigger for ${skill.name}`));
    }
  }, 60 * 1000); // Check every 60 seconds

  activeTriggers.set(skill.name, interval);
  await updateSkillStatus(skill.name, 'active');
  console.log(chalk.green(`✅ ${skill.name} trigger is now active.`));
}

// Stop watching a trigger
export async function stopTriggeredSkill(skillName: string): Promise<void> {
  const interval = activeTriggers.get(skillName);
  if (interval) {
    clearInterval(interval);
    activeTriggers.delete(skillName);
    await updateSkillStatus(skillName, 'inactive');
    console.log(chalk.yellow(`⏹  ${skillName} trigger stopped.`));
  } else {
    console.log(chalk.dim(`${skillName} trigger is not currently active.`));
  }
}

// ─────────────────────────────────────────
// SCHEDULER MANAGEMENT
// ─────────────────────────────────────────

// Start all scheduled and triggered skills on agent boot
export async function startAllScheduledSkills(): Promise<void> {
  if (!(await isCloudTier())) {
    console.log(chalk.dim('Scheduled skills require Cloud tier. Skipping.'));
    return;
  }

  const scheduledSkills = await getSkillsByMode('scheduled');
  const triggeredSkills = await getSkillsByMode('triggered');

  if (scheduledSkills.length === 0 && triggeredSkills.length === 0) {
    console.log(chalk.dim('No scheduled or triggered skills to start.'));
    return;
  }

  console.log(chalk.bold('\n⏰ Starting scheduled skills...\n'));

  for (const skill of scheduledSkills) {
    if (skill.schedule) {
      await startScheduledSkill(skill);
    }
  }

  for (const skill of triggeredSkills) {
    console.log(chalk.dim(`Trigger ready: ${skill.name} — set condition to activate`));
  }
}

// Stop all running jobs and triggers
export async function stopAllScheduledSkills(): Promise<void> {
  console.log(chalk.yellow('\n⏹  Stopping all scheduled skills...\n'));

  for (const [skillName] of activeJobs) {
    await stopScheduledSkill(skillName);
  }

  for (const [skillName] of activeTriggers) {
    await stopTriggeredSkill(skillName);
  }

  console.log(chalk.green('✅ All scheduled skills stopped.'));
}

// Get a summary of what's currently running
export function getSchedulerStatus(): void {
  const scheduledCount = activeJobs.size;
  const triggeredCount = activeTriggers.size;

  console.log(chalk.bold('\n⏰ Scheduler Status\n'));

  if (scheduledCount === 0 && triggeredCount === 0) {
    console.log(chalk.dim('  No skills currently running in background.'));
  } else {
    if (scheduledCount > 0) {
      console.log(chalk.green(`  📅 Scheduled: ${scheduledCount} skill(s) running`));
      for (const [name] of activeJobs) {
        console.log(chalk.dim(`     • ${name}`));
      }
    }
    if (triggeredCount > 0) {
      console.log(chalk.green(`  👁  Triggered: ${triggeredCount} skill(s) watching`));
      for (const [name] of activeTriggers) {
        console.log(chalk.dim(`     • ${name}`));
      }
    }
  }
  console.log();
}

// ─────────────────────────────────────────
// SKILL EXECUTION
// Shared execution logic for all modes
// ─────────────────────────────────────────

async function runSkillExecution(skill: SkillEntry): Promise<void> {
  try {
    await setAgentStatus('running');

    // Dynamic import of the skill's index.js
    const skillPath = `${process.env.HOME}/.zeroagent/skills/${skill.name}/index.js`;
    const skillModule = await import(skillPath);

    if (typeof skillModule.run === 'function') {
      await skillModule.run();
      await recordSkillRun(skill.name, true);
    } else {
      throw new Error(`Skill ${skill.name} does not export a run() function`);
    }

    await setAgentStatus('idle');
  } catch (error) {
    console.log(chalk.red(`❌ ${skill.name} failed to execute`));
    await recordSkillRun(skill.name, false);
    await setAgentStatus('error');
  }
}
