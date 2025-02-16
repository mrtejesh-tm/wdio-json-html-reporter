#!/usr/bin/env node
import JSONReporter from './lib/JSONReporter.js';
import HTMLReportGenerator from './lib/HTMLReportGenerator.js';

export { JSONReporter, HTMLReportGenerator };

// If this file is run directly from the CLI, process command-line arguments.
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  // For example, support a command "generate-html" that takes an input folder and an output file:
  const [ , , command, ...args] = process.argv;
  if (command === 'generate-html') {
    const [inputFolder, outputFile] = args;
    if (!inputFolder || !outputFile) {
      console.error('Usage: generate-html <inputFolder> <outputFile>');
      process.exit(1);
    }
    const generator = new HTMLReportGenerator(outputFile);
    generator.convertJSONFolderToHTML(inputFolder)
      .then(() => console.log('HTML report generated successfully.'))
      .catch(err => console.error('Error generating HTML report:', err));
  } else {
    console.error('Usage: node index.js generate-html <inputFolder> <outputFile>');
    process.exit(1);
  }
}
