# WDIO JSON HTML REPORTER

This is a custom WebDriverIO reporter that generates detailed JSON reports during test execution and provides a portable HTML report generator to visualize your test results. It logs timestamps, execution metadata, and can capture screenshots on demand. The package follows the WebDriverIO convention for reporters and is published as an npm package under the name `wdio-json-html-reporter`.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
  - [1. Install the package](#1-install-the-package)
  - [2. Verify installation](#2-verify-installation)
  - [3. Update WebDriverIO Configuration](#3-update-webdriverio-configuration)
  - [4. Run Your Tests](#4-run-your-tests)
- [CLI Usage](#cli-usage)
- [History Option](#history-option)
- [Screenshots](#screenshots)

## Overview

WDIO JSON HTML REPORTER provides two main components:

- **JSONReporter**: A custom reporter that extends the WebDriverIO reporter interface to collect test events and generate a JSON file with metadata, test results, and (optionally) screenshots.
- **HTMLReportGenerator**: A utility to convert multiple JSON report files into a comprehensive HTML report with interactive charts, filtering, and export functionality. In addition, the report generator now supports an optional history file to display historical execution data if available. When no history data is provided, the report omits the historical section and shows only the Unique Errors.

These tools help you gain clear insights into your test runs, which is essential for debugging and continuous integration.

## Features

- **JSON Reporting**: Detailed report with timestamps, suite names, test results, errors, and optional screenshots.
- **HTML Reporting**: Converts JSON reports into a portable HTML report with a dashboard, charts, detailed test report, and filtering capabilities.
- **Export to Excel**: The detailed test report can be exported to an Excel file.
- **Screenshot Support**: Capture screenshots for failed tests (or all tests) based on your configuration.
- **Execution Metadata**: Logs browser information, execution start/end times, and overall duration.
- **Historical Execution (Optional)**: Provide a history JSON file to include historical execution data by suite. If no historical data is provided, the report will automatically hide this section.
- **Easy Integration**: Designed to work seamlessly with your existing WebDriverIO configuration.
- **Customizable**: Extend and modify reporter behavior to suit your specific project requirements.

## Installation

To install the `wdio-json-html-reporter` package, follow these steps:

### 1. Install the package

Run the following command to install the package as a development dependency:

```bash
npm install --save-dev wdio-json-html-reporter
```

### 2. Verify installation

Ensure that the package has been installed correctly by running:

```bash
npm list wdio-json-html-reporter
```

If installed correctly, you should see an output similar to:

```bash
wdio-json-html-reporter@x.x.x
```

### 3. Update WebDriverIO Configuration

Modify your `wdio.conf.js` or `wdio.conf.ts` file to include the custom reporter:

```javascript
import { JSONReporter, HTMLReportGenerator } from 'wdio-json-html-reporter';

export const config = {
  reporters: [
    [JSONReporter, { outputFile: './reports/test-results.json', screenshotOption: 'OnFailure' }],  // Options: "No", "OnFailure", "Full"
  ],
  onComplete: async function() {
    const outputFilePath = './reports/test-report.html';
    const jsonFolder = './reports'; // Directory where JSON reports are saved

    // If you want to include historical data, specify the history JSON file path here.
    const historyFile = './reports/history.json'; // Optional

    const reportGenerator = new HTMLReportGenerator(outputFilePath, historyFile);
    await reportGenerator.convertJSONFolderToHTML(jsonFolder);
  }
};
```

### 4. Run Your Tests

Execute your WebDriverIO test suite:

```bash
npx wdio run wdio.conf.js
```

## CLI Usage

In addition to integrating with WebDriverIO, you can run the HTML report generator directly from the command line using the built-in CLI.

**Usage:**

```bash
generate-html <inputFolder> <outputFile> [historyFile]
```

For example, if you have your JSON files in a folder named `test/reports/json-reports` and want to generate an HTML report named `test/reports/report.html`, you can run:

```bash
npx wdio-json-html-reporter generate-html test/reports/json-reports test/reports/report.html
```

If you also have a history file (e.g., `test/reports/history.json`), include it as an optional fourth parameter:

```bash
npx wdio-json-html-reporter generate-html test/reports/json-reports test/reports/report.html test/reports/history.json
```

**Note:**  
The CLI functionality is triggered only when you pass the `generate-html` command as the first parameter. When running via WebDriverIO (e.g., with `wdio run wdio.conf.js`), the CLI logic is bypassed.

## History Option

The HTML report generator now supports a **history option**. This allows you to provide a JSON file containing historical execution data that is merged into the report under the "Historical Execution by Suite" section. If the history file is provided and contains valid data, the report will display historical trends along with interactive charts and an accordion for each suite. If no history file is passed or if the file does not contain any suite data, the report will automatically hide the historical section and display only the Unique Errors overview.

## Screenshots

### Dashboard  
![Dashboard](https://github.com/aswinchembath/wdio-json-html-reporter/blob/main/lib/assets/dashboard.png)

### Test Results  
![Test Results](https://github.com/aswinchembath/wdio-json-html-reporter/blob/main/lib/assets/testdetails.png)

### Screenshots  
![Screenshots](https://github.com/aswinchembath/wdio-json-html-reporter/blob/main/lib/assets/screesnshots.png)

### Filters  
![Filters](https://github.com/aswinchembath/wdio-json-html-reporter/blob/main/lib/assets/filters.png)

### Excel Export  
![Excel Export](https://github.com/aswinchembath/wdio-json-html-reporter/blob/main/lib/assets/exportedfile.png)
