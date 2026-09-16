# Component ve yerleşim sistemi denetimi

Tarih: 15 Eylül 2026

## Sonuç ve kapsam

**Bütün arayüz tek bir ortak component ve otomatik yerleşim sistemine bağlı değil.** React component ağacı ve Flexbox yaygın kullanılıyor; ortak tasarım değerlerine bağlanma, tekrar kullanılabilir kontrol/satır bileşenleri ve ekran ölçüsüne uyum ise kısmi.

İncelenen mobil kapsam: 6 ekran, `src/components` altındaki 21 TSX dosyası, navigasyon ve App.tsx; toplam 29 TSX dosyası. `GlobalAudioPlayer` görsel öğe üretmediğinden görsel uyumluluk değerlendirmesine dahil edilmedi. Tema dosyaları, native açılış ekranı ve projedeki HTML yüzeyleri de incelendi.

Bu rapor kaynak kodu ve JSX/stil yapısının statik incelemesine dayanır. Küçük ekran, büyük yazı ve farklı cihazlarda taşma riskleri işaretlenmiştir; cihaz üzerinde gözlemlenmiş hatalar olarak sunulmamıştır. Uygulama kodu değiştirilmedi.

Burada “auto layout”, React Native'deki Flexbox akışı, içerik büyümesine uyum, gerçek container ölçüsü ve safe-area hesabı anlamındadır. Figma dosyası veya Figma Auto Layout bağlantısı bu incelemenin kapsamında değildir.

Bir öğenin kendi dosyasında bulunması, tema sistemine bağlı olduğu anlamına gelmez. Ekran dosyasında tanımlanan `TimerRing` gibi öğeler de geçerli React componentleridir. `position: absolute`, sabit ikon ölçüsü veya doğrudan `Text` kullanımı tek başına hata sayılmamıştır.

## 1. Yerleşim sisteminden ayrılan noktalar

### L1 — Tek bir ölçü kaynağı yok

- [layout.js](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/theme/layout.js:3) ve [spacing.ts](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/theme/spacing.ts:25) aynı spacing, radius ve ekran boşluklarını ayrı ayrı tanımlıyor.
- `radius.round`, birinde 32, diğerinde 200. Bu alanların şu an kullanıldığına dair referans bulunmadı; bu bir mevcut görsel hata değil, tanım tutarsızlığı.
- `screen.tabBarHeight`, `screen.paddingTop` ve `component` ölçü grubunun tüketildiğine dair referans bulunmadı. Tanımlı olmaları ekranları otomatik yönetmiyor.
- `MixerItem`, ortak `component.sliderHeight` yerine kendi iOS/Android 36/28 ölçülerini kullanıyor; ortak değer 50/32. [MixerItem.tsx](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/components/MixerItem.tsx:255)

**Etki:** Tek bir tema veya ölçü değişikliği bütün arayüze yayılmıyor.

### L2 — Tab bar, mini player ve toast ortak alt alan hesabını kullanmıyor

- [AppNavigator.tsx](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/navigation/AppNavigator.tsx:177): tab bar yüksekliği 85, alt padding 20, üst padding 10.
- [MiniPlayer.tsx](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/components/MiniPlayer.tsx:81): `position: absolute`, `bottom: 92`.
- [GlassToast.tsx](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/components/GlassToast.tsx:108): `bottom: 100`; mini player görünürlüğüne göre değişmiyor.
- Ekranların ayırdığı alt boşluklar ayrı 110/120 ve 180/190 sabitlerine dayanıyor. Gerçekte ölçülen menü/player yüksekliğinden türetilmiyor.

**Etki:** Yazı ölçeği veya cihaz ölçüsü değiştiğinde içerik için ayrılan alan gerçek alt kontrollerle uyuşmayabilir. Toast ile mini player aynı alt alanı paylaşabilir. Sorun absolute kullanılması değil, konumların birbirinden bağımsız olması.

### L3 — SettingsScreen alt boşluğu iki ayrı katmanda ayırıyor

[SettingsScreen.tsx](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/screens/SettingsScreen.tsx:169) kök `SafeAreaView` üzerinde `dynamicPadding`, [mainContent](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/screens/SettingsScreen.tsx:327) içinde ayrıca `screenBottomDefault` uyguluyor. İçerik `ScrollView` içinde değil.

**Etki:** İçerik alanı gereksiz daralıyor. Küçük ekran ve büyük yazıda alt bölümün erişilememesi riski var.

### L4 — Pencere genişliği bir kez okunuyor

- [ModeSwitcherComponent.tsx](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/components/ModeSwitcherComponent.tsx:6): gösterge genişliği ve hareket mesafesi modül yüklenirken pencere genişliğinden hesaplanıyor; gerçek container ölçülmüyor.
- [TimerScreen.tsx](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/screens/TimerScreen.tsx:148): süre düğmeleri aynı yöntemle hesaplanıyor; üst boyut sınırı yok.
- [OnboardingScreen.tsx](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/screens/OnboardingScreen.tsx:23): slayt genişliği sabit `SCREEN_WIDTH` değerini kullanıyor.
- Bu alanlarda `useWindowDimensions` veya boyut değişikliği dinleyicisi yok.

**Etki:** Container/pencere yeniden boyutlandığında hesaplar güncellenmeyebilir. Portre kilidi bazı senaryoları azaltır; içerik ölçüsünden bağımsızlığı ortadan kaldırmaz.

### L5 — Kütüphane listesi değişken kart yüksekliğini sabit kabul ediyor

[LibraryScreen.tsx](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/screens/LibraryScreen.tsx:160) `getItemLayout` içinde 92 birim satır kabul ediyor. [SoundCard.tsx](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/components/SoundCard.tsx:74) ise `height` yerine `minHeight: 80`, margin 6 ve içerik tabanlı ölçü kullanıyor.

**Etki:** Normal yazı boyutunda 80 + 12 eşleşebilir; içerik/yazı büyüyüp kart uzarsa liste ölçüsü gerçek ölçüden ayrılır. `maxWidth: '47%'`, iki sütun ve ekranın `paddingHorizontal - 6` düzeltmesi de aynı grid componenti tarafından yönetilmiyor.

### L6 — Timer ekranı içeriğin uzamasını karşılayacak dikey kaydırma sunmuyor

[TimerScreen.tsx](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/screens/TimerScreen.tsx:366): `space-between` yerleşimi, 120 birim halka, iki sıra genişlikten hesaplanan düğme ve 52 birim aksiyon alanı var. Dikey `ScrollView` yok. Başlık, zaten yatay padding verilen container içinde ayrıca kendi yatay paddingini uyguluyor.

**Etki:** Dar yükseklik/büyük yazı için uyarlanabilir alternatif yok; başlık hizası diğer ekranlardan ayrılıyor. Halka ve ikonların sabit ölçüsü tek başına hata değil.

### L7 — Onboarding başlığı ve kontrolleri kendi sabit alanlarında

[OnboardingScreen.tsx](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/screens/OnboardingScreen.tsx:671): başlık maskesi 90, başlık fontu 36 ve line-height 44, üst padding 56, atla düğmesi `top: 60`. Slaytlar yatay kayıyor; slayt içeriği için dikey kaydırma yok.

**Etki:** Uzun çeviri/büyük yazıda başlık sabit maskeye sığmayabilir. Dekoratif animasyonların absolute olması bu bulgudan ayrı ve beklenen bir kullanım.

### L8 — Modal ve metin büyümesi kuralları ortak değil

- [DeveloperInfoModal.tsx](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/components/DeveloperInfoModal.tsx:98): yüzde genişlik ve `maxWidth: 340` var; ortak modal shell, safe-area hesabı, maksimum yükseklik ve kaydırma yok.
- [LanguageSelectorModal.tsx](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/components/LanguageSelectorModal.tsx:82): yüzde genişlik, `maxWidth: 340`, `maxHeight: '80%'` ve kaydırma var; bu daha uyumlu davranış diğer modallerle paylaşılmıyor.
- [SleepTimerModal.tsx](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/components/SleepTimerModal.tsx:100): kendi kart/overlay yapısı, 320 üst genişlik ve 48 düğme yüksekliği.
- [AppButton.tsx](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/components/AppButton.tsx:44) ve [ActionButton.tsx](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/components/ActionButton.tsx:47): sabit yükseklikler; uzun/büyük yazı için ortak içerikle büyüme kuralı yok.
- [MixerScreen.tsx](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/screens/MixerScreen.tsx:246): kayıtlı mix adı sarmalayıcısında `flex: 1`/daralma veya satır sınırı yok; uzun kullanıcı adları sağdaki aksiyonları zorlayabilir.

## 2. Ortak component sisteminin dışında kalan ekran öğeleri

| Ekran | Ortak sisteme bağlı taraf | Ayrı tanımlanan öğeler |
|---|---|---|
| [LibraryScreen](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/screens/LibraryScreen.tsx:135) | Header, SoundCard, ModeSwitcher, AppText, toast ve banner | Grid ölçüsü/kenar hesabı, boş durum sarmalayıcısı ve alt alan hesabı ekran içinde. Ortak Screen/Grid/EmptyState yok. |
| [MixerScreen](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/screens/MixerScreen.tsx:137) | Header, MixerItem, GlassCard, ActionButton | Mix rozeti, kayıt formu/TextInput, kaydet düğmesi, ekle düğmesi, boş durum, kayıtlı mix satırı ve oynat/sil kontrolleri. Ekrandaki metinler AppText veya tipografi tokenlarını kullanmıyor. |
| [TimerScreen](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/screens/TimerScreen.tsx:29) | Header, ActionButton, toast; ekran içinde TimerRing ve TimerButton componentleri | Ring/button ortak kütüphanede değil; kendi renk/ölçü/fontları var. Sleep Flow düğmesi de ekran içinde. Ortak progress ve süre seçici sistemi yok. |
| [PresetsScreen](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/screens/PresetsScreen.tsx:242) | Header, PresetCard, AppText, banner, toast | Bölüm boşlukları ve alt alan hesabı ekran içinde. Kayıtlı mix sunumu MixerScreen'deki satırla ortaklaştırılmamış. |
| [SettingsScreen](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/screens/SettingsScreen.tsx:175) | Header, GlassCard, AppText, AppButton, dil/geliştirici modalleri | Dil/gizlilik/bildirim satırları, dil rozeti, Switch görünümü, puanlama grubu ve footer ekran içinde. Ortak SettingsRow/ToggleRow/LegalFooter yok. |
| [OnboardingScreen](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/screens/OnboardingScreen.tsx:516) | Ekran içinde SoundCardsVisual, MixerVisual, TimerVisual, DotIndicator, OnboardingSlideItem | AppButton/AppText/Header/GlassCard kullanılmıyor. Başlık, atla/ileri/başla ve görsel sunumlar kendi stil sisteminde. Animasyonlu tanıtım çizimleri özel component olarak kalabilir; ortak kontrol/token bağlantıları eksik. |

**Önemli ortak eksik:** `IconButton` tanımlı olmasına rağmen uygulama kaynaklarında kullanımına rastlanmadı. Oynat, sil, kapat ve ekle gibi ikon düğmeleri ayrı ayrı yazılıyor. [IconButton.tsx](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/components/IconButton.tsx:17)

## 3. Mevcut görsel componentlerin tema/yerleşim envanteri

“Kısmi” ifadesi componentin bulunmadığını değil, ortak renk/font/ölçülerin yalnızca bir bölümünün kullanıldığını belirtir.

| Component | Durum | Ortak sistem dışında kalan taraf |
|---|---|---|
| AppText | Büyük ölçüde bağlı | Font/renk/line-height merkezi; uygulama genelinde kullanımı zorunlu değil. |
| GlassCard | Büyük ölçüde bağlı | Renk, radius ve padding merkezi; çağıran ekranlar bunları yerel stillerle değiştirebiliyor. |
| AppBadge | Büyük ölçüde bağlı | AppText, renk ve layout kullanıyor; tanımlı `component.badgeHeight` ile bağlantısı yok. |
| AppButton | Kısmi | Merkezi renk/metin/padding; yükseklikler 40/48/64 ve ikon ölçüleri component içinde. |
| IconButton | Kullanım dışı | Merkezi renkler; boyutlar yerel. Diğer ikon düğmelerini yönetmiyor. |
| ActionButton | Tema bağlantısı zayıf | Theme importu yok; bütün renk, font ve ölçüler yerel. AppButton'dan ayrı ikinci düğme sistemi. |
| HeaderComponent | Büyük ölçüde bağlı | Doğrudan Text kullanmasına rağmen tipografi tokenları bağlı; üst padding 38 ve sabit maske yüksekliği istisna. |
| SoundCard | Kısmi | AppText/AppBadge/GlassCard ve renkler bağlı; grid genişliği, margin, padding, minHeight ve badge offsetleri yerel. |
| PresetCard | Kısmi | AppText/AppBadge/GlassCard ve renkler bağlı; padding 24/16, gap ve açıklama line-height 16 yerel. |
| MixerItem | Büyük ölçüde bağlı | Ortak metin, kart, spacing; kontrol genişlikleri, slider yüksekliği, ikon düğmeleri yerel. |
| ModeSwitcherComponent | Tema bağlantısı zayıf | Renk/font/spacing yerel; üç benzer sekme ayrı JSX; gösterge pencere genişliğinden bir kez hesaplanıyor. |
| MiniPlayer | Kısmi | AppText/renk/layout bağlı; alt konum 92 ve kendi ikon düğmesi ortak sistem dışında. |
| GlassToast | Kısmi | Renk/layout bağlı; alt konum 100, font/padding/gap ve blur rengi yerel. |
| LanguageSelectorModal | Kısmi | Aktif vurgu rengi ve GlassBlur ortak; metinler, kart, satırlar ve ölçüler kendi stilinde. Kaydırma mevcut. |
| DeveloperInfoModal | Tema bağlantısı zayıf | GlassBlur/YecLogo kullanıyor; kart, metinler, bağlantılar ve mağaza düğmesi kendi renk/font/ölçülerinde. |
| SleepTimerModal | Kısmi | GlassBlur/renk/layout bağlı; metinler ve uzatma düğmesi ortak AppText/AppButton üzerinden değil. |
| SleepFlowOverlay | Özel yüzey, kısmi | Safe-area alt inseti kullanılıyor; metin, kontrol paneli, kapat düğmesi ve renk/ölçüler yerel. Rastgele kelime katmanı bilinçli serbest yerleşim. |
| BannerAdView | SDK sarmalayıcısı | Reklamın iç yerleşimi SDK'ya ait; dış padding 16 yerel. |
| GlassBlur | Özel çizim sarmalayıcısı | Blur/fallback varsayılanları yerel; absoluteFill, kapladığı yüzeye uyum için uygun. |
| YecLogo | Vektör varlık | Özel SVG geometrisi; genel metin/yerleşim tokenlarına bağlanması beklenmez. |

Component kaynakları: [src/components](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/src/components).

## 4. Native ve web yüzeyleri

- [App.tsx](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/App.tsx:155): splash ve ana arka plan yüzde/flex ölçülerine uyuyor; splash rengi ve global modal sarmalayıcısı kendi tanımlarında. Raster splash içeriğinin öğeleri ayrı React componentleri değil; bu bir açılış görseli tercihi.
- [iOS BootSplash](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/ios/SleepSoundsMix/BootSplash.storyboard:2): gerçek iOS Auto Layout açık; imageView dört kenardan kök view'a constraint ile bağlı. React tema tokenlarından ayrı native kaynaklar kullanıyor. Bu yerleşim açısından olumlu.
- Android açılışı [styles.xml](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/android/app/src/main/res/values/styles.xml:16) üzerinden BootSplash temasına bağlı; renk/görseller native kaynaklarda. React component ağacının dışında olması beklenir.
- [Admin](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/admin/index.html:10): kendi CSS değişkenleri, Flex/Grid ve breakpoint sistemi var. Mobil uygulamanın component/token dosyalarıyla ortak değil; “responsive değil” denemez. Kartlar JS şablonlarıyla oluşturuluyor.
- [Web ana sayfa](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/public_deploy/index.html:12) ve [yasal sayfa](/Users/yusuf/Desktop/Apps/yec.sleepsoundsmix/privacy_and_terms.html:7): ayrı gömülü CSS ve farklı token/palet tanımları; ortak web component paketi veya mobil tokenlardan üretim yok. Media query desteği mevcut.
- `public_deploy/admin/index.html` ve `public_deploy/privacy.html`, hazırlama scriptinin kopyaladığı çıktılar. Ayrı React componentler olarak değerlendirilmemeli.
- Sistem Alert pencereleri, reklam izin formu, native puanlama ve reklam içerikleri işletim sistemi/SDK arayüzleri. Uygulamanın kendi tasarım sistemine tamamen bağlanmaları beklenmez.

## 5. Öncelik sırası

1. **Yerleşim:** Settings çift alt paddingini, tab bar/player/toast alt alan paylaşımını ve küçük ekranlarda dikey erişimi ele almak.
2. **Ölçü kaynakları:** `layout` ve `spacing` tekrarını kaldırıp ekran/container ölçüsünden türetilen bir Screen yerleşimi oluşturmak; sabit pencere okumalarını ve kütüphane satır hesabını düzeltmek.
3. **Ortak componentler:** SaveMixForm, SavedMixRow, SettingsRow, EmptyState ve ModalShell oluşturmak; mevcut IconButton kullanımını yaygınlaştırmak.
4. **Görsel tutarlılık:** ActionButton ve AppButton varyantlarını aynı temel kurallara bağlamak; bağımsız metin/renk/boşlukları merkezi tokenlara taşımak. Özel animasyon componentleri korunabilir.
5. **Doğrulama:** Küçük/büyük telefon, tablet, uzun mix adı, 7 dil, büyük sistem yazısı, mini player açık/kapalı ve klavye açık durumlarını görsel olarak sınamak.

Bu sıra bir uygulama planı önerisidir; rapor kapsamında bu değişiklikler yapılmadı.
