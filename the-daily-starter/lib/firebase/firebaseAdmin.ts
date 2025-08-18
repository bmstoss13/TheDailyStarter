// lib/firebaseAdmin.ts
import * as admin from 'firebase-admin';

// Use a flag to track if initialization was successful
let isFirebaseAdminInitialized = false;

if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY; // The string from .env

    // Process the private key: replace escaped newlines with actual newlines
    const privateKey = rawPrivateKey?.replace(/\\n/g, '\n');

    // Crucial check: make sure all parts of the credential are present
    if (!projectId || !clientEmail || !privateKey) {
        const missing = [];
        if (!projectId) missing.push('FIREBASE_ADMIN_PROJECT_ID');
        if (!clientEmail) missing.push('FIREBASE_ADMIN_CLIENT_EMAIL');
        if (!privateKey) missing.push('FIREBASE_ADMIN_PRIVATE_KEY');
        throw new Error(`Firebase Admin: Missing required environment variables for credentials: ${missing.join(', ')}`);
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: privateKey,
      }),
    });
    isFirebaseAdminInitialized = true; // Set to true ONLY if initializeApp succeeds


  } catch (error: any) { 
    console.error("Firebase Admin: SDK initialization FAILED! Error:", error.message);

  }
} else {
  isFirebaseAdminInitialized = true; // Assume it was successfully initialized before
}

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

if (isFirebaseAdminInitialized) {
  try {

    db = admin.firestore();
    auth = admin.auth();

  } catch (error: any) {
    console.error("Firebase Admin: Error retrieving services after initialization attempt:", error.message);

    throw error;
  }
} else {
  throw new Error("Firebase Admin: SDK is not initialized. Please check previous logs for initialization failures (e.g., missing private key).");
}



export { db, auth };
