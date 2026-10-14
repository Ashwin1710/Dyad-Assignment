import { FullConfig } from '@playwright/test';
import { generateReport, openReport } from './allureReport';

/**
 * Playwright Global Teardown hook.
 * Executes automatically after all test workers finish.
 * Converts Allure results to the HTML report and opens it in the browser.
 */
export default async function globalTeardown(config: FullConfig): Promise<void> {
  const isCI = !!process.env.CI;
  const shouldOpen = process.env.AUTO_OPEN_ALLURE !== 'false' && !isCI;

  console.log('\n========================================');
  console.log(' [Allure] Tests Finished: Processing Report');
  console.log('========================================');

  try {
    await generateReport();
    console.log('[Allure] Successfully converted results into allure-report/ ✅');

    if (shouldOpen) {
      console.log('[Allure] Launching Allure report preview in browser...');
      openReport({ detached: true });
    } else if (isCI) {
      console.log('[Allure] CI detected; skipped opening browser GUI.');
    } else {
      console.log('[Allure] AUTO_OPEN_ALLURE is disabled; report is ready at allure-report/');
    }
  } catch (error) {
    console.error('[Allure] Error generating/opening Allure report:', error);
  }
}
