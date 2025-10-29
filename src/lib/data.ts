'use server';

import { getAuthenticatedAppForUser } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function saveDiagnosis(userId: string, diagnosisData: any) {
  const { firestore } = await getAuthenticatedAppForUser();

  if (!firestore) {
    throw new Error('Firestore is not initialized.');
  }

  const diagnosisWithTimestamp = {
    ...diagnosisData,
    timestamp: FieldValue.serverTimestamp(),
  };

  await firestore
    .collection('users')
    .doc(userId)
    .collection('diagnoses')
    .add(diagnosisWithTimestamp);
}
