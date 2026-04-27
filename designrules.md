# yec.sleepsoundmix - Tasarım Anayasası (designrules.md)

Bu belge, **yec.sleepsoundmix** uygulamasının arayüz (UI), kullanıcı deneyimi (UX) ve bileşen mimarisini tanımlar. İster React prototipi, ister hedef Native uygulama olsun, geliştirme sürecinde bu kurallara sadık kalınmalıdır.

---

## 1. Görsel Kimlik (Visual Identity)

### 1.1 Renk Paleti (Deep Night Theme)
Derin uykuyu ve rahatlamayı temsil eden gece teması.
- **Ana Arka Plan:** Koyu radyal gradyan.
  - Merkez: `#3C3A4E` (rgba: 60, 58, 78)
  - Ara: `#252634` (rgba: 37, 38, 52)
  - Kenarlar: `#0D1319` (rgba: 13, 19, 25)
- **Vurgu Renkleri (Accents):**
  - **Primary Blue:** `#3471EC` (Aktif ikonlar)
  - **Success Green:** `#47F185` / `#68D051` (Oynat butonu, check-circle, aktif kontroller)
  - **Warning/Ads:** `#DC9D20` (Reklamlı/Kilitli içerik ikonu)
  - **Danger Red:** `#EF324B` (Silme/Kaldırma/Durdurma işlemleri)

### 1.2 Materyal ve Yüzeyler (Glassmorphism)
Uygulamadaki kartlar ve navigasyon alanları buzlu cam efektine sahiptir.
- **Kart Arka Planları:** 
  - Normal: `linear-gradient` `rgba(141, 165, 208, 0.2)` -> `rgba(72, 84, 106, 0.2)`
  - Hazır Mix (Premium): `linear-gradient` `rgba(100, 152, 212, 0.2)` -> `rgba(76, 30, 154, 0.2)`
  - Hazır Mix (Reklamlı): `linear-gradient` `rgba(141, 165, 208, 0.4)` -> `rgba(72, 84, 106, 0.4)`
- **Bulanıklık (Blur):** `backdrop-blur: 20px` (Kartlar) / `2px` (Navbar)
- **Çerçeve (Border):** `1px solid rgba(255, 255, 255, 0.05)` ince ve şeffaf sınırlar.

### 1.3 Tipografi ve İkonlar
- **Font Ailesi:** Inter
- **Hiyerarşi:**
  - H1 Başlıklar: `32px` Bold, Gradyan Metin (`#8491A1` -> `#4C1E9A`)
  - Standart Bileşen Metni: `16px` Medium
  - Alt Metin / Navbar: `12px` / `10px` Medium (%50 Opaklık)
  - Zamanlayıcı Sayacı: `40px` / `26px` Bold
- **İkonlar:** Font Awesome 6 Pro Solid. (Örn: `music`, `timer`, `cloud-rain`)

---

## 2. Bileşen Standartları (Components)

### 2.1 SoundCard (Ses Kartı)
- **Arayüz:** Grid yapısına uygun kare/dikdörtgen form. Sol üstte ikon, sağ üstte durum (Check veya Ad).
- **Durumlar:**
  - *Aktif:* Yeşil `check-circle`, %100 opaklık.
  - *Kilitli (Ad):* Turuncu `ad` ikonu, metin ve ana ikon %20 opaklık. Kart genel opaklığı %40.
  - *Pasif:* Boş gri daire, normal opaklık.

### 2.2 MixerItem (Ses Karıştırıcı Öğesi)
- Seçilmiş her ses için listelenir.
- **İçerik:** Ses ikonu, ismi, çöp kutusu (sil) butonu ve yatay `input[type="range"]` volume slider'ı.
- **Slider:** Accent rengi `Primary Blue` olan ince (4px) modern kontrol çubuğu.

### 2.3 Navbar (Alt Navigasyon)
- Sabit konum (`fixed bottom`), koyu arka plan (`#19202B`) + hafif blur.
- Aktif sekme: %100 opaklık, büyük ikon (`20px/24px`), font `medium`.
- Pasif sekme: %20 opaklık.

### 2.4 TimerGraph & TimerButton
- **Graph:** Dairesel ilerleme çubuğu (Circular Progress). Kalan süre SVG `stroke-dashoffset` ile gösterilir. Merkezinde kalan dakika ("45 DK") yazar.
- **Button:** Süre seçimi (15, 30 vb.) için yuvarlak, `70x70px` butonlar. Seçili olanın arkaplanı `Success Green`.

### 2.5 ModeSwitcher (Kategori Seçici)
- "Doğal Sesler" ve "Rahatlatıcı Ses" geçişi için pill (hap) formunda container.
- Seçili öğe: `rgba(50, 239, 120, 0.3)` arkaplan ve %100 opaklık.
- Pasif öğe: `rgba(255, 255, 255, 0.05)` arkaplan ve %40 opaklık.

---

## 3. Ekran Layout Kuralları
- **Mobil Öncelikli:** Tasarım, mobil cihaz boyutları (412px genişlik referansı) düşünülerek oluşturulmuştur.
- **Padding:** Ekran kenarlarından güvenli boşluklar `16px`. Kart içi boşluklar `16px 24px` veya `24px 14px`.
- **Boş Durumlar (Empty States):** Mikser ekranında henüz ses yoksa ortalanmış dev boyutlu `%50` opaklıkta soluk ikon (`music-slash`) ve açıklama metni kullanılır.

*Not: Uygulamanın mimari, ürün mantığı ve arka plan gereksinimleri için **mainrules.md** dosyasına bakınız.*
