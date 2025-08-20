import { NextApiRequest, NextApiResponse } from "next";
import { getOrCreateDailyQuoteForToday } from "@/lib/firebase/adminUtils/quoteService";
import { getUserProfile } from "@/lib/firebase/adminUtils/userService";
import { db } from "@/lib/firebase/firebaseAdmin";
import { DailyQuote } from "@/lib/firebase/interfaces";
import { userCollection } from "@/lib/firebase/collectionNames";

export default async function handler (req: NextApiRequest, res: NextApiResponse) {
    if(req.method !== 'POST'){
        return res.status(405).json({ message: 'Method Not Allowed.' })
    }

    const { uid } = req.body;
    if (!uid){
        return res.status(400).json({ message: "Unauthorized access. User ID required." })
    }
    try{
        const userData = await getUserProfile(uid);
        const today = new Date().toISOString().split('T')[0];
        let dailyQuote: DailyQuote | null = null;
        let isNewQuote = false;

        if(userData){

            if(userData.lastQuoteShown === today) {
                console.log("User has seen quote. No new quote needs to be shown.");
                res.status(200).json({ isNewQuote: false });
            }

            dailyQuote = await getOrCreateDailyQuoteForToday();

            const userDocRef = db.collection(userCollection).doc(uid);
            await userDocRef.set(
                { lastQuoteShown: today },
                { merge: true }
            );

            isNewQuote = true;
            res.status(200).json({ dailyQuote, isNewQuote });

        }
    } catch (err: any){
        console.error("An API error occurred for /api/login-flow: ", err);
        return res.status(500).json({ error: err.message || "Internal Server Error."})
    }
}