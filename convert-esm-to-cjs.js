#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Converts ESM (.mjs) file to CommonJS (.cjs) file
 * @param {string} inputFile - Path to the .mjs file
 * @param {string} outputFile - Path to the .cjs file (optional)
 */
function convertESMToCJS(inputFile, outputFile) {
  // Default output file if not provided
  if (!outputFile) {
    outputFile = inputFile.replace('.mjs', '.cjs');
  }

  // Read the ESM file
  let content;
  try {
    content = fs.readFileSync(inputFile, 'utf8');
  } catch (error) {
    console.error(`❌ Error reading ${inputFile}:`, error.message);
    process.exit(1);
  }

  // Convert ESM syntax to CommonJS
  let cjsContent = content
    // Convert export default class/function/const
    .replace(/^export\s+default\s+(class|function|const|let|var)\s+(\w+)/gm, '$1 $2')
    .replace(/^export\s+default\s+/gm, 'module.exports = ')
    
    // Convert named exports: export { foo, bar }
    .replace(/^export\s+\{\s*([^}]+)\s*\}/gm, (match, exports) => {
      const exportList = exports.split(',').map(e => e.trim());
      return exportList.map(exp => `module.exports.${exp} = ${exp};`).join('\n');
    })
    
    // Convert export const/let/var
    .replace(/^export\s+(const|let|var)\s+(\w+)/gm, '$1 $2')
    
    // Convert export function/class
    .replace(/^export\s+(function|class)\s+(\w+)/gm, '$1 $2')
    
    // Convert import statements
    .replace(/^import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?$/gm, 'const $1 = require("$2");')
    .replace(/^import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"];?$/gm, 'const { $1 } = require("$2");')
    .replace(/^import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"];?$/gm, 'const $1 = require("$2");')
    .replace(/^import\s+(\w+),\s*\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"];?$/gm, 'const $1 = require("$3");\nconst { $2 } = require("$3");')
    
    // Handle side-effect imports
    .replace(/^import\s+['"]([^'"]+)['"];?$/gm, 'require("$1");');

  // Add module.exports for named exports if not already present
  if (cjsContent.includes('export ') && !cjsContent.includes('module.exports =')) {
    // Find all exported names
    const exportedNames = [];
    
    // Match export const/let/var/function/class
    const namedExports = cjsContent.match(/^(const|let|var|function|class)\s+(\w+)/gm);
    if (namedExports) {
      namedExports.forEach(match => {
        const name = match.split(/\s+/)[1];
        if (name) exportedNames.push(name);
      });
    }
    
    // Add module.exports for all exported names
    if (exportedNames.length > 0) {
      const exportsObj = exportedNames.map(name => `  ${name}`).join(',\n');
      cjsContent += `\n\nmodule.exports = {\n${exportsObj}\n};\n`;
    }
  }

  // Write the CJS file
  try {
    fs.writeFileSync(outputFile, cjsContent, 'utf8');
    console.log(`✅ Successfully converted ${inputFile} → ${outputFile}`);
  } catch (error) {
    console.error(`❌ Error writing ${outputFile}:`, error.message);
    process.exit(1);
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🔄 ESM to CJS Converter

Usage:
  node convert-esm-to-cjs.js <input.mjs> [output.cjs]

Examples:
  node convert-esm-to-cjs.js seekr.mjs
  node convert-esm-to-cjs.js seekr.mjs seekr.cjs
  node convert-esm-to-cjs.js src/index.mjs dist/index.cjs
`);
    process.exit(0);
  }

  const inputFile = args[0];
  const outputFile = args[1];

  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Input file not found: ${inputFile}`);
    process.exit(1);
  }

  convertESMToCJS(inputFile, outputFile);
}

// Export for programmatic use
module.exports = { convertESMToCJS };