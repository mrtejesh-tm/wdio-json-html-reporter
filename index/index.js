#!/usr/bin/env node
import path from 'path';
import { fileURLToPath } from 'url';
import JSONReporter from '../lib/JSONReporter.js';
import HTMLReportGenerator from '../lib/HTMLReportGenerator.js';

export { JSONReporter, HTMLReportGenerator };

/**
 * Prints the usage message and exits.
 */
function printUsageAndExit() {
  console.error('Usage: generate-html <inputFolder> <outputFile> [historyFile]');
  process.exit(1);
}

// Run CLI mode only if the first CLI argument is "generate-html"
if (process.argv[2] === 'generate-html') {
  console.log('Running CLI mode for wdio-json-html-reporter.');

  try {
    // process.argv[0] is "node", [1] is this file's path,
    // so our command and parameters start at index 2.
    const args = process.argv.slice(2); // args[0] should be "generate-html"
    
    if (args.length < 3) {
      console.error('Error: Insufficient arguments provided.');
      printUsageAndExit();
    }
    
    // Extract parameters: command, inputFolder, outputFile, and optionally historyFile.
    // args[0] is "generate-html"
    const inputFolder = args[1];
    const outputFile = args[2];
    
    if (!inputFolder || !outputFile) {
      console.error('Error: Both input folder and output file must be specified.');
      printUsageAndExit();
    }
    
    console.log(`Input Folder: ${inputFolder}`);
    console.log(`Output File: ${outputFile}`);
    
    // Optional history file parameter for generating historical execution data.
    const historyFile = args[3] || null;
    if (historyFile) {
      console.log(`History File: ${historyFile}`);
    }
    
    // Instantiate the HTMLReportGenerator with the optional historyFile parameter.
    const generator = new HTMLReportGenerator(outputFile, historyFile);
    generator.convertJSONFolderToHTML(inputFolder)
      .then(() => {
        console.log('HTML report generated successfully.');
        process.exit(0);
      })
      .catch(err => {
        console.error('Error generating HTML report:', err);
        process.exit(1);
      });
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}
