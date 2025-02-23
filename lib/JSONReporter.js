import fs from 'fs';
import path from 'path';
import WDIOReporter from '@wdio/reporter';

/**
 * Custom JSON Reporter that generates a report with timestamps,
 * optional screenshots, browser logs, spec console logs, and metadata for WebDriverIO tests.
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
    this.testResultUids = new Set(); // For optimized duplicate check
    this.executionStartTime = new Date(); // Store as Date object
    fs.mkdirSync(path.dirname(this.options.outputFile), { recursive: true });
    // Buffer to capture spec file console logs for each test.
    this.currentTestSpecLogs = [];
  }

  /**
   * Reset spec log buffer when a test starts.
   */
  onTestStart(test) {
    this.currentTestSpecLogs = [];
  }

  /**
   * Capture any stdout output from the spec files.
   */
  onStdout(chunk, pid) {
    if (this.currentTestSpecLogs) {
      this.currentTestSpecLogs.push(chunk.toString());
    }
  }

  async onRunnerEnd() {
    await this.writeJSONReport();
  }

  async onTestPass(test) {
    await this.addTestResult(test, 'PASSED');
  }

  async onTestFail(test) {
    await this.addTestResult(test, 'FAILED');
  }

  /**
   * Captures test result details along with optional screenshot,
   * browser logs, and spec console logs.
   */
  async addTestResult(test, status) {
    const date = new Date();
    const timestamp = date.toUTCString();
    // Use test.uid if available; otherwise generate one.
    const uid = test.uid || `${test.title}-${timestamp}`;
    // Use the parent (suite) name if available; otherwise default.
    const suiteName = test.parent ? test.parent.replace(/suite\d+/gi, '').trim() : 'Default Suite';
    const error = test.error ? this.sanitizeErrorMessage(test.error.message, true) : '';
    const stack = test.error ? this.sanitizeErrorMessage(test.error.stack, true) : '';
    let screenshotPath = '';

    // Handle screenshot capture if enabled.
    if (
      this.options.screenshotOption === 'Full' ||
      (this.options.screenshotOption === 'OnFailure' && status === 'FAILED')
    ) {
      try {
        const screenshotData = await browser.takeScreenshot();
        const screenshotDir = path.join(path.dirname(this.options.outputFile), 'screenshots');
        fs.mkdirSync(screenshotDir, { recursive: true });
        const hash = this.generateShortHash(test.title);
        const safeTimestamp = this.formatDateForFilename(date);
        const screenshotFileName = `screenshot-${hash}-${safeTimestamp}.png`;
        screenshotPath = path.join(screenshotDir, screenshotFileName);
        fs.writeFileSync(screenshotPath, screenshotData, 'base64');
      } catch (err) {
        console.error('Error capturing screenshot: ', err);
      }
    }

    // Capture browser logs (from the browser's console)
    let browserConsoleLogs = [];
    // Only attempt to capture logs if using the legacy (non‑W3C) protocol
    // which supports log retrieval.
    if (
      browser &&
      !browser.isW3C &&
      typeof browser.getLogs === 'function' &&
      browser.logTypes &&
      browser.logTypes.includes('browser')
    ) {
      try {
        browserConsoleLogs = await browser.getLogs('browser');
      } catch (err) {
        if (err.code === 'ECONNREFUSED') {
          console.warn('Browser logs not available: Connection refused');
        } else {
          console.error('Error capturing browser logs: ', err);
        }
      }
    }

    // Capture spec file console logs that were buffered via onStdout.
    const specConsoleLogs = this.currentTestSpecLogs || [];
    // Clear the buffer.
    this.currentTestSpecLogs = [];

    if (!this.testResultUids.has(uid)) {
      this.testResults.push({
        uid,
        timestamp,
        suiteName,
        testName: test.title,
        status,
        error,
        stack,
        screenshot: screenshotPath,
        browserConsoleLogs,
        specConsoleLogs,
      });
      this.testResultUids.add(uid);
    }
  }

  async writeJSONReport() {
    const executionEnd = new Date();
    const totalTimeMinutes = ((executionEnd - this.executionStartTime) / 60000).toFixed(2);
    const browserName =
      browser && browser.capabilities && browser.capabilities.browserName
        ? browser.capabilities.browserName
        : 'Unknown';

    const metadata = {
      browserName,
      executionStartTime: this.executionStartTime.toUTCString(),
      executionEndTime: executionEnd.toUTCString(),
      totalTimeInMinutes: totalTimeMinutes,
    };

    const report = {
      metadata,
      testResults: this.testResults,
    };

    const fileTimestamp = this.formatDateForFilename(new Date());
    const fileName = `test-report-${fileTimestamp}.json`;
    const outputFile = path.join(path.dirname(this.options.outputFile), fileName);
    fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
    console.log(`JSON report successfully written to ${outputFile}`);
  }

  /**
   * Helper to create a file name–safe timestamp string from a Date object.
   */
  formatDateForFilename(date) {
    return date
      .toUTCString()
      .replace(/,/g, '')
      .replace(/:/g, '-')
      .replace(/\s+/g, '_');
  }

  /**
   * Sanitizes error messages by removing unwanted ANSI characters.
   */
  sanitizeErrorMessage(errorMessage, full = false) {
    const sanitized = errorMessage
      .replace(/[\u001b\u009b]\[\d{1,2}(;\d{1,2})?(m|K)/g, '')
      .trim();
    return full ? sanitized : sanitized.split('\n')[0];
  }

  /**
   * Generates a short, non-cryptographic hash for a given string.
   */
  generateShortHash(input) {
    let hash = 0;
    if (input.length === 0) return '00000000';
    for (let i = 0; i < input.length; i++) {
      hash = ((hash << 5) - hash) + input.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0').substring(0, 8);
  }
}
