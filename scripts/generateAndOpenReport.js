/**
 * Standalone Node.js script to manage Allure report generation and preview.
 * Usage:
 *   node scripts/generateAndOpenReport.js                 # Convert results and open report
 *   node scripts/generateAndOpenReport.js --generate-only # Only convert results to report
 *   node scripts/generateAndOpenReport.js --open-only     # Only open existing report
 *   node scripts/generateAndOpenReport.js --port 5050     # Open on specific port
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const resultsDir = path.join(rootDir, 'allure-results');
const reportDir = path.join(rootDir, 'allure-report');

function ensureJavaHome() {
  const currentJavaHome = process.env.JAVA_HOME;
  if (currentJavaHome) {
    const javaExe = process.platform === 'win32'
      ? path.join(currentJavaHome, 'bin', 'java.exe')
      : path.join(currentJavaHome, 'bin', 'java');
    if (fs.existsSync(javaExe)) {
      return currentJavaHome;
    }
  }

  if (process.platform === 'win32') {
    const candidates = [
      'C:\\Program Files\\Java\\jdk-22',
      'C:\\Program Files\\Java\\jdk-21',
      'C:\\Program Files\\Java\\jdk-17',
      'C:\\Program Files\\Java\\jdk-11',
      'C:\\Program Files\\Java\\jdk-1.8',
    ];

    for (const cand of candidates) {
      if (fs.existsSync(path.join(cand, 'bin', 'java.exe'))) {
        process.env.JAVA_HOME = cand;
        return cand;
      }
    }

    const javaRoot = 'C:\\Program Files\\Java';
    if (fs.existsSync(javaRoot)) {
      try {
        const subdirs = fs.readdirSync(javaRoot);
        for (const sub of subdirs) {
          const full = path.join(javaRoot, sub);
          if (fs.existsSync(path.join(full, 'bin', 'java.exe'))) {
            process.env.JAVA_HOME = full;
            return full;
          }
        }
      } catch {
        // Ignore read error
      }
    }
  }

  return process.env.JAVA_HOME;
}

function ensureFolders() {
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  const resultsGitKeep = path.join(resultsDir, '.gitkeep');
  if (!fs.existsSync(resultsGitKeep)) {
    fs.writeFileSync(resultsGitKeep, '# Preserve directory\n');
  }

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  const reportGitKeep = path.join(reportDir, '.gitkeep');
  if (!fs.existsSync(reportGitKeep)) {
    fs.writeFileSync(reportGitKeep, '# Preserve directory\n');
  }
}

function generateReport() {
  ensureFolders();
  ensureJavaHome();

  return new Promise((resolve, reject) => {
    const allure = require('allure-commandline');
    console.log(`[Allure] Converting results from: ${resultsDir}`);
    console.log(`[Allure] Generating report into: ${reportDir}`);

    const proc = allure(['generate', resultsDir, '--clean', '-o', reportDir]);

    proc.on('exit', (code) => {
      if (code === 0) {
        console.log('[Allure] Report successfully generated to allure-report! ✅');
        resolve(0);
      } else {
        const err = new Error(`[Allure] Generation failed with exit code: ${code}`);
        console.error(err.message);
        reject(err);
      }
    });

    proc.on('error', (err) => {
      console.error('[Allure] Failed to launch Allure CLI:', err);
      reject(err);
    });
  });
}

function openReport(port) {
  ensureFolders();
  ensureJavaHome();

  const allureBin = require.resolve('allure-commandline/bin/allure');
  const args = [allureBin, 'open', reportDir];
  if (port) {
    args.push('-p', port.toString());
  }

  console.log(`[Allure] Opening Allure report from "${reportDir}" in browser...`);
  console.log('[Allure] Starting local web server. Press Ctrl+C to stop.');

  const child = spawn(process.execPath, args, {
    env: process.env,
    stdio: 'inherit',
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const isGenerateOnly = args.includes('--generate-only');
  const isOpenOnly = args.includes('--open-only');
  const portIndex = args.indexOf('--port');
  const port = portIndex !== -1 && args[portIndex + 1] ? args[portIndex + 1] : undefined;

  ensureFolders();
  ensureJavaHome();

  if (isOpenOnly) {
    openReport(port);
    return;
  }

  if (isGenerateOnly) {
    await generateReport();
    return;
  }

  // Default: generate and open
  await generateReport();
  openReport(port);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
