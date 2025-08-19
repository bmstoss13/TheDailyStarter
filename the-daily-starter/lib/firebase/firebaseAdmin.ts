// lib/firebaseAdmin.ts
import * as admin from 'firebase-admin';

// Declare variables to hold the initialized app and its services
// We use 'let' because they will be assigned conditionally.
// Provide a default type 'any' or 'undefined' initially, and ensure they are assigned before export.
let app: admin.app.App;
let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

// Check if any Firebase Admin app has already been initialized
// admin.apps is an array of initialized apps. If its length is 0, no app has been initialized.
if (admin.apps.length === 0) {
  try {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    // Process the private key: replace escaped newlines with actual newlines
    const privateKey = rawPrivateKey?.replace(/\\n/g, '\n');

    // Crucial check: make sure all parts of the credential are present
    if (!projectId || !clientEmail || !privateKey) {
        const missing = [];
        if (!projectId) missing.push('FIREBASE_ADMIN_PROJECT_ID');
        if (!clientEmail) missing.push('FIREBASE_ADMIN_CLIENT_EMAIL');
        if (!privateKey) missing.push('FIREBASE_ADMIN_PRIVATE_KEY');
        // Log a clear error and throw to prevent function execution with bad config
        console.error(`Firebase Admin: Missing required environment variables for credentials: ${missing.join(', ')}. SDK initialization FAILED.`);
        throw new Error(`Firebase Admin: Missing required environment variables for credentials: ${missing.join(', ')}`);
    }

    // Initialize the app and CAPTURE the returned app instance
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: privateKey,
      }),
    });

    // Get Firestore and Auth instances from the specific app instance we just initialized
    db = app.firestore();
    auth = app.auth();

    console.log("Firebase Admin SDK initialized successfully.");

  } catch (error: any) {
    console.error("Firebase Admin: SDK initialization FAILED!", error.message);
    // Re-throw the error to ensure any code attempting to import this
    // module knows that initialization failed. This is critical for serverless
    // functions where cold starts might try to initialize.
    throw new Error(`Firebase Admin SDK initialization failed: ${error.message}`);
  }
} else {
  // If an app is already initialized (e.g., in development with hot reloading),
  // retrieve the default app instance.
  app = admin.app(); // This retrieves the [DEFAULT] app
  db = app.firestore();
  auth = app.auth();
  console.log("Firebase Admin SDK already initialized.");
}

// Export the initialized app and its services
export { app, db, auth };
