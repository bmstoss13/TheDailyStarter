"use client";

import { useState } from "react";
import { updateProfile, User as FirebaseAuthUser } from "firebase/auth"; 
import { auth } from "@/lib/firebase/firebase";
import { signUpWithEmail, signInWithEmail, signInWithGoogle } from "@/lib/firebase/clientUtils/authService";

import styles from "./AuthForm.module.css";

//Auth form for when users want to join or sign in.
export default function AuthForm() {
    const [email, setEmail ] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dob, setDob] = useState(""); // Date of Birth
    const [username, setUsername] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    const [file, setFile] = useState<File|null>(null);

    // Helper to map api and auth errors to user friendly messages
    const handleAuthError = (err: any) => {
        console.error("Auth process error:", err); 

        if (err.code) { 
            switch (err.code) {
                case "auth/email-already-in-use":
                    setError("This email is already registered. Please sign in or use a different email.");
                    break;
                case "auth/invalid-email":
                    setError("Please enter a valid email address.");
                    break;
                case "auth/weak-password":
                    setError("Password is too weak. Please use at least 6 characters.");
                    break;
                case "auth/user-not-found":
                case "auth/wrong-password":
                    setError("Invalid email or password.");
                    break;
                case "auth/popup-closed-by-user":
                    setError("Sign-in process cancelled.");
                    break;
                default:
                    setError("An unexpected authentication error occurred. Please try again.");
                    break;
            }
        } else if (err.message) {
            if (err.message.includes("Username is already taken")) { 
                setError(err.message);
            } else if (err.message.includes("Missing required profile data")) {
                setError(err.message);
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        } else { 
            setError("An unexpected error occurred. Please try again.");
        }
    };

    const handleGoogleSignIn = async() => {
        setError(null);
        setIsLoading(true);
        try {
            const user: FirebaseAuthUser = await signInWithGoogle();
            console.log("Google sign-in successful: ", user.uid);

            resetForm(); 
        } catch (err: any) {
            handleAuthError(err);
        } finally {
            setIsLoading(false);
        }
    }
        
    async function handleSubmit(e: React.FormEvent){
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (!isLogin) {

            if (password !== confirmPassword) {
                setError("Passwords do not match.");
                setIsLoading(false);
                return;
            }
            if (!firstName || !lastName || !dob || !username) {
                setError("Please fill in all required fields.");
                setIsLoading(false);
                return;
            }
        }
        try{
            let user: FirebaseAuthUser; 

            if(isLogin){

                user = await signInWithEmail(email, password);
                console.log("Signed in successfully:", user.uid);
            } else {
                    
                user = await signUpWithEmail(email, password);
                console.log("Firebase Auth user created:", user.uid);

                const idToken = await user.getIdToken();

                const formData = new FormData();
                formData.append('firstName', firstName);
                formData.append('lastName', lastName);
                formData.append('dob', dob);
                formData.append('username', username);

                if(file){
                    formData.append('file', file);
                    console.log(file);
                }

                console.log("form data: ", formData);

                const response = await fetch('/api/user/create-profile', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${idToken}`, 
                    },
                    body: formData,
                });

                const data = await response.json(); 

                if (!response.ok) {

                    throw new Error(data.error || 'Failed to create profile via API.');
                }

                console.log("User profile created via Next.js API Route:", data.profile);

                if (user && user.displayName !== username) {
                    await updateProfile(user, { displayName: username});
                }

                console.log("Account created and profile saved successfully!");
            }

            resetForm();

        } catch (err: any) {
            handleAuthError(err); 
        } finally {
        setIsLoading(false);
        }
    }

    //clear form fields after successful sign-in/signup
    const resetForm = () => {
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setFirstName("");
        setLastName("");
        setDob("");
        setUsername("");
        setFile(null);
    };

    //AI generated form.  
    return (
        <form onSubmit={handleSubmit} className={styles.authForm}>
            <h2>{isLogin ? "Sign In" : "Create Account"}</h2>

            {!isLogin && (
                // Show these fields only for signup mode
                <>
                <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required={!isLogin}
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required={!isLogin}
                />
                <input
                    type="date" // Use type="date" for a native date picker
                    placeholder="Date of Birth"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required={!isLogin}
                />
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={!isLogin}
                />
                <label className={styles.fileInputLabel}>
                    {file ? `Selected: ${file.name}` : "Choose Profile Photo"}
                    <input 
                        type='file'
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                        className={styles.fileInput}
                    />
                </label>
                </>
            )}

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            {!isLogin && (
                // Show confirm password only for signup mode
                <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={!isLogin}
                />
            )}

            {error && <p className={styles.error}>{error}</p>} {/* Display errors */}

            <button type="submit" disabled={isLoading}>
                {isLoading ? (isLogin ? "Signing In..." : "Creating Account...") : (isLogin ? "Sign In" : "Sign Up")}
            </button>

            <p onClick={() => { setIsLogin(!isLogin); setError(null); resetForm(); }} className={styles.toggleMode}>
                {isLogin ? "Create an account" : "Have an account? Sign in!"}
            </p>

            <div className={styles.socialAuth}>
                <button type="button" onClick={handleGoogleSignIn} disabled={isLoading}>
                {isLoading ? "Loading Google..." : "Sign in with Google"}
                </button>
            </div>
        </form>
    );
}
