export const CATEGORIES = {
  NATURE: 'nature',
  MUSIC: 'music',
  AMBIENCE: 'ambience',
};

export const MOCK_SOUNDS = [
  // FREE SOUNDS (Basic & Essential)
  { id: 'yagmur1', title: 'Yağmur Sesi', icon: 'cloud-showers-heavy', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/yagmur-sesi-1.m4a', isLocked: false, category: 'nature' },
  { id: 'deniz1', title: 'Okyanus Dalgası', icon: 'water', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/dalga-sesi-1.m4a', isLocked: false, category: 'nature' },
  { id: 'ruzgar1', title: 'Gece Rüzgarı', icon: 'wind', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/firtina-sesi-1.m4a', isLocked: false, category: 'nature' },
  { id: 'ates1', title: 'Kamp Ateşi', icon: 'fire', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/ates-sesi-1.m4a', isLocked: false, category: 'nature' },
  { id: 'beyaz1', title: 'Beyaz Gürültü', icon: 'vial-circle-check', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/fan-sesi.m4a', isLocked: false, category: 'ambience' },
  { id: 'piyano1', title: 'Hafif Piyano', icon: 'music', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/hafif-piyano-muzik.m4a', isLocked: false, category: 'music' },
  { id: 'kus1', title: 'Kuş Sesi', icon: 'dove', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/kus-sesi-1.m4a', isLocked: false, category: 'nature' },
  { id: 'sakin1', title: 'Sakin Müzik', icon: 'leaf', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/hafif-muzik.m4a', isLocked: false, category: 'music' },
  { id: 'guguk1', title: 'Guguk Kuşu', icon: 'crow', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/guguk-kusu.m4a', isLocked: false, category: 'nature' },
  { id: 'tren1', title: 'Tren Sesi', icon: 'train', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/tren-sesi.m4a', isLocked: false, category: 'ambience' },

  // AD-LOCKED SOUNDS (Rich & Niche)
  { id: 'orman1', title: 'Derin Orman', icon: 'tree', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/orman-sesi.m4a', isLocked: true, category: 'nature' },
  { id: 'firtina1', title: 'Şiddetli Fırtına', icon: 'bolt', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/simsek-sesi-1.m4a', isLocked: true, category: 'nature' },
  { id: 'prenses1', title: 'Düşünce Modu', icon: 'brain', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/prensesler-icin-muzik.m4a', isLocked: true, category: 'ambience' },
  { id: 'can1', title: 'Tibet Çanı', icon: 'bell', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/sakinlestirici-muzik-1.m4a', isLocked: true, category: 'music' },
  { id: 'lofi1', title: 'Lo-fi Uyku', icon: 'moon', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/hayal-modu-muzik.m4a', isLocked: true, category: 'music' },
  { id: 'uzay1', title: 'Uzay Ambiyansı', icon: 'rocket', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/ambiyans-music.m4a', isLocked: true, category: 'ambience' },
  { id: 'bulbul1', title: 'Bülbül', icon: 'dove', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/bulbul-sesi-1.m4a', isLocked: true, category: 'nature' },
  { id: 'cekirge1', title: 'Gece Çekirgeleri', icon: 'bug', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/cekirge-sesi-1.m4a', isLocked: true, category: 'nature' },
  { id: 'gok1', title: 'Gök Gürültüsü', icon: 'cloud-bolt', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/gok-gurultusu-ses-1.m4a', isLocked: true, category: 'nature' },
  { id: 'simsek2', title: 'Uzak Şimşekler', icon: 'bolt-lightning', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/gok-gurultusu-sesi-2.m4a', isLocked: true, category: 'nature' },
  { id: 'yagmur2', title: 'Cama Vuran Yağmur', icon: 'cloud-rain', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/yagmur-sesi-2.m4a', isLocked: true, category: 'nature' },
  { id: 'sahil1', title: 'Yaz Sahili', icon: 'umbrella-beach', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/sahil-sesi-1.m4a', isLocked: true, category: 'nature' },
  { id: 'piyano2', title: 'Melankolik Piyano', icon: 'music', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/piyano-muzik.m4a', isLocked: true, category: 'music' },
  { id: 'sinek1', title: 'Sinek Vızıltısı', icon: 'mosquito', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/sinek-sesi-1.m4a', isLocked: true, category: 'nature' },

  // NEW ADDITIONS
  { id: 'kafe2', title: 'Kahve Dükkanı', icon: 'mug-hot', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/cafe-ambiyansi.m4a', isLocked: true, category: 'ambience' },
  { id: 'deniz2', title: 'Deniz Altı', icon: 'fish', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/deniz-alti-sesi.m4a', isLocked: true, category: 'nature' },
  { id: 'dere1', title: 'Dere Kenarı', icon: 'water', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/dere-kenari.m4a', isLocked: true, category: 'nature' },
  { id: 'derin1', title: 'Derin Düşünce', icon: 'brain', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/derin-dusunce-ses.m4a', isLocked: true, category: 'music' },
  { id: 'kar1', title: 'Karda Yürüyüş', icon: 'snowflake', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/karda-yuruyus.m4a', isLocked: true, category: 'nature' },
  { id: 'kedi1', title: 'Kedi Mırlaması', icon: 'cat', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/kedi-mirlamasi.m4a', isLocked: true, category: 'nature' },
  { id: 'lofi2', title: 'Lo-Fi Sabah', icon: 'sun', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/lo-fi-sabah-muzik.m4a', isLocked: true, category: 'music' },
  { id: 'sinyal1', title: 'Radyo Paraziti', icon: 'radio', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/no-sinyal.m4a', isLocked: true, category: 'ambience' },
  { id: 'rabarba1', title: 'Rabarba', icon: 'people-group', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/rabarba-sesi.m4a', isLocked: true, category: 'ambience' },
  { id: 'tarla1', title: 'Tarla Ortasında', icon: 'leaf', url: 'https://yousufe.net/apps/yec.sleepsoundsmix/sound/tarla-sesi.m4a', isLocked: true, category: 'nature' },
];
