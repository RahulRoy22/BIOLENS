const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const indexPath = path.join(distDir, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Replace root paths with /BIOLENS/, avoiding double prefix if already present
html = html.replace(/(href|src)="\/+(?!BIOLENS\/)/g, '$1="/BIOLENS/');

fs.writeFileSync(indexPath, html);
// Create .nojekyll to prevent GitHub Pages from ignoring the _expo directory
fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
console.log('Fixed paths in index.html and added .nojekyll');