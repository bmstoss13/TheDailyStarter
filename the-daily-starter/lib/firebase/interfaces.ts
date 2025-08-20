// document objects

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
}

export interface Username {
    uid: string;
    username: string;
    createdAt: Date;
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

export interface RayData {
    timestamp: Date;
}