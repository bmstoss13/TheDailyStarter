"use client";

import { useState } from "react";
import { auth, functions } from "@/lib/firebase/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import styles from "./AuthForm.module.css";

//Auth form for when users want to join or sign in.
export default function AuthForm() {
    const [email, setEmail ] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    
    async function handleSubmit(e: React.FormEvent){
        e.preventDefault();
        try{
            if(isLogin){
                await signInWithEmailAndPassword(auth, email, password);
            }
            else{
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            console.error("Error occurred while handling submit: ", err);
        }
    }
  return (
    <form onSubmit={handleSubmit} className={styles.authForm}>
      <h2>{isLogin ? "Sign In" : "Create Account"}</h2>
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
      <button type="submit">
        {isLogin ? "Sign In" : "Sign Up"}
      </button>
      <p onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Create an account" : "Have an account? Sign in!"}
      </p>
    </form>
  );
}