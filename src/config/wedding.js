/* =========================================================
   DÜĞÜN YAPILANDIRMASI
   Her şeyi buradan özelleştir — başka dosyaya dokunmaya gerek yok.
   ========================================================= */

// Banner görseli.
// Gerçek fotoğrafı `src/assets/images/` içine koy ve aşağıdaki importu
// kendi dosyanla değiştir, ör:  import bannerImage from '@/assets/images/nisa-kaan.jpg'
import bannerImage from '@/assets/images/selcuk-sumeyya.jpg'

export const wedding = {
  // --- Çift bilgileri ---
  coupleNames: 'Selçuk & Sümeyya', // banner'da büyük yazı
  kicker: 'Düğün Hatırası', // üstte küçük, harf aralıklı yazı
  dateLabel: '5 Temmuz 2026', // tarih satırı (boş bırakırsan gizlenir)
  hashtag: '#SelçukSümeyyaEvleniyor', // footer'da görünür (boş bırakırsan gizlenir)

  // --- Banner görseli ---
  bannerImage,

  // --- Karşılama metinleri ---
  welcomeTitle: 'Anılarımıza Sen de Katıl 💛',
  welcomeText:
    'Bu güzel günde bizimle olduğun için teşekkürler. Çektiğin fotoğrafları yükleyebilir veya bize tatlı bir mesaj bırakabilirsin.',

  // --- Limitler ---
  maxPhotos: 10, // tek seferde en fazla dosya (foto + video)
  maxPhotoSizeMB: 15,
  maxVideoSizeMB: 50,
  messageMaxLength: 500,

  // --- Admin paneli (basit şifre kapısı) ---
  adminPassword: 'baranım',
}

export default wedding
