const fs = require('fs');
const path = require('path');
const localesDir = path.join(__dirname, 'src', 'locales');

['es', 'pt', 'de', 'fr', 'ja'].forEach(lang => {
  const file = path.join(localesDir, `${lang}.json`);
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (data.onboarding && data.onboarding.slide1) {
      data.onboarding.slide1.title = "Calmix";
      fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
    }
  }
});
console.log('Updated slide1.title to Calmix');
