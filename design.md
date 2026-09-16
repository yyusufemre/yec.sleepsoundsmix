# Calmix — UI tasarım ve yerleşim standardı

Bu belge mobil uygulamanın tek UI tasarım ve yerleşim standardıdır. Ürün ve teknik notlardaki geçmiş tasarım açıklamaları yerine güncel UI kararları için bu belge esas alınır. Tarih: 15 Eylül 2026.

## 1. Ürün ilkeleri

- Karanlık ortamda sakin, okunabilir ve kolay kontrol edilen bir deneyim sun.
- Ses seçme, mix düzenleme ve zamanlayıcı akışlarını görünür ve tutarlı tut.
- Pixel-perfect kaliteyi tek bir cihazın koordinatlarına bağlama: referans cihazda hassas hizalama, diğer boyutlarda içerik ve safe-area uyumu sağla.
- Dekoratif animasyonlar ses kontrollerine erişimi veya metin okunabilirliğini engellemesin.

## 2. Tasarım kaynakları

Tüm yeni görsel kod `src/theme/tokens.ts` üzerinden değer alır. Bu giriş, `colors.js` ve `typography.js` kaynaklarını da dışa aktarır. Her değer yalnızca kendi ana kaynağında tanımlanır.

- `spacing.ts`: geriye uyumlu yeniden dışa aktarma; bağımsız değer tanımlamaz.
- `layout.js`: eski component API'si için tokenlara referans veren adaptör; ayrı bir tasarım sistemi değildir.
- `colors.js`: mevcut gece paleti, yüzeyler ve anlamsal renkler.
- `typography.js`: font ailesi, ağırlık ve boyutlar.
- `tokens.ts`: boşluklar, köşeler, satır yükseklikleri, ekran ve kontrol ölçüleri.

### Temel değerler

| Alan | Karar |
|---|---|
| Boşluk ölçeği | 4, 8, 12, 16, 20, 24, 32, 40 |
| Yatay ekran kenarı | 20; safe-area ayrıca ekran çerçevesinde uygulanır |
| İçerik üst/alt boşluğu | 24; alt menü ve player yüksekliği bu değere eklenmez |
| İçerik üst genişliği | 640; büyük ekranlarda ortalanır |
| Kart aralığı | 12 |
| Köşeler | 8, 12, 16, 20, 24; kapsül 9999; legacy round 200 |
| Buton minimum yükseklikleri | Küçük 40, orta 48, büyük 64; küçük görünümde dokunma alanını ayrıca genişlet |
| İkon düğmesi dokunma hedefi | En az 48; görsel ikon boyutundan bağımsız |
| Timer seçim hücresi | Eşit flex payı, en fazla 88 genişlik; metin için dikey büyüme |
| Ana başlık | 42 / 50 satır yüksekliği; içerikle ölçülen gradient maske |
| Diğer metinler | H2 28/36, H3 22/30, body 16/24, medium 15/22, small 14/20, caption 13/18, tiny 10/14 |

React Native sayısal ölçüleri fiziksel piksel değildir; platformun mantıksal ölçü birimleridir. Ana bilgi için tiny/badge gibi küçük stiller kullanılmaz.

### Anlamsal renkler

Mevcut marka korunur: ana vurgu mavi `#3471EC`, olumlu durum yeşil `#47F185`, uyarı `#DC9D20`, tehlike `#EF324B`. Başlık gradyanı `#91B2DF` → `#4C1E9A`. Kartlar mevcut `colors.glass` varyantlarını kullanır. Bütün ekranın opaklığını düşürerek kilitli durum gösterilmez; durum ikonu ve okunabilir açıklama tercih edilir.

## 3. Ekran yerleşim sözleşmesi

- Beş sekme `AppScreen` kullanır. Üst/sol/sağ safe-area buraya aittir.
- Onboarding, `AppScreen standalone` kullanır; alt safe-area da kendisine aittir.
- Tab bar ve MiniPlayer, `AppTabBar` içinde normal dikey akışa katılır. Player görünürse gerçek yüksekliği sahnenin kullanılabilir yüksekliğini azaltır.
- Ekranlar alt menü/player için 110/190 gibi tahmini padding bırakmaz. Alt safe-area, BottomTabBar tarafından bir kez uygulanır.
- Toast, ekran sahnesinin altından 16 birim içeride gösterilir; sahne zaten player ve menünün üzerinde biter.
- Kaydırılabilir içerik `ScreenScrollView` kullanır: yatay 20, alt 24, `flexGrow: 1`, klavye açıkken kontroller için `keyboardShouldPersistTaps="handled"`.
- iOS klavye uyumu navigator düzeyindeki KeyboardAvoidingView ile, Android mevcut `adjustResize` ayarıyla yönetilir. Klavye açıkken alt dock gizlenir.
- Scroll içinde Header kullanılırsa `inset={false}` verilir; yatay kenar ikinci kez uygulanmaz. Kütüphanedeki sabit Header varsayılan inseti kullanır.
- Settings, Timer, Mixer ve Presets dikey kaydırılabilir. Kısa ekranlarda footer/aksiyonlara kaydırarak erişilebilir.
- Bir pencere genişliği modül yüklenirken sabitlenmez. Gridler Flexbox kullanır; animasyon veya paging için gereken ölçü `onLayout` ile gerçek containerdan alınır.
- FlatList kartları içerikle büyüyorsa sabit `getItemLayout` kullanılmaz. Yatay onboarding sayfaları ölçülen eşit genişlik nedeniyle bu optimizasyonu kullanabilir.
- Metin büyüyünce kart da büyür. Bilgi taşıyan metin için sabit maskeyle kırpma veya genel font ölçeklemesini kapatma uygulanmaz.

## 4. Component ve özel yüzey kuralları

Mevcut componenti kullan; görünüm farkını mümkünse varyantla ifade et. Aynı satır/kontrol tekrarlandığında ortak component çıkar. Faz 1–2 bu altyapıyı hazırlar; tüm eski ekran içi kontrollerin taşınması Faz 3 kapsamındadır.

- Yeni metinlerde AppText veya merkezi tipografi tokenlarını kullan.
- Yerel sabit değer gerekiyorsa semantik bir component ölçüsü olup olmadığını değerlendir; ekran kenarı, menü yüksekliği ve standart boşluğu tekrar yazma.
- Absolute yerleşim gradient, SVG, rozet ve Sleep Flow kelime animasyonu gibi katmanlarda kullanılabilir. Ana içerik yerleşimini keyfi koordinatlarla kurma.
- Native splash, sistem Alert, reklam/izin ve puanlama pencereleri platform/SDK tarafından yönetilir; bunlar için aynı React component ağacı beklenmez.
- Admin ve tanıtım/yasal HTML sayfaları ayrı web yüzeyleridir. Mobil fazların tamamlanması web stillerinin taşındığı anlamına gelmez.

## 5. Kabul kriterleri

- Menü/player görünürlüğü değişince içerik örtülmez; klavye açıkken kayıt alanı erişilebilir kalır.
- Küçük ekran ve büyük yazıda Settings/Timer aksiyonlarına kaydırarak erişilir.
- Uzun mix adı, 7 dil ve başlık satır kırılması sağdaki kontrolleri dışarı itmez.
- Ekran genişliği değişince kategori göstergesi ve onboarding sayfaları yeniden ölçülür.
- Merkezî token değişikliği eski adaptörlere de yansır; ikinci bir bağımsız tanım eklenmez.
- TypeScript ve değiştirilen dosyaların lint kontrolü geçer. Native derleme ve cihaz testlerinin sonucu ayrıca raporlanır; doğrulanmamış cihaz/durumlar test edilmiş sayılmaz.
- Faz 5'te Android/iOS, küçük/büyük telefon, tablet, 7 dil, büyük yazı ve overlay/klavye kombinasyonları görsel olarak doğrulanır.

## 6. Faz durumu

- Faz 1: merkezi tasarım giriş noktası, uyum adaptörleri ve bu standart oluşturuldu.
- Faz 2: ortak ekran/dock akışı, kaydırma, içerik genişliği, kategori/paging ölçümleri ve liste yüksekliği düzeltmeleri uygulandı.
- Faz 3: ortak component dönüşümü tamamlandı (`SaveMixForm`, `SavedMixRow`, `SettingsRow`, `ModalShell`, `EmptyState`, `LanguageSelectorModal`, `TimerControls`, `LegalFooter`).
- Faz 4: görsel incelik, erişilebilirlik ve büyük yazı uyumu (erişilebilir font ölçeğinde ses kartlarının tek sütuna geçişi, basılı/seçili durumlar) tamamlandı.
- Faz 5: Android üzerinde 7 dilde arayüz ve modal akışları, kayıtlı mix döngüsü, klavye/dock etkileşimi ve mini player entegrasyonu görsel olarak doğrulandı.

## 7. Faz doğrulama kaydı

15–16 Eylül 2026:

- TypeScript (`tsc --noEmit`) hatasız geçti.
- Jest testleri: 15 birim testi başarıyla geçti (`AppTabBar` davranış testleri ve `DesignComponents` ortak bileşen testleri).
- Android API 36.1 emülatöründe 7 dilde (TR, EN, DE, ES, FR, JA, PT) ekranlar kontrol edildi; uzun metinlerde ve Doğu Asya gliflerinde (Japonca) taşma veya sağ kontrolleri itme sorunu görülmedi.
- Modal akışları (`LanguageSelectorModal`, `DeveloperInfoModal`, `SleepTimerModal`, sistem kayıt Alert'i) ve `SavedMixRow` bileşeninin Mixer ve Presets ekranlarındaki ortak davranışı doğrulandı.
- Mix kayıt formu (`SaveMixForm`) üzerinde klavye odağında alt dock'un gizlenmesi, içerik kaydırma erişimi ve klavye kapanınca dock'un geri gelmesi doğrulandı.
- Mini player'ın ses seçimlerinde görünmesi, duraklat/oynat etkileşimi ve alt menü (`AppTabBar`) ile dikey akış uyumu doğrulandı.
- iOS native derleme/görsel kontrolü, Xcode projesindeki yerelleştirme dosyaları yol yapılandırması nedeniyle native proje ayarlarına dokunulmadan engelli olarak bırakıldı.
