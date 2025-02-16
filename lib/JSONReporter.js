import fs from 'fs';
import path from 'path';
import WDIOReporter from '@wdio/reporter';

/**
 * Custom reporter that generates a JSON report with timestamps, optional screenshots,
 * and execution metadata for WebDriverIO tests.
 *
 * Options:
 * - outputFile: path where the report JSON file will be written.
 * - screenshotOption: "No" (default), "OnFailure", or "Full"
 */
export default class JSONReporter extends WDIOReporter {
	constructor(options) {
		// Set default options: stdout true and screenshotOption defaults to "No"
		options = Object.assign({ stdout: true, screenshotOption: 'No' }, options);
		super(options);
		this.options = options;
		this.testResults = [];
		// Record the execution start time
		this.executionStartTime = new Date();

		// Ensure the report output directory exists
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

	async addTestResult(test, status) {
		const timestamp = new Date().toISOString();
		// Extract only the describe block name if it starts with "Test" followed by a number.
		const suiteName = test.parent && test.parent.match(/^(Test\s*\d+)/i)
			? test.parent.match(/^(Test\s*\d+)/i)[1].trim()
			: test.parent
			? test.parent.trim()
			: 'Default Suite';

		const error = test.error ? this.sanitizeErrorMessage(test.error.message) : '';
		let screenshotPath = '';

		// Check screenshot option: capture screenshot for "Full" or "OnFailure" (if failed)
		if (this.options.screenshotOption === 'Full' || (this.options.screenshotOption === 'OnFailure' && status === 'FAILED')) {
			try {
				// Await the screenshot promise
				const screenshotData = await browser.takeScreenshot();
				const screenshotDir = path.join(path.dirname(this.options.outputFile), 'screenshots');
				if (!fs.existsSync(screenshotDir)) {
					fs.mkdirSync(screenshotDir, { recursive: true });
				}
				const safeTestTitle = test.title.replace(/[^a-z0-9]/gi, '_');
				const safeTimestamp = timestamp.replace(/:/g, '-');
				const screenshotFileName = `screenshot-${safeTestTitle}-${safeTimestamp}.png`;
				screenshotPath = path.join(screenshotDir, screenshotFileName);
				// Write the base64 image data to the file
				fs.writeFileSync(screenshotPath, screenshotData, 'base64');
			} catch (err) {
				console.error('Error capturing screenshot: ', err);
			}
		}

		this.testResults.push({
			timestamp,
			suiteName,
			testName: test.title,
			status,
			error,
			screenshot: screenshotPath,
		});
	}

	writeJSONReport() {
		const executionEndTime = new Date();
		const totalTimeMinutes = ((executionEndTime - this.executionStartTime) / 60000).toFixed(2);
		// Attempt to get browser name from capabilities
		const browserName = browser && browser.capabilities && browser.capabilities.browserName
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

		const timestamp = new Date().toISOString().replace(/:/g, '-'); // Replace colons for filename safety
		const fileName = `test-report-${timestamp}.json`;
		const outputFile = path.join(path.dirname(this.options.outputFile), fileName);
		fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
		console.log(`JSON report successfully written to ${outputFile}`);
	}

	sanitizeErrorMessage(errorMessage) {
		return errorMessage
			.replace(/[\u001b\u009b]\[\d{1,2}(;\d{1,2})?(m|K)/g, '')
			.split('\n')[0]
			.trim();
	}

	ensureDirectoryExistence(filePath) {
		const dirname = path.dirname(filePath);
		if (fs.existsSync(dirname)) {
			return true;
		}
		fs.mkdirSync(dirname, { recursive: true });
	}
}
