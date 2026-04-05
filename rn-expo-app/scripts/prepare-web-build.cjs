const fs = require('fs');
const path = require('path');

const root = process.cwd();
const src = path.join(root, 'dist');
const dest = path.join(root, 'build');
const indexPath = path.join(dest, 'index.html');

if (fs.existsSync(dest)) {
  fs.rmSync(dest, { recursive: true, force: true });
}

if (!fs.existsSync(src)) {
  throw new Error('Expo export did not create dist');
}

fs.cpSync(src, dest, { recursive: true });

const htaccess = `DirectoryIndex index.html

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [L]
</IfModule>
`;

fs.writeFileSync(path.join(dest, '.htaccess'), htaccess);

if (fs.existsSync(indexPath)) {
  const indexHtml = fs.readFileSync(indexPath, 'utf8');
  fs.writeFileSync(path.join(dest, '404.html'), indexHtml);
}
