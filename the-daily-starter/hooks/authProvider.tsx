"use client";

import { createContext, useContext } from 'react';
import { User } from 'firebase/auth';
import { useAuth } from './useAuth';

// Define the shape of the context value
interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: Error | null;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Use your existing useAuth hook
    const { user, loading, error } = useAuth();

    return (
        <AuthContext.Provider value={{ user, loading, error }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use the context
export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};