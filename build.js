import fs from 'fs';

const esmContent = fs.readFileSync('index.mjs', 'utf8');

const cjsContent = esmContent
.replace(/^export default class/gm, 'class')
.replace(/^export default /gm, 'module.exports = ')

fs.writeFileSync('index.cjs', cjsContent);

console.log('✅ Generated index.cjs from index.mjs');
console.log('📦 Ready to publish with dual format support!');