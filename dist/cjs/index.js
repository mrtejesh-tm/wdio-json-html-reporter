#!/usr/bin/env node
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "HTMLReportGenerator", {
  enumerable: true,
  get: function get() {
    return _HTMLReportGenerator["default"];
  }
});
Object.defineProperty(exports, "JSONReporter", {
  enumerable: true,
  get: function get() {
    return _JSONReporter["default"];
  }
});
var _path = _interopRequireDefault(require("path"));
var _url = require("url");
var _JSONReporter = _interopRequireDefault(require("./lib/JSONReporter.js"));
var _HTMLReportGenerator = _interopRequireDefault(require("./lib/HTMLReportGenerator.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { "default": e }; }
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
    var args = process.argv.slice(2); // args[0] should be "generate-html"

    if (args.length < 3) {
      console.error('Error: Insufficient arguments provided.');
      printUsageAndExit();
    }

    // Extract parameters: command, inputFolder, outputFile, and optionally historyFile.
    // args[0] is "generate-html"
    var inputFolder = args[1];
    var outputFile = args[2];
    if (!inputFolder || !outputFile) {
      console.error('Error: Both input folder and output file must be specified.');
      printUsageAndExit();
    }
    console.log("Input Folder: ".concat(inputFolder));
    console.log("Output File: ".concat(outputFile));

    // Optional history file parameter for generating historical execution data.
    var historyFile = args[3] || null;
    if (historyFile) {
      console.log("History File: ".concat(historyFile));
    }

    // Instantiate the HTMLReportGenerator with the optional historyFile parameter.
    var generator = new _HTMLReportGenerator["default"](outputFile, historyFile);
    generator.convertJSONFolderToHTML(inputFolder).then(function () {
      console.log('HTML report generated successfully.');
      process.exit(0);
    })["catch"](function (err) {
      console.error('Error generating HTML report:', err);
      process.exit(1);
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}
