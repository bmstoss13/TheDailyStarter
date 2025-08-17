import { Timestamp } from "firebase/firestore";

/*
affirmations: {
    id: string,
    userId: string,
    message: string,
    public: boolean,
    createdAt: timestamp
}
*/
export type Affirmation = {
    id: string;
    userId: string;
    message: string;
    public: boolean;
    createdAt: Timestamp;
}