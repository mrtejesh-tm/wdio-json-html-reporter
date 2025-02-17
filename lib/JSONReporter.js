import fs from 'fs';
import path from 'path';
import WDIOReporter from '@wdio/reporter';

/**
 * Custom JSON Reporter that generates a report with timestamps,
 * optional screenshots, and metadata for WebDriverIO tests.
 *
 * Options:
 * - outputFile: the path where the JSON file is to be written.
 * - screenshotOption: "No" (default), "OnFailure", or "Full"
 */
export default class JSONReporter extends WDIOReporter {
  constructor(options) {
    // Default options: stdout true and screenshotOption defaults to "No"
    options = Object.assign({ stdout: true, screenshotOption: 'No' }, options);
    super(options);
    this.options = options;
    this.testResults = [];
    this.executionStartTime = new Date();
    // Ensure the directory for the output file exists.
    this.ensureDirectoryExistence(this.options.outputFile);
  }

  async onRunnerEnd() {
    this.writeJSONReport();
  }

  async onTestPass(test) {
    await this.addTestResult(test, 'PASSED');
  }

  async onTestFail(test) {
    await this.addTestResult(test, 'FAILED');
  }

  /**
   * Captures test result details.
   * Uses a unique identifier (from test.uid if available, otherwise generated)
   * so that even tests with duplicate titles are reported only once.
   */
  async addTestResult(test, status) {
    const timestamp = new Date().toISOString();
    // Use test.uid if available; otherwise, generate one from the title and current timestamp.
    const uid = test.uid || `${test.title}-${timestamp}`;
    // Use the parent (suite) name if available; otherwise default.
    const suiteName = test.parent ? test.parent.trim() : 'Default Suite';
    // Capture error message (only the first line) and full stack trace if available.
    const error = test.error ? this.sanitizeErrorMessage(test.error.message) : '';
    const stack = test.error ? this.sanitizeErrorMessage(test.error.stack, true) : '';
    let screenshotPath = '';

    // If screenshots should be captured on failure or for all tests:
    if (
      this.options.screenshotOption === 'Full' ||
      (this.options.screenshotOption === 'OnFailure' && status === 'FAILED')
    ) {
      try {
        // Capture screenshot using the global browser object.
        const screenshotData = await browser.takeScreenshot();
        const screenshotDir = path.join(path.dirname(this.options.outputFile), 'screenshots');
        if (!fs.existsSync(screenshotDir)) {
          fs.mkdirSync(screenshotDir, { recursive: true });
        }
        const safeTestTitle = test.title.replace(/[^a-z0-9]/gi, '_');
        const safeTimestamp = timestamp.replace(/:/g, '-');
        const screenshotFileName = `screenshot-${safeTestTitle}-${safeTimestamp}.png`;
        screenshotPath = path.join(screenshotDir, screenshotFileName);
        fs.writeFileSync(screenshotPath, screenshotData, 'base64');
      } catch (err) {
        console.error('Error capturing screenshot: ', err);
      }
    }

    // Only add a result if one with the same uid hasn't been recorded already.
    if (!this.testResults.find(result => result.uid === uid)) {
      this.testResults.push({
        uid,
        timestamp,
        suiteName,
        testName: test.title,
        status,
        error,
        stack,
        screenshot: screenshotPath,
      });
    }
  }

  writeJSONReport() {
    const executionEndTime = new Date();
    const totalTimeMinutes = ((executionEndTime - this.executionStartTime) / 60000).toFixed(2);
    const browserName =
      browser && browser.capabilities && browser.capabilities.browserName
        ? browser.capabilities.browserName
        : 'Unknown';

    const metadata = {
      browserName,
      executionStartTime: this.executionStartTime.toISOString(),
      executionEndTime: executionEndTime.toISOString(),
      totalTimeInMinutes: totalTimeMinutes,
    };

    const report = {
      metadata,
      testResults: this.testResults,
    };

    // Use a timestamp-safe filename
    const fileTimestamp = new Date().toISOString().replace(/:/g, '-');
    const fileName = `test-report-${fileTimestamp}.json`;
    const outputFile = path.join(path.dirname(this.options.outputFile), fileName);
    fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
    console.log(`JSON report successfully written to ${outputFile}`);
  }

  /**
   * Sanitizes error messages by removing unwanted ANSI characters.
   * If 'full' is true, returns the complete sanitized string; otherwise,
   * returns only the first line.
   */
  sanitizeErrorMessage(errorMessage, full = false) {
    const sanitized = errorMessage
      .replace(/[\u001b\u009b]\[\d{1,2}(;\d{1,2})?(m|K)/g, '')
      .trim();
    return full ? sanitized : sanitized.split('\n')[0];
  }

  ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
      return true;
    }
    fs.mkdirSync(dirname, { recursive: true });
  }
}