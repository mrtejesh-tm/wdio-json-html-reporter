// Test CommonJS require
const { JSONReporter, HTMLReportGenerator } = require('./dist/cjs/index.js');

console.log('CommonJS require test:');
console.log('JSONReporter:', typeof JSONReporter);
console.log('HTMLReportGenerator:', typeof HTMLReportGenerator);
console.log('✅ CommonJS require works!'); 