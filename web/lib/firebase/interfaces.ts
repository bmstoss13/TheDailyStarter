// Data entities

import { admin } from "./firebaseAdmin";

// Defines the structure for a user's daily quote album.
export interface DailyQuote {
    id: string;
    author?: string;
    createdAt: Date;
    quote?: string;
}

export interface QuoteAlbum {
    id: string; // PK
    uid: string; // FK to User
    album: DailyQuote[] | null
}

// Defines the core user profile data.
export interface UserProfileData {

    // Core identifiers
    uid: string;
    username: string;
    email?: string | null;    

    // Personal Info
    firstName: string;
    lastName: string;
    dob: Date;
    bio?: string;
    photoURL?: string | null;
    pronouns?: string;
    customPronouns?: string;

    // Metadata
    createdAt: Date;    

    // Social Counts
    rayCount?: number;
    followerCount?: number;
    shineCount?: number;

    // Quotes
    lastQuoteShown?: string | null;

    // Checklist
    dailyCheckList?: DailyTask[] | UserDailyTasks;
    scheduledEvents?: ScheduledEvent[] | UserScheduledTasks;
    bucketList?: BucketListItem[] | UserBucketList;

    // Gamification and Streak
    totalExperience?: number; 
    lastDailyReset?: Date;
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
    publishDate: Date; 
}

export interface Task {
    id: string;
    title: string;
    isComplete: boolean;
    createdAt: Date;
    category: Category | CategoryType | null;
    completedAt?: Date | null
    notes?: string;
    progressSteps?: Task[]
    budget?: number | null;
    points: number;
    quantity?: number;
}

export interface DailyTask extends Task {
    priority?: PriorityType;  
    uid: string;  
    isDaily: boolean; // Flag to indicate if the task should repeat daily
}

export interface UserDailyTasks {
    id: string;
    uid: string;
    dailyTasks: DailyTask[] | null;
}

export interface ScheduledEvent extends DailyTask {
    startTime: Date;
    endTime: Date | null;
}

export interface UserScheduledTasks {
    id: string;
    uid: string;
    scheduledEvents: ScheduledEvent[] | null;
}

export interface BucketListItem extends Task {
    priority: PriorityType;
    location?: string;
    targetDate?: Date | null;
}

export interface UserBucketList {
    id: string;
    uid: string;
    bucketList: BucketListItem[] | null;

}

export interface RecommendationBlueprint {
    id?: string;
    title: string;
    notes?: string;
    category: Category | CategoryType | null;
    taskType?: TaskType;
    defaultPoints?: number; 
    defaultPriority?: PriorityType;
    quantity?: string;
    timeType?: TimeType | null;
}

export interface CategoryProgress {
    category: Category | CategoryType;
    currentXP: number;
    totalXP: number;
    level: number;
}

export interface UserCategories {
    id: string;
    uid: string;
    categoryProgress: CategoryProgress[] | null;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    unlockedAt: Date;
}

export interface UserAchievements {
    id: string;
    uid: string;
    achievements: Achievement[] | null;
}

export enum Category {
    Mental, // (BLUE) Read news stories (will track if clicking on news story in app), read a book, etc. 
    Physical, // (ORANGE) Workout, go for a walk in nature, etc. 
    Social, // (RED) Get lunch with a friend or colleague, send someone an affirmation (in app), posting a shine (in app), etc.
    Mindfulness, // (VIOLET) Prayer, meditation, reflection, journaling, etc.
    Productivity, // (INDIGO) Organize your desk, complete task at work, set up checklist (in app), etc.
    Creativity, // (YELLOW) Hobbies, draw for 15 minutes, write a short story
    Financial, // (GREEN) Review budget for 10 minutes, pay a bill, set up an automatic savings plan, etc.
}

export type CategoryType = 'Mental' | 'Physical' | 'Social' | 'Mindfulness' | 'Productivity' | 'Creativity' | 'Financial';

export interface Option {
    value: CategoryType | string;
    label: string;
}

export const taskTypes = ['daily', 'schedule', 'bucket'] as const;

export type TaskType = typeof taskTypes[number];

export type TypeTask = 'daily' | 'schedule' | 'bucket'

export const priorityTypes = ['Low', 'Medium', 'High'] as const;

export type PriorityType = typeof priorityTypes[number];

export const scheduleTypes = ['Day', 'Week', 'Month'] as const;

export type ScheduleType = typeof scheduleTypes[number];

export const timeTypes = ['Minute', 'Hour', 'N/A']

export type TimeType = typeof timeTypes[number];




