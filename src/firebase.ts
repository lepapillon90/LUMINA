import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:763187775928:web:c2321754eb753062d5274d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// 로그인 상태를 세션 스토리지에 저장하여 브라우저를 닫으면 로그아웃되도록 설정
setPersistence(auth, browserSessionPersistence).catch((error) => {
    console.error('[MY_LOG] Error setting auth persistence:', error);
});

export const db = getFirestore(app, 'lumina');
export const storage = getStorage(app);
export default app;
