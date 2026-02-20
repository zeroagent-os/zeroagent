import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

// Where the state file lives on the user's machine
const STATE_PATH = path.join(process.env.HOME || '', '.zeroagent', 'state.json');

// User tier
export type UserTier = 'free' | 'cloud';

// Agent status
export type AgentStatus = 'idle' | 'running' | 'error';

// The full agent state
export interface AgentState {
  version: string;           // ZERO AGENT version
  agentName: string;         // User's agent name e.g. "Sara's Agent"
  tier: UserTier;            // free or cloud
  status: AgentStatus;       // idle, running or error
  createdAt: string;         // ISO date — when agent was first created
  updatedAt: string;         // ISO date — last updated
  totalSkillsInstalled: number; // Running count of all skills ever installed
  activeSkillCount: number;  // Current active skills
  baseSkills: string[];      // Pre-installed base skills e.g. ["find-skills"]
  lastRun?: {                // Last skill that was run
    skillName: string;
    ranAt: string;
    success: boolean;
  };
}

// Default state for a brand new agent
const DEFAULT_STATE: AgentState = {
  version: '0.1.0',
  agentName: 'My Agent',
  tier: 'free',
  status: 'idle',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  totalSkillsInstalled: 0,
  activeSkillCount: 0,
  baseSkills: ['find-skills'], // find-skills pre-installed on every new agent
};

// Load state from disk — creates fresh state if it doesn't exist
export async function loadState(): Promise<AgentState> {
  try {
    if (await fs.pathExists(STATE_PATH)) {
      return await fs.readJson(STATE_PATH);
    }
  } catch {
    // State corrupted or missing — start fresh
    console.log(chalk.yellow('⚠️  State file corrupted. Starting fresh.'));
  }

  // First time — create and save default state
  await saveState(DEFAULT_STATE);
  console.log(chalk.green('✅ New agent created successfully.'));
  return DEFAULT_STATE;
}

// Save state to disk
export async function saveState(state: AgentState): Promise<void> {
  await fs.ensureDir(path.dirname(STATE_PATH));
  state.updatedAt = new Date().toISOString();
  await fs.writeJson(STATE_PATH, state, { spaces: 2 });
}

// Update a specific field in the state
export async function updateState(
  updates: Partial<AgentState>
): Promise<AgentState> {
  const state = await loadState();
  const updated = { ...state, ...updates };
  await saveState(updated);
  return updated;
}

// Set the agent's name
export async function setAgentName(name: string): Promise<void> {
  await updateState({ agentName: name });
  console.log(chalk.green(`✅ Agent renamed to "${name}"`));
}

// Set the user's tier
export async function setTier(tier: UserTier): Promise<void> {
  await updateState({ tier });
  const label = tier === 'cloud'
    ? chalk.blue('☁️  Cloud tier activated')
    : chalk.green('🟢 Free tier');
  console.log(label);
}

// Set agent status
export async function setAgentStatus(status: AgentStatus): Promise<void> {
  await updateState({ status });
}

// Record the last skill run
export async function recordSkillRun(
  skillName: string,
  success: boolean
): Promise<void> {
  await updateState({
    lastRun: {
      skillName,
      ranAt: new Date().toISOString(),
      success
    }
  });
}

// Increment skill count when a new skill is installed
export async function incrementSkillCount(): Promise<void> {
  const state = await loadState();
  await updateState({
    totalSkillsInstalled: state.totalSkillsInstalled + 1,
    activeSkillCount: state.activeSkillCount + 1
  });
}

// Decrement skill count when a skill is removed
export async function decrementSkillCount(): Promise<void> {
  const state = await loadState();
  await updateState({
    activeSkillCount: Math.max(0, state.activeSkillCount - 1)
  });
}

// Check if user is on free tier
export async function isFreeTier(): Promise<boolean> {
  const state = await loadState();
  return state.tier === 'free';
}

// Check if user is on cloud tier
export async function isCloudTier(): Promise<boolean> {
  const state = await loadState();
  return state.tier === 'cloud';
}

// Print a clean agent summary to the terminal
export async function printAgentSummary(): Promise<void> {
  const state = await loadState();

  const tierLabel = state.tier === 'cloud'
    ? chalk.blue('☁️  Cloud')
    : chalk.green('🟢 Free');

  const statusLabel = state.status === 'running'
    ? chalk.green('● Running')
    : state.status === 'error'
    ? chalk.red('● Error')
    : chalk.dim('○ Idle');

  console.log(chalk.bold(`\n🤖 ${state.agentName}\n`));
  console.log(`  Tier:    ${tierLabel}`);
  console.log(`  Status:  ${statusLabel}`);
  console.log(`  Skills:  ${state.activeSkillCount} active`);

  if (state.tier === 'free') {
    const remaining = 5 - state.activeSkillCount;
    if (remaining <= 1) {
      console.log(
        chalk.yellow(`\n  ⚠️  You have ${remaining} free skill slot remaining.`)
      );
      console.log(
        chalk.dim('  Upgrade to Cloud for unlimited skills.')
      );
    }
  }

  if (state.lastRun) {
    const ranAt = new Date(state.lastRun.ranAt).toLocaleString();
    const result = state.lastRun.success
      ? chalk.green('✅ Success')
      : chalk.red('❌ Failed');
    console.log(
      chalk.dim(`\n  Last run: ${state.lastRun.skillName} — ${result} at ${ranAt}`)
    );
  }

  console.log();
}
