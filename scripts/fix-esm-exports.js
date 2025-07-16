#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Fix ESM exports by converting module.exports to export default
function fixESMExports() {
  const esmIndexPath = './dist/esm/index.js';
  const esmLibPath = './dist/esm/lib';
  
  if (!fs.existsSync(esmIndexPath)) {
    console.error('ESM index file not found');
    return;
  }

  // Fix index.js
  let content = fs.readFileSync(esmIndexPath, 'utf8');
  
  // Convert require to import
  content = content.replace(
    /const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\)/g,
    (match, varName, pkg) => {
      if (pkg === '@wdio/reporter') {
        return `import ${varName} from '${pkg}';`;
      }
      return `import ${varName} from '${pkg}';`;
    }
  );
  
  // Convert module.exports to export
  content = content.replace(
    /module\.exports\s*=\s*{([^}]+)}/g,
    (match, exports) => {
      const exportNames = exports.split(',').map(e => e.trim().split(':')[0].trim());
      return exportNames.map(name => `export { ${name} }`).join('\n');
    }
  );
  
  fs.writeFileSync(esmIndexPath, content);
  console.log('Fixed ESM exports in index.js');

  // Fix lib files
  if (fs.existsSync(esmLibPath)) {
    const libFiles = fs.readdirSync(esmLibPath);
    libFiles.forEach(file => {
      if (file.endsWith('.js')) {
        const filePath = path.join(esmLibPath, file);
        let libContent = fs.readFileSync(filePath, 'utf8');
        
        // Convert require to import
        libContent = libContent.replace(
          /const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\)\.default;/g,
          (match, varName, pkg) => `import ${varName} from '${pkg}';`
        );
        libContent = libContent.replace(
          /const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\)/g,
          (match, varName, pkg) => `import ${varName} from '${pkg}';`
        );
        
        // Convert module.exports to export default
        libContent = libContent.replace(
          /module\.exports\s*=\s*(\w+)/g,
          'export default $1'
        );
        
        fs.writeFileSync(filePath, libContent);
        console.log(`Fixed ESM exports in ${file}`);
      }
    });
  }
}

fixESMExports(); 