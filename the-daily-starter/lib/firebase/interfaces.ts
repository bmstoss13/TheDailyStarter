// document objects
import firebase from "firebase/compat/app";
import { admin } from "./firebaseAdmin";

export interface DailyQuote {
    id?: string;
    a?: string;
    date: string;
    q?: string;
}

export interface UserProfileData {
    uid: string;
    firstName: string;
    lastName: string;
    username: string;
    dob: string;
    createdAt: Date;
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;  
    quotesAlbum?: DailyQuote[] | null; 
    lastQuoteShown?: string | null; //store date of last quote shown. 
}

export interface Username {
    uid: string;
    username: string;
    createdAt: Date;
}

//lightweight interface for search queries
export interface UserSearchResult {
    uid: string;
    username: string;
    photoURL?: string | null;
}

export interface ShineData {
    id?: string;
    text: string;
    username: string;
    uid: string;
    createdAt: Date;
    rayCount: number;
    mediaURL?: string | null; //photo or video associated with the post
    userPhotoUrl?: string | null;
}

export interface ShineDataWithRayStatus extends ShineData {
    hasRayed: boolean;
}

export interface RayData {
    timestamp: Date;
}

//photo data for reference to firebase storage bucket
export interface PhotoData {
    url: string;
    fileName: string;
    uploadedBy: string;
    createdAt: admin.firestore.FieldValue; //need to refactor everything else to get accurate time snippets.
}