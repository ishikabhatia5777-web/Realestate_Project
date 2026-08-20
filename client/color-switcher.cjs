const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

// Define replacements for the new Sky/Cyan gradient color scheme
const replacements = [
  // Gradients
  { search: /gold-gradient-bg/g, replace: 'brand-gradient-bg' },
  { search: /gold-gradient-text/g, replace: 'brand-gradient-text' },
  { search: /gold-border/g, replace: 'brand-border' },
  
  // Tailwind amber utilities -> sky utilities
  { search: /bg-amber-400/g, replace: 'bg-sky-400' },
  { search: /bg-amber-500/g, replace: 'bg-sky-500' },
  { search: /bg-amber-600/g, replace: 'bg-sky-600' },
  { search: /text-amber-400/g, replace: 'text-sky-500' }, // Darker for better contrast on white
  { search: /text-amber-500/g, replace: 'text-sky-600' },
  { search: /text-amber-600/g, replace: 'text-sky-700' },
  { search: /border-amber-400/g, replace: 'border-sky-400' },
  { search: /border-amber-500/g, replace: 'border-sky-500' },
  { search: /from-amber-400/g, replace: 'from-sky-400' },
  { search: /from-amber-500/g, replace: 'from-sky-500' },
  { search: /from-amber-600/g, replace: 'from-sky-600' },
  { search: /to-amber-500/g, replace: 'to-sky-500' },
  { search: /to-amber-600/g, replace: 'to-sky-600' },
  { search: /shadow-amber-500/g, replace: 'shadow-sky-500' },
];

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
      console.log(`Updated colors: ${filePath}`);
      filesModified++;
    }
  }
});

console.log(`\nFinished color switch! Modified ${filesModified} files.`);
