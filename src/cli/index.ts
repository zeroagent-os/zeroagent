#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { bootAgent, agentInstall, agentRun, agentRemove, agentStatus, agentList, agentSchedule, agentTrigger } from '../core/agent.js';

const program = new Command();

// ─────────────────────────────────────────
// ZERO AGENT CLI
// ─────────────────────────────────────────

program
  .name('zeroagent')
  .description('Your personal AI agent. No coding required.')
  .version('0.1.0');

// ─────────────────────────────────────────
// BOOT
// zeroagent start
// ─────────────────────────────────────────

program
  .command('start')
  .description('Boot your ZERO AGENT')
  .action(async () => {
    await bootAgent();
  });

// ─────────────────────────────────────────
// INSTALL
// zeroagent install skills:btc-price-tracker
// zeroagent install github:username/skill-name
// zeroagent install npm:skill-package
// zeroagent install https://github.com/org/repo --skill skill-name
// ─────────────────────────────────────────

program
  .command('install <source>')
  .description('Install a skill from skills.sh, GitHub, npm or any URL')
  .option('--skill <name>', 'Skill name (required for URL installs)')
  .action(async (source: string, options: { skill?: string }) => {
    await agentInstall(source, options.skill);
  });

// ─────────────────────────────────────────
// RUN
// zeroagent run btc-price-tracker
// ─────────────────────────────────────────

program
  .command('run <skillName>')
  .description('Run an installed skill')
  .option('--input <json>', 'Input data as JSON string')
  .action(async (skillName: string, options: { input?: string }) => {
    let inputs: Record<string, unknown> = {};
    if (options.input) {
      try {
        inputs = JSON.parse(options.input);
      } catch {
        console.log(chalk.red('❌ Invalid JSON input. Use: --input \'{"key":"value"}\''));
        return;
      }
    }
    await agentRun(skillName, inputs);
  });

// ─────────────────────────────────────────
// LIST
// zeroagent list
// ─────────────────────────────────────────

program
  .command('list')
  .description('List all installed skills')
  .action(async () => {
    await agentList();
  });

// ─────────────────────────────────────────
// REMOVE
// zeroagent remove btc-price-tracker
// ─────────────────────────────────────────

program
  .command('remove <skillName>')
  .description('Remove an installed skill')
  .action(async (skillName: string) => {
    await agentRemove(skillName);
  });

// ─────────────────────────────────────────
// STATUS
// zeroagent status
// ─────────────────────────────────────────

program
  .command('status')
  .description('Show agent status and running skills')
  .action(async () => {
    await agentStatus();
  });

// ─────────────────────────────────────────
// FIND
// zeroagent find "btc price tracker"
// ─────────────────────────────────────────

program
  .command('find <query>')
  .description('Find skills from across the internet')
  .action(async (query: string) => {
    console.log(chalk.bold(`\n🔍 Searching for skills: "${query}"\n`));
    console.log(chalk.dim('Powered by find-skills from Vercel Labs\n'));

    try {
      const { execSync } = await import('child_process');
      execSync(`npx skills find ${query}`, { stdio: 'inherit' });
    } catch {
      console.log(chalk.yellow('\n💡 Tip: Try different keywords or browse skills.sh directly.'));
      console.log(chalk.cyan('   https://skills.sh\n'));
    }
  });

// ─────────────────────────────────────────
// SCHEDULE
// zeroagent schedule btc-price-tracker "*/15 * * * *"
// ─────────────────────────────────────────

program
  .command('schedule <skillName> <cron>')
  .description('Run a skill on a schedule (Cloud tier required)')
  .addHelpText('after', `
Examples:
  zeroagent schedule btc-price-tracker "*/15 * * * *"   Every 15 minutes
  zeroagent schedule sales-report "0 9 * * *"           Every day at 9am
  zeroagent schedule price-check "0 * * * *"            Every hour`)
  .action(async (skillName: string, cron: string) => {
    await agentSchedule(skillName, cron);
  });

// ─────────────────────────────────────────
// TRIGGER
// zeroagent trigger btc-price-tracker "btc_price < 80000"
// ─────────────────────────────────────────

program
  .command('trigger <skillName> <condition>')
  .description('Run a skill when a condition is met (Cloud tier required)')
  .option('--value <value>', 'Threshold value for the condition')
  .addHelpText('after', `
Examples:
  zeroagent trigger btc-alert "btc_price < 80000" --value 80000
  zeroagent trigger stock-alert "price > 200" --value 200`)
  .action(async (
    skillName: string,
    condition: string,
    options: { value?: string }
  ) => {
    const value = options.value ? parseFloat(options.value) || options.value : condition;

    // Basic check function — skill defines its own real check logic
    const checkFn = async (): Promise<boolean> => {
      try {
        const skillPath = `${process.env.HOME}/.zeroagent/skills/${skillName}/index.js`;
        const skillModule = await import(skillPath);
        if (typeof skillModule.check === 'function') {
          return await skillModule.check(value);
        }
        return false;
      } catch {
        return false;
      }
    };

    await agentTrigger(skillName, condition, value, checkFn);
  });

// ─────────────────────────────────────────
// UPGRADE
// zeroagent upgrade
// ─────────────────────────────────────────

program
  .command('upgrade')
  .description('Upgrade to Cloud tier for unlimited skills and scheduled execution')
  .action(() => {
    console.log(chalk.bold('\n☁️  Upgrade to ZERO AGENT Cloud\n'));
    console.log('  Unlimited skills');
    console.log('  Scheduled skills — run on a timer');
    console.log('  Triggered skills — run on a condition');
    console.log('  Managed hosting — no server needed');
    console.log(chalk.cyan('\n  👉 zeroagentos.com\n'));
  });

// ─────────────────────────────────────────
// WHOAMI
// zeroagent whoami
// ─────────────────────────────────────────

program
  .command('whoami')
  .description('Show your agent details')
  .action(async () => {
    await agentStatus();
  });

// ─────────────────────────────────────────
// HANDLE UNKNOWN COMMANDS
// ─────────────────────────────────────────

program.on('command:*', () => {
  console.log(chalk.red(`\n❌ Unknown command: ${program.args.join(' ')}`));
  console.log(chalk.dim('\nRun zeroagent --help to see available commands.\n'));
  process.exit(1);
});

// ─────────────────────────────────────────
// SHOW HELP IF NO COMMAND
// ─────────────────────────────────────────

if (process.argv.length < 3) {
  console.log(chalk.bold('\n🤖 ZERO AGENT\n'));
  console.log(chalk.dim('Your personal AI agent. No coding required.\n'));
  program.help();
}

program.parse(process.argv);
