
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
  } catch (e: any) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it is a valid JSON object.', e.message);
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not a valid JSON object.');
  }
};

export async function getAuthenticatedAppForUser() {
  const idToken = await getIdToken();
  const app = getApp(); // This will throw if service account is not set up, which is intended.
  const firestore = getFirestore(app);

  if (!idToken) {
    // Return firestore instance even if user is not authenticated
    // But currentUser will be null.
    return { app, currentUser: null, firestore };
  }

  const decodedToken = await auth(app).verifyIdToken(idToken);
  return { app, currentUser: decodedToken, firestore };
}

async function getIdToken() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('__session');
  return sessionCookie?.value;
}

