import * as fs from 'fs';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';

const DEFAULT_RESULTS_DIR = path.resolve(process.cwd(), 'allure-results');
const DEFAULT_REPORT_DIR = path.resolve(process.cwd(), 'allure-report');

/**
 * Ensures JAVA_HOME is correctly set and points to a valid Java installation.
 * Automatically resolves common Windows path discrepancies (e.g. jre-1.8\bin or jdk-22).
 */
export function ensureJavaHome(): string | undefined {
  const currentJavaHome = process.env.JAVA_HOME;

  // Check if current JAVA_HOME is valid
  if (currentJavaHome) {
    const javaExe = process.platform === 'win32'
      ? path.join(currentJavaHome, 'bin', 'java.exe')
      : path.join(currentJavaHome, 'bin', 'java');

    if (fs.existsSync(javaExe)) {
      return currentJavaHome;
    }
  }

  // Windows fallback search paths
  if (process.platform === 'win32') {
    const candidatePaths = [
      'C:\\Program Files\\Java\\jdk-22',
      'C:\\Program Files\\Java\\jdk-21',
      'C:\\Program Files\\Java\\jdk-17',
      'C:\\Program Files\\Java\\jdk-11',
      'C:\\Program Files\\Java\\jdk-1.8',
    ];

    for (const candidate of candidatePaths) {
      if (fs.existsSync(path.join(candidate, 'bin', 'java.exe'))) {
        process.env.JAVA_HOME = candidate;
        return candidate;
      }
    }

    // Check directory list inside C:\Program Files\Java
    const javaRoot = 'C:\\Program Files\\Java';
    if (fs.existsSync(javaRoot)) {
      const subdirs = fs.readdirSync(javaRoot);
      for (const subdir of subdirs) {
        const fullPath = path.join(javaRoot, subdir);
        if (fs.existsSync(path.join(fullPath, 'bin', 'java.exe'))) {
          process.env.JAVA_HOME = fullPath;
          return fullPath;
        }
      }
    }
  }

  return process.env.JAVA_HOME;
}

/**
 * Ensures both allure-results and allure-report directories exist.
 */
export function ensureFolders(
  resultsDir = DEFAULT_RESULTS_DIR,
  reportDir = DEFAULT_REPORT_DIR
): { resultsDir: string; reportDir: string } {
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

  return { resultsDir, reportDir };
}

/**
 * Cleans the contents of allure-results folder while preserving .gitkeep.
 */
export function cleanResults(resultsDir = DEFAULT_RESULTS_DIR): void {
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
    return;
  }
  const files = fs.readdirSync(resultsDir);
  for (const file of files) {
    if (file === '.gitkeep') continue;
    fs.rmSync(path.join(resultsDir, file), { recursive: true, force: true });
  }
}

/**
 * Cleans the contents of allure-report folder while preserving .gitkeep.
 */
export function cleanReport(reportDir = DEFAULT_REPORT_DIR): void {
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
    return;
  }
  const files = fs.readdirSync(reportDir);
  for (const file of files) {
    if (file === '.gitkeep') continue;
    fs.rmSync(path.join(reportDir, file), { recursive: true, force: true });
  }
}

export interface GenerateOptions {
  resultsDir?: string;
  reportDir?: string;
  clean?: boolean;
}

/**
 * Converts Allure result files to the Allure HTML report.
 */
export function generateReport(options: GenerateOptions = {}): Promise<number> {
  const {
    resultsDir = DEFAULT_RESULTS_DIR,
    reportDir = DEFAULT_REPORT_DIR,
    clean = true,
  } = options;

  ensureFolders(resultsDir, reportDir);
  ensureJavaHome();

  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const allure = require('allure-commandline');
    const args = ['generate', resultsDir, '-o', reportDir];
    if (clean) {
      args.push('--clean');
    }

    console.log(`[Allure] Converting results from "${resultsDir}" into report at "${reportDir}"...`);
    const generation = allure(args);

    generation.on('exit', (exitCode: number) => {
      if (exitCode === 0) {
        console.log(`[Allure] Report successfully generated to "${reportDir}".`);
        resolve(exitCode);
      } else {
        const errorMsg = `[Allure] Generation failed with exit code ${exitCode}`;
        console.error(errorMsg);
        reject(new Error(errorMsg));
      }
    });

    generation.on('error', (err: Error) => {
      console.error('[Allure] Failed to launch Allure command-line:', err);
      reject(err);
    });
  });
}

export interface OpenOptions {
  reportDir?: string;
  port?: number;
  detached?: boolean;
}

/**
 * Opens the Allure HTML report in the default browser.
 */
export function openReport(options: OpenOptions = {}): ChildProcess {
  const {
    reportDir = DEFAULT_REPORT_DIR,
    port,
    detached = false,
  } = options;

  ensureFolders(undefined, reportDir);
  ensureJavaHome();

  const allureBin = require.resolve('allure-commandline/bin/allure');
  const args = [allureBin, 'open', reportDir];
  if (port) {
    args.push('-p', port.toString());
  }

  console.log(`[Allure] Opening report from "${reportDir}" in browser...`);

  if (detached) {
    const child = spawn(process.execPath, args, {
      env: process.env,
      detached: true,
      stdio: 'ignore',
      windowsHide: false,
    });
    child.unref();
    console.log(`[Allure] Preview server launched in background (PID: ${child.pid}).`);
    return child;
  }

  // Interactive foreground mode
  const child = spawn(process.execPath, args, {
    env: process.env,
    stdio: 'inherit',
  });
  return child;
}

/**
 * Converts Allure results to an HTML report and opens the report.
 */
export async function convertAndOpenReport(options: GenerateOptions & OpenOptions = {}): Promise<void> {
  await generateReport(options);
  openReport(options);
}
