// document objects
import firebase from "firebase/compat/app";
import { admin } from "./firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// Defines the structure for a user's daily quote album.
export interface DailyQuote {
    id?: string;
    author?: string;
    createdAt: string;
    quote?: string;
}

// Defines the core user profile data.
export interface UserProfileData {
    uid: string;
    firstName: string;
    lastName: string;
    username: string;
    dob: string;
    createdAt: Date;
    email?: string | null;
    photoURL?: string | null;
    quotesAlbum?: DailyQuote[] | null;
    lastQuoteShown?: string | null;
}

// Defines the structure for a username entry (for uniqueness checks).
export interface Username {
    uid: string;
    username: string;
    createdAt: Date;
}

// Lightweight interface for search queries.
export interface UserSearchResult {
    uid: string;
    username: string;
    photoURL?: string | null;
}

// Defines the core data for a Shine post.
export interface ShineData {
    id?: string;
    text: string;
    username: string;
    uid: string;
    createdAt: Date;
    rayCount: number;
    mediaURL?: string | null;
    userPhotoUrl?: string | null;
    commentNumber?: number;
}

// Defines a Shine post with an additional status flag for the current user.
export interface ShineDataWithRayStatus extends ShineData {
    hasRayed: boolean;
}

// Defines a simple document for a "ray" (like).
export interface RayData {
    timestamp: Date;
}

// Defines the core data for a comment or a reply.
export interface CommentOrReplyData {
    id?: string;
    uid: string;
    username: string;
    userPhotoUrl?: string | null;
    text: string;
    createdAt: FieldValue;
    rayCount: number;
}

// Defines a comment on a shine post.
export interface CommentData extends CommentOrReplyData {
    shineId: string;
}

// Defines a reply to a comment.
export interface ReplyData extends CommentOrReplyData {
    commentId: string;
}

// Defines a comment with an additional status flag for the current user.
export interface CommentDataWithRayStatus extends CommentOrReplyData {
    shineId: string;
    hasRayed: boolean;
}

// Defines a reply with an additional status flag for the current user.
export interface ReplyDataWithRayStatus extends CommentOrReplyData {
    commentId: string;
    hasRayed: boolean;
}

// Photo data for reference to a firebase storage bucket.
export interface PhotoData {
    url: string;
    fileName: string;
    uploadedBy: string;
    createdAt: admin.firestore.FieldValue;
}

export interface CurrentUserModalData {
    uid: string;
    displayName: string | null;
}
