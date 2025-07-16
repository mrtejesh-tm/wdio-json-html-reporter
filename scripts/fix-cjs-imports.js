#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Fix CommonJS imports by removing .js extensions
function fixCJSImports() {
  const cjsIndexPath = './dist/cjs/index.js';
  
  if (!fs.existsSync(cjsIndexPath)) {
    console.error('CJS index file not found');
    return;
  }

  let content = fs.readFileSync(cjsIndexPath, 'utf8');
  
  // Remove .js extensions from require statements
  content = content.replace(
    /require\(['"](\.\/lib\/[^'"]+)\.js['"]\)/g,
    "require('$1')"
  );
  
  fs.writeFileSync(cjsIndexPath, content);
  console.log('Fixed CJS imports in index.js');
}

fixCJSImports(); 