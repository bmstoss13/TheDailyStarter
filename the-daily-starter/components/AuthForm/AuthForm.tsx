"use client";

import { useState } from "react";
import { updateProfile, User as FirebaseAuthUser } from "firebase/auth"; 
import { auth } from "@/lib/firebase/firebase";
import { signUpWithEmail, signInWithEmail, signInWithGoogle } from "@/lib/firebase/clientUtils/authService";

import styles from "./AuthForm.module.css";

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
    const [invalidFields, setInvalidFields] = useState<string[]>([]);
    const [step, setStep] = useState(1);

    const nextStep = () => setStep((s) => s + 1);
    const prevStep = () => setStep((s) => s - 1);

    // Helper to map api and auth errors to user friendly messages
    const handleAuthError = (err: any) => {
        console.error("Auth process error:", err); 
        
        // This is a new variable to determine if we should navigate back
        let shouldNavigateBack = false;

        if (err.code) { 
            switch (err.code) {
                case "auth/email-already-in-use":
                    setError("This email is already registered. Please sign in or use a different email.");
                    shouldNavigateBack = true;
                    break;
                case "auth/invalid-email":
                    setError("Please enter a valid email address.");
                    shouldNavigateBack = true;
                    break;
                case "auth/weak-password":
                    setError("Password is too weak. Please use at least 6 characters.");
                    shouldNavigateBack = true;
                    break;
                case "auth/user-not-found":
                case "auth/wrong-password":
                    setError("Invalid email or password.");
                    // No need to navigate back for login, as it's a single step
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
                shouldNavigateBack = true;
            } else if (err.message.includes("Missing required profile data")) {
                setError(err.message);
                shouldNavigateBack = true;
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        } else { 
            setError("An unexpected error occurred. Please try again.");
        }
        
        // If it's a signup error related to step 1, navigate back
        if (!isLogin && shouldNavigateBack) {
            setStep(1);
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
            // onSubmit();
            resetForm();

        } catch (err: any) {
            handleAuthError(err); 
        } finally {
        setIsLoading(false);
        }
    }

    //clear form fields after successful sign-in/signup
    const resetForm = () => {
        setStep(1);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setFirstName("");
        setLastName("");
        setDob("");
        setUsername("");
        setFile(null);
    };

    const validateStep = () => {
        let missing: string[] = [];

        if (step === 1) {
            if (!email) missing.push("email");
            if (!password) missing.push("password");
            if (!confirmPassword) missing.push("confirmPassword");
            if (password && confirmPassword && password !== confirmPassword){
                missing.push("password", "confirmPassword");
            }
        }
        if (step === 2) {
            if (!firstName) missing.push("firstName");
            if (!lastName) missing.push("lastName");
            if (!dob) missing.push("dob");
        }
        if (step === 3) {
            if (!username) missing.push("username");
        }

        setInvalidFields([]);
        requestAnimationFrame(() => setInvalidFields(missing));

        return missing.length === 0;
    };


    const handleNext = () => {
        if (validateStep()) {
            nextStep();
        }
    };

        //AI generated form. 
    return (
        <form onSubmit={handleSubmit} className={styles.authForm}>
            <h2 className={styles.formHeader}>
                {isLogin ? "Rise and Shine!" : "Create Account"}
            </h2>

            {isLogin ? (
                <>
                    {/* Login fields */}
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
                </>
            ) : (
                <>
                {/* Signup flow */}
                {step === 1 && (
                    <>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={invalidFields.includes("email") ? styles.inputError : ""}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={invalidFields.includes("password") ? styles.inputError : ""}
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={invalidFields.includes("confirmPassword") ? styles.inputError : ""}
                        />
                        {password && confirmPassword && password !== confirmPassword && (
                            <p className={styles.error}>Passwords don't match.</p>
                        )}
                    </>
                )}

                {step === 2 && (
                    <>
                        <input
                            type="text"
                            placeholder="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className={invalidFields.includes("firstName") ? styles.inputError : ""}
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className={invalidFields.includes("lastName") ? styles.inputError : ""}
                        />
                        <input
                            type="date"
                            placeholder="Date of Birth"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className={invalidFields.includes("dob") ? styles.inputError : ""}
                        />
                    </>
                )}

                {step === 3 && (
                    <>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={invalidFields.includes("username") ? styles.inputError : ""}
                        />
                        <label className={styles.fileInputLabel}>
                            {file ? `Selected: ${file.name}` : "Choose Profile Photo"}
                            <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                            className={styles.fileInput}
                            />
                        </label>
                    </>
                )}
                </>
            )}

            {error && <p className={styles.error}>{error}</p>}

            {/* Navigation buttons */}
            {!isLogin && (
                <div className={styles.signupControlsWrapper}>
                    <div className={styles.progressDots}>
                        <span className={step === 1 ? styles.active : ""}></span>
                        <span className={step === 2 ? styles.active : ""}></span>
                        <span className={step === 3 ? styles.active : ""}></span>
                    </div>
                    <div className={styles.stepControls}>
                    {step > 1 && (
                        <button type="button" onClick={prevStep}>
                            Back
                        </button>
                    )}
                    {step < 3 ? (
                        <button type="button" onClick={handleNext}>
                            Next
                        </button>
                    ) : (
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? "Creating Account..." : "Sign Up"}
                        </button>
                    )}
                    </div>
                </div>
            )}

            {/* Login / Google Buttons */}
            {isLogin && (
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Signing In..." : "Sign In"}
                </button>
            )}
            
            <div className={styles.socialAuth}>
                <button type="button" onClick={handleGoogleSignIn} disabled={isLoading}>
                    {isLoading ? "Loading Google..." : "Sign in with Google"}
                </button>
            </div>

            <div>
                <p
                onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                    resetForm();
                }}
                className={styles.toggleMode}
                >
                {isLogin ? "Don't have an account? Create one!" : "Have an account? Sign in!"}
                </p>
            </div>
        </form>

    );
}