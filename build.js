import fs from 'fs';

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

  // Write the CJS file
  try {
    fs.writeFileSync(outputFile, cjsContent, 'utf8');
    console.log(`✅ Successfully converted ${inputFile} → ${outputFile}`);
  } catch (error) {
    console.error(`❌ Error writing ${outputFile}:`, error.message);
    process.exit(1);
  }
}

convertESMToCJS('index.mjs', 'index.cjs');

console.log('📦 Ready to publish with dual format support!');