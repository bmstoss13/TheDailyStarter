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
    rayCount?: number;
    bio?: string;
    pronouns?: string;
    customPronouns?: string;
    followerCount?: string;
    shineCount?: string;

    //Checklist
    dailyCheckList?: DailyTask[];
    scheduledEvents?: ScheduledEvent[];

    //Achievements
    categoryProgress?: CategoryProgress[];
    achievements?: Achievement[];
    totalExperience?: number; 
    lastDailyReset?: string;
    streakCount?: number; // number of consecutive days the user has completed all tasks


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
    parentId: string | null;
    username: string;
    userPhotoUrl?: string | null;
    text: string;
    createdAt: Date;
    rayCount: number;
    replyCount: number;
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

// Happy message!
export interface BannerData {
    message: string;
}

// News data interface
export interface NewsData {
    id: string;
    createdAt: Date;
    title: string;
    summary?: string;
    articleText?: string;
    imageUrl?: string;
    sourceUrl: string;
    sourceCountry?: string;
    sentimentScore?: number;
    publishDate: string; 
}

export interface DailyTask {
    id: string;
    title: string;
    category: Category;
    isComplete: boolean;
    points: number; // Points awarded for completing the task
    isDaily: boolean; // Flag to indicate if the task should repeat daily
    createdAt: Date;
    completedAt?: Date | null
}

export interface ScheduledEvent {
    id: string;
    title: string;
    category: Category;
    points: number;
    startTime: Date;
    endTime?: Date | null;
}

export interface CategoryProgress {
    id: string;
    category: Category;
    xp: number;
    level: number;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    unlockedAt: Date;
}

enum Category {
    Mental, // (BLUE) Read news stories (will track if clicking on news story in app), read a book, etc. 
    Physical, // (ORANGE) Workout, go for a walk in nature, etc. 
    Social, // (RED) Get lunch with a friend or colleague, send someone an affirmation (in app), posting a shine (in app), etc.
    Mindfulness, // (VIOLET) Prayer, meditation, reflection, journaling, etc.
    Productivity, // (INDIGO) Organize your desk, complete task at work, set up checklist (in app), etc.
    Creativity, // (YELLOW) Hobbies, draw for 15 minutes, write a short story
    Financial, // (GREEN) Review budget for 10 minutes, pay a bill, set up an automatic savings plan, etc.
}

