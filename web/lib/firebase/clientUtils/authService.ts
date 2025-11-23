import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  signOut
} from "firebase/auth";

import { auth } from "@/lib/firebase/firebase";

//sign a user up with email and password
export async function signUpWithEmail(email: string, password: string): Promise<User> {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (err: any) {
        console.error("An error occurred while signing user up with email: " + err);
        throw new Error(err.message || 'Failed to create account.');
    }
}

//sign in user with email and password
export async function signInWithEmail(email: string, password: string): Promise<User>{
    try{
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (err: any) {
        console.error("An error occurred while signing user in with email: " + err);
        throw new Error(err.message || "Failed to sign user in.");
    }
}

//sign in user with Google Authentication
export async function signInWithGoogle(): Promise<User> {
    try{
        const provider = new GoogleAuthProvider();
        const res = await signInWithPopup(auth, provider);
        return res.user;

    } catch (err: any) {
        console.error("An error occurred while signing user in with Google Authentication: " + err);
        throw new Error(err.message || "Failed to sign user in with Google Authentication");
    } 
}

export async function signOutUser() {
    try {
        await auth.signOut();
    } catch (err){
        console.error("An error occurred while signing out: " + err);
    }
}