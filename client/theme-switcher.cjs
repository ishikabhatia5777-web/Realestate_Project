const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

// Define replacements (Order matters: more specific first)
const replacements = [
  { search: /bg-slate-950/g, replace: 'bg-slate-50' },
  { search: /bg-slate-900\/80/g, replace: 'bg-white/80' },
  { search: /bg-slate-900/g, replace: 'bg-white' },
  { search: /bg-slate-800\/60/g, replace: 'bg-slate-100/60' },
  { search: /bg-slate-800\/80/g, replace: 'bg-slate-100/80' },
  { search: /bg-slate-800/g, replace: 'bg-slate-100' },
  { search: /bg-slate-700\/80/g, replace: 'bg-slate-200/80' },
  { search: /bg-slate-700/g, replace: 'bg-slate-200' },
  { search: /border-slate-800\/80/g, replace: 'border-slate-200/80' },
  { search: /border-slate-800\/60/g, replace: 'border-slate-200/60' },
  { search: /border-slate-800/g, replace: 'border-slate-200' },
  { search: /border-slate-700\/80/g, replace: 'border-slate-300/80' },
  { search: /border-slate-700/g, replace: 'border-slate-300' },
  { search: /text-slate-400/g, replace: 'text-slate-500' },
  { search: /text-slate-300/g, replace: 'text-slate-600' },
  { search: /text-slate-200/g, replace: 'text-slate-700' },
  
  // We need to be careful with text-white and text-slate-950
  // In the HeroSection, text-white should STAY white if the background image is dark.
  // We'll replace text-white everywhere first, then manually fix HeroSection later.
  { search: /text-white/g, replace: 'text-slate-900' },
];

// Helper to walk directory
function walkSync(currentDirPath, callback) {
  fs.readdirSync(currentDirPath).forEach(function (name) {
    var filePath = path.join(currentDirPath, name);
    var stat = fs.statSync(filePath);
    if (stat.isFile()) {
      callback(filePath, stat);
    } else if (stat.isDirectory()) {
      walkSync(filePath, callback);
    }
  });
}

let filesModified = 0;

walkSync(directoryPath, function (filePath) {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;

    for (const rule of replacements) {
      newContent = newContent.replace(rule.search, rule.replace);
    }

    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated: ${filePath}`);
      filesModified++;
    }
  }
});

console.log(`\nFinished! Modified ${filesModified} files.`);
