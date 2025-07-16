// Test ESM import
import { JSONReporter, HTMLReportGenerator } from './dist/esm/index.js';

console.log('ESM import test:');
console.log('JSONReporter:', typeof JSONReporter);
console.log('HTMLReportGenerator:', typeof HTMLReportGenerator);
console.log('✅ ESM import works!'); 