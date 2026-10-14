/**
 * Utility script to clean allure-results and/or allure-report while keeping directories and .gitkeep intact.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const resultsDir = path.join(rootDir, 'allure-results');
const reportDir = path.join(rootDir, 'allure-report');

function cleanDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(path.join(dirPath, '.gitkeep'), '# Preserve directory\n');
    return;
  }

  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    if (item === '.gitkeep') continue;
    fs.rmSync(path.join(dirPath, item), { recursive: true, force: true });
  }

  const gitkeep = path.join(dirPath, '.gitkeep');
  if (!fs.existsSync(gitkeep)) {
    fs.writeFileSync(gitkeep, '# Preserve directory\n');
  }
}

cleanDir(resultsDir);
console.log('[Allure] Cleaned allure-results directory (preserved .gitkeep).');

if (process.argv.includes('--all')) {
  cleanDir(reportDir);
  console.log('[Allure] Cleaned allure-report directory (preserved .gitkeep).');
}
