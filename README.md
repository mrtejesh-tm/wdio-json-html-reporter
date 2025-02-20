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
- [Screenshots](#screenshots)

## Overview

WDIO Custom Reporter provides two main components:

- **JSONReporter**: A custom reporter that extends the WebDriverIO reporter interface to collect test events and generate a JSON file with metadata, test results, and (optionally) screenshots.
- **HTMLReportGenerator**: A utility to convert multiple JSON report files into a comprehensive HTML report with interactive charts, filtering, and export functionality.

These tools help you gain clear insights into your test runs, which is essential for debugging and continuous integration.

## Features

- **JSON Reporting**: Detailed report with timestamps, suite names, test results, errors, and optional screenshots.
- **HTML Reporting**: Converts JSON reports into a  portable HTML report with dashboard,charts,detailed test report and filtering capabilities.
- **Export test to Excel**: Detailed report can be exported to excel file.
- **Screenshot Support**: Capture screenshots for failed tests or every test based on configuration.
- **Execution Metadata**: Logs browser information, execution start/end times, and overall duration.
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

    const reportGenerator = new HTMLReportGenerator(outputFilePath);
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

In addition to integrating with WebDriverIO, you can also run the HTML report generator directly from the command line using the built-in CLI.

**Example:**

```bash
npx wdio-json-html-reporter generate-html test/reports/json-reports test/reports/report.html
```

This command tells the CLI tool to:
- Look for JSON report files in the `test/reports/json-reports` folder.
- Generate a comprehensive HTML report and save it as `test/reports/report.html`.

**Note:**  
The CLI functionality is triggered only when you pass the `generate-html` command as the first parameter. When using WebDriverIO (e.g., via `wdio run wdio.conf.js`), the CLI logic is bypassed.

## Screenshots

### Dashboard  
![Dashboard](https://github.com/aswinchembath/wdio-json-html-reporter/blob/main/lib/assets/dashboard.png)

### Test Results  
![Test Results](https://github.com/aswinchembath/wdio-json-html-reporter/blob/main/lib/assets/testresults.png)

### Screenshots  
![Screenshots](https://github.com/aswinchembath/wdio-json-html-reporter/blob/main/lib/assets/screesnshots.png)

### Filters  
![Screenshots](https://github.com/aswinchembath/wdio-json-html-reporter/blob/main/lib/assets/filters.png)

### Excel Export  
![Screenshots](https://github.com/aswinchembath/wdio-json-html-reporter/blob/main/lib/assets/exportedfile.png)
---
