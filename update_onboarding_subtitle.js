const fs = require('fs');
const path = require('path');
const localesDir = path.join(__dirname, 'src', 'locales');

const translations = {
  'es': "Crea la atmósfera que más te guste con sonidos para dormir y ambientes relajantes.",
  'pt': "Crie a atmosfera que mais lhe convém com sons para dormir e ambientes relaxantes.",
  'de': "Schaffen Sie mit Schlafklängen und entspannenden Umgebungen die Atmosphäre, die am besten zu Ihnen passt.",
  'fr': "Créez l'atmosphère qui vous convient le mieux avec des sons de sommeil et des ambiances relaxantes.",
  'ja': "睡眠音とリラックスできる環境音で、あなたに最適な雰囲気を作り出しましょう。"
};

Object.keys(translations).forEach(lang => {
  const file = path.join(localesDir, `${lang}.json`);
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (data.onboarding && data.onboarding.slide1) {
      data.onboarding.slide1.subtitle = translations[lang];
      fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
    }
  }
});
console.log('Updated slide1.subtitle in all remaining languages');
