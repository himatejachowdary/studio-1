
import { auth } from 'firebase-admin';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

const getApp = () => {
  if (getApps().length) {
    return getApps()[0];
  }

  // Allow app to run without service account in dev for client-side only work
  if (!serviceAccountString && process.env.NODE_ENV !== 'production') {
    return initializeApp();
  }

  if (!serviceAccountString) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. The server cannot authenticate with Firebase.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountString);
    return initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (e: any) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it is a valid JSON object.', e.message);
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not a valid JSON object.');
  }
};

export async function getAuthenticatedAppForUser() {
  const idToken = await getIdToken();
  const app = getApp();
  const firestore = getFirestore(app);

  if (!idToken) {
    return { app, currentUser: null, firestore };
  }
  
  // If service account is not available in dev, we can't verify token.
  if (!serviceAccountString && process.env.NODE_ENV !== 'production') {
    console.warn("FIREBASE_SERVICE_ACCOUNT_KEY not set in dev. Cannot verify user token on server-side. User will appear unauthenticated to server actions.");
    return { app, currentUser: null, firestore };
  }

  try {
    const decodedToken = await auth(app).verifyIdToken(idToken);
    return { app, currentUser: decodedToken, firestore };
  } catch(e) {
    console.error("Token verification failed.", e);
    // This can happen if the token is expired or invalid.
    // Treat the user as unauthenticated.
    return { app, currentUser: null, firestore };
  }
}

async function getIdToken() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('__session');
  return sessionCookie?.value;
}
