/*
wins: {
    id: string,
    userId: string,
    message: string,
    public: boolean,
    createdAt: timestamp
}
*/

import { Timestamp } from "firebase/firestore";

export type Win = {
    id: string;
    userId: string;
    message: string;
    public: boolean;
    createdAt: Timestamp;
}