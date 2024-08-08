const fs = require('fs');
const ejs = require('ejs');
const path = require('path');

const viewsDir = path.join(__dirname, 'views');
const publicDir = path.join(__dirname, 'public');

if (!fs.existsSync(publicDir)){
  fs.mkdirSync(publicDir);
}

// Render index.ejs to index.html
ejs.renderFile(path.join(viewsDir, 'index.ejs'), {}, {}, (err, str) => {
  if (err) {
    console.error(err);
  } else {
    fs.writeFileSync(path.join(publicDir, 'index.html'), str);
  }
});

// Copy static assets (CSS, JS, etc.) to public directory
fs.copyFileSync(path.join(__dirname, 'styles.css'), path.join(publicDir, 'styles.css'));
fs.copyFileSync(path.join(__dirname, 'script.js'), path.join(publicDir, 'script.js'));
