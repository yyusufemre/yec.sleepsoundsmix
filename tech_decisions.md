# Teknik Karar Notu (Tech Decisions & Dependencies)

Bu belge, yec.sleepsoundsmix uygulamasının native geliştirme sürecinde neden spesifik paketlerin/altyapıların seçildiğini kaydeder.

## 1. Native Framework (React Native CLI)
- **Neden Seçildi?** Arka planda ses oynatma (background audio), detaylı Firebase entegrasyonu ve AdMob kısıtlamaları nedeniyle Expo'nun getirebileceği limitasyonlardan kaçınmak için seçildi.
- **Karar:** Bare workflow, doğrudan Android klasörüne müdahale imkanı sunar.

## 2. Ses Motoru (Audio Engine & Mixer Stratejisi)
- **Neden Seçildi?** Uygulamanın temel amacı bir "Ambient Mixer" olmak, yani birden fazla sesi (örn: yağmur + piyano + rüzgar) aynı anda, farklı ses seviyelerinde ve kesintisiz çalmaktır. 
- **Mimari Karar (Çoklu Ses Çalma):** `react-native-track-player` geleneksel kuyruk (playlist/queue) tabanlı müzik çalarlar için mükemmeldir, ancak **aynı anda birden fazla sesi eşzamanlı çalamaz**. Bu nedenle, çoklu ses katmanlarını çalmak için `react-native-sound` veya `expo-av`'nin "Sound" API'si kullanılacaktır.
- **Arka Plan (Background) Oynatma:** Çoklu ses çalan kütüphaneler genellikle Android'in Foreground Service gereksinimlerini otomatik yönetmez. Bu yüzden `react-native-track-player` (sessiz bir track ile uygulamayı arka planda hayatta tutmak ve kilit ekranı kontrollerini sağlamak için) bir "kukla (dummy) servis" veya `@supersami/rn-foreground-service` benzeri bir native background yöneticisi ile birlikte kullanılacak şekilde kurgulanacaktır.

## 3. Reklam Ağı (react-native-google-mobile-ads)
- **Neden Seçildi?** Firebase altyapısı ile bütünleşik olması ve Rewarded Ad (Ödüllü Reklam) modelinde piyasadaki en stabil SDK olması nedeniyle AdMob tercih edilmiştir.

## 4. State Yönetimi (Zustand)
- **Neden Seçildi?** Redux'a göre çok daha az boilerplate (ekstra kod) gerektirir. Mixer statelerini, volume değerlerini ve "60 Dakika Unlock" global state'ini en hızlı ve performanslı şekilde yönetecek araçtır.

## 5. UI ve Navigasyon
- **Navigasyon:** `@react-navigation/native` ve `bottom-tabs`. Standart, native performanslı ve esnek.
- **Glassmorphism:** `@react-native-community/blur` ve `react-native-linear-gradient` paketleri, uygulamanın ana temasını oluşturan "Night/Glass" efektini donanımsal hızlandırma ile sağlamak için seçildi.

## 6. Push Notifications ve Backend
- **Seçim:** `@react-native-firebase/app` ve modülleri.
- **Neden?** Geliştirici dostu olmasının yanı sıra, "Remote Config" ile ileride Preset listelerini uygulamayı güncellemeden değiştirebilmemize imkan tanır. In-App preview için "messaging" modülü derin bağlantılarla (deep links) uyumlu çalışır.
