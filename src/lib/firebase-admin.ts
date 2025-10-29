
import { auth } from 'firebase-admin';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

const getApp = () => {
  if (getApps().length) {
    return getApps()[0];
  }

  if (!serviceAccountString) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. The server cannot authenticate with Firebase.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountString);
    return initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (e) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it is a valid JSON object.', e);
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not a valid JSON object.');
  }
};

export async function getAuthenticatedAppForUser() {
  const idToken = await getIdToken();

  try {
    const app = getApp();
    const firestore = getFirestore(app);

    if (!idToken) {
      // Return firestore instance even if user is not authenticated
      // Useful for public data access if needed in the future
      return { app: null, currentUser: null, firestore };
    }

    const decodedToken = await auth(app).verifyIdToken(idToken);
    return { app, currentUser: decodedToken, firestore };
  } catch (error) {
    console.error('Error in getAuthenticatedAppForUser:', error);
    // Return a default state without an authenticated user or app, but DO NOT throw.
    // This allows parts of the app (like AI analysis) to function even if server auth is misconfigured.
    return { app: null, currentUser: null, firestore: null };
  }
}

async function getIdToken() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('__session');
  return sessionCookie?.value;
}
