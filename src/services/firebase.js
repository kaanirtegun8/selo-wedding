/* =========================================================
   FIREBASE SERVİSİ (Faz 2 — gerçek)
   - Mesajlar → Firestore `messages`
   - Fotoğraflar → Storage `uploads/`, metadata → Firestore `photos`
   Yapılandırma `.env` (VITE_FIREBASE_*) üzerinden gelir.
   ========================================================= */
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore'
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const storage = getStorage(app)

// Dosya adını yol için güvenli hale getir
function safeName(name) {
  return (name || 'foto')
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9.\-_]/g, '_')
    .slice(-80)
}

/**
 * Fotoğrafları Storage'a yükler, her biri için Firestore'a metadata yazar.
 * Gerçek bayt ilerlemesini toplayıp onProgress(0..100) ile bildirir.
 * @param {File[]} files
 * @param {(percent:number)=>void} [onProgress]
 * @returns {Promise<{ok:boolean, count:number}>}
 */
export async function uploadPhotos(files, onProgress) {
  const total = files.length
  if (!total) return { ok: true, count: 0 }

  const sizes = files.map((f) => f.size || 1)
  const totalBytes = sizes.reduce((a, b) => a + b, 0)
  const loaded = new Array(total).fill(0)
  const emit = () => {
    const done = loaded.reduce((a, b) => a + b, 0)
    onProgress?.(Math.min(99, Math.round((done / totalBytes) * 100)))
  }

  await Promise.all(
    files.map(
      (file, i) =>
        new Promise((resolve, reject) => {
          const path = `uploads/${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}-${safeName(file.name)}`
          const task = uploadBytesResumable(storageRef(storage, path), file, {
            contentType: file.type,
          })
          task.on(
            'state_changed',
            (snap) => {
              loaded[i] = snap.bytesTransferred
              emit()
            },
            reject,
            async () => {
              loaded[i] = sizes[i]
              emit()
              try {
                await addDoc(collection(db, 'photos'), {
                  path,
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  createdAt: serverTimestamp(),
                })
                resolve()
              } catch (err) {
                reject(err)
              }
            },
          )
        }),
    ),
  )

  onProgress?.(100)
  return { ok: true, count: total }
}

/**
 * Misafir mesajını Firestore'a yazar.
 * @param {{name:string, text:string}} payload
 * @returns {Promise<{ok:boolean}>}
 */
export async function sendMessage({ name, text }) {
  await addDoc(collection(db, 'messages'), {
    name: name || '',
    text,
    createdAt: serverTimestamp(),
  })
  return { ok: true }
}

/* ------------------- ADMIN: veri okuma ------------------- */

function tsToMillis(ts) {
  return ts?.toMillis ? ts.toMillis() : 0
}

/**
 * Tüm mesajları (yeniden eskiye) getirir.
 * @returns {Promise<Array<{id:string,name:string,text:string,createdAt:number}>>}
 */
export async function fetchMessages() {
  const snap = await getDocs(
    query(collection(db, 'messages'), orderBy('createdAt', 'desc')),
  )
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      name: data.name || '',
      text: data.text || '',
      createdAt: tsToMillis(data.createdAt),
    }
  })
}

/**
 * Tüm foto/videoları (yeniden eskiye) getirir; her biri için indirme URL'ini çözer.
 * @returns {Promise<Array<{id,url,name,type,size,isVideo,createdAt}>>}
 */
export async function fetchMedia() {
  const snap = await getDocs(
    query(collection(db, 'photos'), orderBy('createdAt', 'desc')),
  )
  return Promise.all(
    snap.docs.map(async (d) => {
      const data = d.data()
      let url = ''
      try {
        url = await getDownloadURL(storageRef(storage, data.path))
      } catch {
        url = ''
      }
      return {
        id: d.id,
        url,
        name: data.name || 'dosya',
        type: data.type || '',
        size: data.size || 0,
        isVideo: (data.type || '').startsWith('video/'),
        createdAt: tsToMillis(data.createdAt),
      }
    }),
  )
}
