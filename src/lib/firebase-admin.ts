import { auth } from 'firebase-admin';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

const getApp = () => {
  if (getApps().length) {
    return getApps()[0];
  }

  return initializeApp({
    credential: cert(serviceAccount!),
  });
};

export async function getAuthenticatedAppForUser() {
  const app = getApp();
  const firestore = getFirestore(app);

  const idToken = await getIdToken();
  if (!idToken) {
    return { app: null, currentUser: null, firestore };
  }

  try {
    const decodedToken = await auth(app).verifyIdToken(idToken);
    return { app, currentUser: decodedToken, firestore };
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return { app: null, currentUser: null, firestore };
  }
}

async function getIdToken() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('__session');
  return sessionCookie?.value;
}
