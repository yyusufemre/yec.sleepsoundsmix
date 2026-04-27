# yec.sleepsoundmix - Product & Engineering Brief

## 1. Ürün Özeti
**yec.sleepsoundsmix**, kullanıcıların rahatlamasını, odaklanmasını ve uykuya dalmasını kolaylaştıran, yüksek performanslı ve Android öncelikli tasarlanmış native bir mobil uygulamadır. Temel amacı ambient ve sleep sound'ları pürüzsüz bir arayüzde birleştirmek, arka planda kesintisiz oynatmak ve modüler bir gelir modeliyle (rewarded ad) kullanıcıyı sıkmadan premium deneyim sunmaktır. 

Proje mimarisi doğrudan native donanım erişimi ve servis (background audio, push notification vb.) gereksinimleri nedeniyle Expo olmadan, **React Native CLI (Bare Workflow)** tabanlı ilerleyecektir.

## 2. Ekranlar ve Kullanıcı Akışları
Uygulama 5 ana sekmeden ve bu sekmeler arası akıştan oluşur:
*   **Ses Kütüphanesi (Tüm Sesler):** "Doğa" ve "Rahatlatıcı" kategorilerinde seslerin grid yapıda listelendiği ana vitrin. Sesler URL (link) üzerinden stream edilecek veya önbelleğe alınacaktır.
*   **Mixer (Mixle):** Kullanıcının seçtiği seslerin eşzamanlı çaldığı aktif ekran. Her ses için özel volume ayarı, tekil ses kaldırma veya "Tüm Mix'i Temizle" aksiyonları bulunur.
*   **Zamanlayıcı (Timer):** Uykuya dalma süresine göre seslerin otomatik durmasını sağlayan (15/30/45/60 dk) dairesel grafikli zamanlayıcı ekranı.
*   **Hazır Mixler (Presets):** Tek dokunuşla çalışan, Remote Config üzerinden güncellenebilen ön tanımlı popüler ses kombinasyonları.
*   **Ayarlar:** Kullanım rehberi, iletişim ve yasal/sürüm bilgileri.

## 3. Monetization ve Unlock (Kilit Açma) Mantığı
Uygulamanın gelir modeli tamamen **Rewarded Ad (Ödüllü Reklam)** stratejisine dayanır.
*   **Tetikleyici:** Kullanıcı üzerinde kilit (ad) ikonu olan bir sese veya premium bir "Hazır Mix"e dokunduğunda reklam akışı başlar.
*   **Ödül Mantığı:** Reklam başarıyla izlendikten sonra tek bir içeriğin değil, **sırayla 3 modun/sesin kilidi topluca açılır.** 
*   **Zaman Kısıtı:** Açılan bu kilitler süresiz değildir; sistem bu 3 içeriği **60 dakika boyunca** kullanıma açık (unlocked) tutar. Süre bitiminde içerikler tekrar kilitlenir. Bu progression state'i uygulamanın merkezinde tutulacaktır.

## 4. Teknik Mimari
Projenin üretime (production) uygun çalışması için seçilen native-uyumlu stack:
*   **Çatı Framework:** React Native CLI (0.73+).
*   **Ses Motoru (Audio Engine):** `react-native-track-player`. Arka plan (background) oynatma, çoklu kanal mixleme ve kilit ekranı kontrolleri için native Android Audio API'leri ile tam uyumlu çalışır.
*   **Reklam Altyapısı:** `react-native-google-mobile-ads` (AdMob Rewarded Video).
*   **Backend & Cloud:** Firebase (`@react-native-firebase/app`).
    *   *Cloud Messaging:* Push bildirimleri ve hatırlatıcılar.
    *   *Crashlytics & Analytics:* Ürün metrikleri ve hata takibi.
    *   *Remote Config:* Hazır mixlerin, reklam sürelerinin ve A/B testlerinin yönetimi.
*   **State Management:** Kilit süreleri, mixer durumları ve aktif seslerin yönetimi için `Zustand` veya `Redux Toolkit` (performans odaklı).
*   **In-App Preview & Deep Linking:** Bildirim tıklandığında uygulamanın belirli bir mix ile önizleme modunda açılması (`React Navigation Deep Linking`).

## 5. Android Öncelikli Geliştirme Planı
1.  **Faz 1: Native Çekirdek ve UI Mimarisi**
    *   Mevcut Expo ve Web dosyalarının tamamen silinip `npx react-native@latest init` ile projenin kurulması.
    *   React Navigation kurulumu ve tasarım anayasasındaki (`designrules.md`) UI/UX bileşenlerinin oluşturulması.
2.  **Faz 2: Audio Engine ve State Yönetimi**
    *   `react-native-track-player` entegrasyonu ve Android Foreground Service ayarları (Background Audio için kritik).
    *   Sahte (mock) URL'ler ile çoklu ses oynatma, mixer ekranı volume kontrolleri ve Timer modülünün bağlanması.
3.  **Faz 3: Reklam ve Progression Sistemi**
    *   AdMob SDK kurulumu.
    *   Kullanıcının reklama tıklaması -> 3'lü kilit açma -> 60 dakikalık global sayacın tetiklenmesi logicasının yazılması (AsyncStorage/Zustand persist ile desteklenmiş).
4.  **Faz 4: Firebase ve Üretim Hazırlığı**
    *   Push notification (FCM) altyapısının kurulması.
    *   Crashlytics ve Analytics bağlamaları. In-app preview aksiyonlarının testleri. Debug ve Release build yapılandırmaları.

## 6. Sonradan Eklenecek iOS Uyarlama Notları
Android tarafı oturduktan sonra iOS (Faz 2) için alınacak önlemler:
*   **Background Audio:** `Info.plist` içinde `UIBackgroundModes` (audio) ayarlarının yapılması ve Apple'ın sıkı arka plan oynatma politikalarına göre testler.
*   **Push Notification:** Apple Developer üzerinden APNs (Apple Push Notification service) sertifikalarının Firebase'e bağlanması.
*   **Reklam:** iOS 14+ için `App Tracking Transparency (ATT)` izninin prompt olarak kullanıcıya gösterilmesi.
*   **Audio Session:** `AVAudioSession` kategorisinin `playback` ve `mixWithOthers` olarak ayarlanması (diğer uygulamalarla çakışmaması için).
