'use client';
import {
  Auth, 
  signInAnonymously,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch(error => {
    console.error("Anonymous sign-in failed", error);
  });
}

/** Handles the email link sign-in process. */
export function handleSignInWithEmailLink(auth: Auth, onAuthSuccess: () => void) {
    if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
            email = window.prompt('Please provide your email for confirmation');
            if (!email) return; // User cancelled prompt
        }
        
        signInWithEmailLink(auth, email, window.location.href)
            .then((result) => {
                window.localStorage.removeItem('emailForSignIn');
                onAuthSuccess();
            })
            .catch((error) => {
                console.error("Sign in with email link error", error);
                // You might want to show a toast or message to the user here
            });
    }
}
