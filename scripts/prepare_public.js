const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public_deploy');
const adminTargetDir = path.join(publicDir, 'admin');
const assetsTargetDir = path.join(publicDir, 'assets');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

if (!fs.existsSync(adminTargetDir)) {
  fs.mkdirSync(adminTargetDir, { recursive: true });
}

if (!fs.existsSync(assetsTargetDir)) {
  fs.mkdirSync(assetsTargetDir, { recursive: true });
}

// Copy admin/index.html -> public_deploy/admin/index.html
fs.copyFileSync(
  path.join(rootDir, 'admin', 'index.html'),
  path.join(adminTargetDir, 'index.html')
);

// Copy privacy_and_terms.html -> public_deploy/privacy.html
if (fs.existsSync(path.join(rootDir, 'privacy_and_terms.html'))) {
  fs.copyFileSync(
    path.join(rootDir, 'privacy_and_terms.html'),
    path.join(publicDir, 'privacy.html')
  );
}

// Copy branding images to public_deploy/assets
const assetsToCopy = ['app-logo.png', 'app_bg.png', 'splash-screen.png'];
assetsToCopy.forEach(file => {
  const src = path.join(rootDir, 'assets', file);
  const dest = path.join(assetsTargetDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
});

console.log('✅ public_deploy klasörü ve görseller hazırlandı:');
console.log('  - Home: public_deploy/index.html');
console.log('  - Admin: public_deploy/admin/index.html');
console.log('  - Privacy: public_deploy/privacy.html');
console.log('  - Assets: public_deploy/assets/');
