const fs = require('fs');
const sounds = JSON.parse(fs.readFileSync('firebase_sounds_temp.json', 'utf8'));

const translations = {
  en: {
    "yagmur-sesi-1": "Rain Sound 1", "firtina-sesi-1": "Night Storm", "ates-sesi-1": "Campfire",
    "fan-sesi": "White Noise (Fan)", "hafif-piyano-muzik": "Soft Piano", "kus-sesi-1": "Bird Sound 1",
    "hafif-muzik": "Calm Music", "guguk-kusu": "Cuckoo Bird", "tren-sesi": "Train Ride",
    "orman-sesi": "Deep Forest", "simsek-sesi-1": "Lightning Strike", "prensesler-icin-muzik": "Princess Sleep",
    "sakinlestirici-muzik-1": "Tibetan Bowl", "hayal-modu-muzik": "Dream Mode", "ambiyans-music": "Space Ambience",
    "bulbul-sesi-1": "Nightingale Sound", "cekirge-sesi-1": "Night Cricket", "gok-gurultusu-ses-1": "Thunder 1",
    "gok-gurultusu-sesi-2": "Thunder 2", "yagmur-sesi-2": "Rain Sound 2", "sahil-sesi-1": "Beach Sound 1",
    "piyano-muzik": "Melancholic Piano", "sinek-sesi-1": "Mosquito Buzz", "cafe-ambiyansi": "Coffee Shop",
    "deniz-alti-sesi": "Underwater", "dere-kenari": "Riverside", "derin-dusunce-ses": "Deep Thought",
    "karda-yuruyus": "Walking in Snow", "kedi-mirlamasi": "Cat Purring", "lo-fi-sabah-muzik": "Lo-Fi Morning",
    "no-sinyal": "Radio Static", "rabarba-sesi": "Crowd Chatter", "tarla-sesi": "Field Sound",
    "baykus-sesi": "Owl Sound", "karga-sesi": "Crow Sound", "okyanus-sesi": "Deep Ocean",
    "orman-kuslari": "Forest Birds", "sahil-sesi-2": "Beach Sound 2", "somine-atesi": "Fireplace",
    "kamp-ates-sesi-1": "Campfire 2", "deniz-sesi-1": "Sea Sound 1"
  },
  es: {
    "yagmur-sesi-1": "Sonido de Lluvia 1", "firtina-sesi-1": "Tormenta Nocturna", "ates-sesi-1": "Fogata",
    "fan-sesi": "Ruido Blanco (Ventilador)", "hafif-piyano-muzik": "Piano Suave", "kus-sesi-1": "Sonido de Pájaro 1",
    "hafif-muzik": "Música Tranquila", "guguk-kusu": "Cuco", "tren-sesi": "Viaje en Tren",
    "orman-sesi": "Bosque Profundo", "simsek-sesi-1": "Rayo", "prensesler-icin-muzik": "Sueño de Princesa",
    "sakinlestirici-muzik-1": "Cuenco Tibetano", "hayal-modu-muzik": "Modo de Sueño", "ambiyans-music": "Ambiente Espacial",
    "bulbul-sesi-1": "Sonido de Ruiseñor", "cekirge-sesi-1": "Grillo Nocturno", "gok-gurultusu-ses-1": "Trueno 1",
    "gok-gurultusu-sesi-2": "Trueno 2", "yagmur-sesi-2": "Sonido de Lluvia 2", "sahil-sesi-1": "Sonido de Playa 1",
    "piyano-muzik": "Piano Melancólico", "sinek-sesi-1": "Zumbido de Mosquito", "cafe-ambiyansi": "Cafetería",
    "deniz-alti-sesi": "Bajo el Agua", "dere-kenari": "Orilla del Río", "derin-dusunce-ses": "Pensamiento Profundo",
    "karda-yuruyus": "Caminando en la Nieve", "kedi-mirlamasi": "Ronroneo de Gato", "lo-fi-sabah-muzik": "Mañana Lo-Fi",
    "no-sinyal": "Estática de Radio", "rabarba-sesi": "Murmullo de Multitud", "tarla-sesi": "Sonido de Campo",
    "baykus-sesi": "Sonido de Búho", "karga-sesi": "Sonido de Cuervo", "okyanus-sesi": "Océano Profundo",
    "orman-kuslari": "Pájaros del Bosque", "sahil-sesi-2": "Sonido de Playa 2", "somine-atesi": "Chimenea",
    "kamp-ates-sesi-1": "Fogata 2", "deniz-sesi-1": "Sonido de Mar 1"
  },
  pt: {
    "yagmur-sesi-1": "Som de Chuva 1", "firtina-sesi-1": "Tempestade Noturna", "ates-sesi-1": "Fogueira",
    "fan-sesi": "Ruído Branco (Ventilador)", "hafif-piyano-muzik": "Piano Suave", "kus-sesi-1": "Som de Pássaro 1",
    "hafif-muzik": "Música Calma", "guguk-kusu": "Cuco", "tren-sesi": "Passeio de Trem",
    "orman-sesi": "Floresta Profunda", "simsek-sesi-1": "Raio", "prensesler-icin-muzik": "Sono de Princesa",
    "sakinlestirici-muzik-1": "Tigela Tibetana", "hayal-modu-muzik": "Modo de Sonho", "ambiyans-music": "Ambiente Espacial",
    "bulbul-sesi-1": "Som de Rouxinol", "cekirge-sesi-1": "Grilo Noturno", "gok-gurultusu-ses-1": "Trovão 1",
    "gok-gurultusu-sesi-2": "Trovão 2", "yagmur-sesi-2": "Som de Chuva 2", "sahil-sesi-1": "Som de Praia 1",
    "piyano-muzik": "Piano Melancólico", "sinek-sesi-1": "Zumbido de Mosquito", "cafe-ambiyansi": "Cafeteria",
    "deniz-alti-sesi": "Debaixo d'água", "dere-kenari": "Beira do Rio", "derin-dusunce-ses": "Pensamento Profundo",
    "karda-yuruyus": "Caminhando na Neve", "kedi-mirlamasi": "Ronronar de Gato", "lo-fi-sabah-muzik": "Manhã Lo-Fi",
    "no-sinyal": "Estática de Rádio", "rabarba-sesi": "Vozes da Multidão", "tarla-sesi": "Som de Campo",
    "baykus-sesi": "Som de Coruja", "karga-sesi": "Som de Corvo", "okyanus-sesi": "Oceano Profundo",
    "orman-kuslari": "Pássaros da Floresta", "sahil-sesi-2": "Som de Praia 2", "somine-atesi": "Lareira",
    "kamp-ates-sesi-1": "Fogueira 2", "deniz-sesi-1": "Som de Mar 1"
  },
  de: {
    "yagmur-sesi-1": "Regengeräusch 1", "firtina-sesi-1": "Nachtsturm", "ates-sesi-1": "Lagerfeuer",
    "fan-sesi": "Weißes Rauschen (Lüfter)", "hafif-piyano-muzik": "Sanftes Klavier", "kus-sesi-1": "Vogelgeräusch 1",
    "hafif-muzik": "Ruhige Musik", "guguk-kusu": "Kuckuck", "tren-sesi": "Zugfahrt",
    "orman-sesi": "Tiefer Wald", "simsek-sesi-1": "Blitzschlag", "prensesler-icin-muzik": "Prinzessinnenschlaf",
    "sakinlestirici-muzik-1": "Klangschale", "hayal-modu-muzik": "Traummodus", "ambiyans-music": "Weltraum-Ambiente",
    "bulbul-sesi-1": "Nachtigall-Geräusch", "cekirge-sesi-1": "Nachtgrille", "gok-gurultusu-ses-1": "Donner 1",
    "gok-gurultusu-sesi-2": "Donner 2", "yagmur-sesi-2": "Regengeräusch 2", "sahil-sesi-1": "Strandgeräusch 1",
    "piyano-muzik": "Melancholisches Klavier", "sinek-sesi-1": "Mückensummen", "cafe-ambiyansi": "Café",
    "deniz-alti-sesi": "Unterwasser", "dere-kenari": "Flussufer", "derin-dusunce-ses": "Tiefe Gedanken",
    "karda-yuruyus": "Im Schnee gehen", "kedi-mirlamasi": "Katzenschnurren", "lo-fi-sabah-muzik": "Lo-Fi-Morgen",
    "no-sinyal": "Radiostörungen", "rabarba-sesi": "Menschenmenge", "tarla-sesi": "Feldgeräusch",
    "baykus-sesi": "Eulengeräusch", "karga-sesi": "Krähengeräusch", "okyanus-sesi": "Tiefer Ozean",
    "orman-kuslari": "Waldvögel", "sahil-sesi-2": "Strandgeräusch 2", "somine-atesi": "Kamin",
    "kamp-ates-sesi-1": "Lagerfeuer 2", "deniz-sesi-1": "Meeresgeräusch 1"
  },
  fr: {
    "yagmur-sesi-1": "Bruit de Pluie 1", "firtina-sesi-1": "Tempête Nocturne", "ates-sesi-1": "Feu de Camp",
    "fan-sesi": "Bruit Blanc (Ventilateur)", "hafif-piyano-muzik": "Piano Doux", "kus-sesi-1": "Bruit d'Oiseau 1",
    "hafif-muzik": "Musique Calme", "guguk-kusu": "Coucou", "tren-sesi": "Voyage en Train",
    "orman-sesi": "Forêt Profonde", "simsek-sesi-1": "Coup de Foudre", "prensesler-icin-muzik": "Sommeil de Princesse",
    "sakinlestirici-muzik-1": "Bol Tibétain", "hayal-modu-muzik": "Mode Rêve", "ambiyans-music": "Ambiance Spatiale",
    "bulbul-sesi-1": "Chant du Rossignol", "cekirge-sesi-1": "Grillon Nocturne", "gok-gurultusu-ses-1": "Tonnerre 1",
    "gok-gurultusu-sesi-2": "Tonnerre 2", "yagmur-sesi-2": "Bruit de Pluie 2", "sahil-sesi-1": "Bruit de Plage 1",
    "piyano-muzik": "Piano Mélancolique", "sinek-sesi-1": "Bourdonnement de Moustique", "cafe-ambiyansi": "Café",
    "deniz-alti-sesi": "Sous-marin", "dere-kenari": "Bord de Rivière", "derin-dusunce-ses": "Pensée Profonde",
    "karda-yuruyus": "Marcher dans la Neige", "kedi-mirlamasi": "Ronronnement de Chat", "lo-fi-sabah-muzik": "Matin Lo-Fi",
    "no-sinyal": "Statique Radio", "rabarba-sesi": "Bavardage de Foule", "tarla-sesi": "Bruit de Champ",
    "baykus-sesi": "Bruit de Hibou", "karga-sesi": "Bruit de Corbeau", "okyanus-sesi": "Océan Profond",
    "orman-kuslari": "Oiseaux de la Forêt", "sahil-sesi-2": "Bruit de Plage 2", "somine-atesi": "Cheminée",
    "kamp-ates-sesi-1": "Feu de Camp 2", "deniz-sesi-1": "Bruit de Mer 1"
  },
  ja: {
    "yagmur-sesi-1": "雨の音 1", "firtina-sesi-1": "夜の嵐", "ates-sesi-1": "キャンプファイヤー",
    "fan-sesi": "ホワイトノイズ（ファン）", "hafif-piyano-muzik": "ソフトピアノ", "kus-sesi-1": "鳥の鳴き声 1",
    "hafif-muzik": "穏やかな音楽", "guguk-kusu": "カッコウ", "tren-sesi": "電車の旅",
    "orman-sesi": "深い森", "simsek-sesi-1": "落雷", "prensesler-icin-muzik": "プリンセスの睡眠",
    "sakinlestirici-muzik-1": "チベットボウル", "hayal-modu-muzik": "ドリームモード", "ambiyans-music": "宇宙の雰囲気",
    "bulbul-sesi-1": "ナイチンゲールの音", "cekirge-sesi-1": "夜のコオロギ", "gok-gurultusu-ses-1": "雷 1",
    "gok-gurultusu-sesi-2": "雷 2", "yagmur-sesi-2": "雨の音 2", "sahil-sesi-1": "ビーチの音 1",
    "piyano-muzik": "メランコリックなピアノ", "sinek-sesi-1": "蚊の羽音", "cafe-ambiyansi": "コーヒーショップ",
    "deniz-alti-sesi": "水中", "dere-kenari": "川辺", "derin-dusunce-ses": "深い思考",
    "karda-yuruyus": "雪の中を歩く", "kedi-mirlamasi": "猫のゴロゴロ音", "lo-fi-sabah-muzik": "Lo-Fiの朝",
    "no-sinyal": "ラジオのノイズ", "rabarba-sesi": "群衆のざわめき", "tarla-sesi": "野原の音",
    "baykus-sesi": "フクロウの鳴き声", "karga-sesi": "カラスの鳴き声", "okyanus-sesi": "深い海",
    "orman-kuslari": "森の鳥", "sahil-sesi-2": "ビーチの音 2", "somine-atesi": "暖炉",
    "kamp-ates-sesi-1": "キャンプファイヤー 2", "deniz-sesi-1": "海の音 1"
  }
};

const newSounds = sounds.map(sound => {
  return {
    ...sound,
    titleTranslations: {
      tr: sound.title,
      en: translations.en[sound.id] || sound.title,
      es: translations.es[sound.id] || sound.title,
      pt: translations.pt[sound.id] || sound.title,
      de: translations.de[sound.id] || sound.title,
      fr: translations.fr[sound.id] || sound.title,
      ja: translations.ja[sound.id] || sound.title
    }
  };
});

fs.writeFileSync('new_soundlist.json', JSON.stringify(newSounds, null, 2));
console.log('Done');
