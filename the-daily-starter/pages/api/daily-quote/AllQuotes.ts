import { NextApiRequest, NextApiResponse } from "next";
import { getAllDailyQuotes } from "@/lib/firebase/utils/firebaseService";
import { DailyQuote } from "@/lib/firebase/utils/firebaseInterfaces";

//api endpoint for fetching all daily quotes from firebase.
export default async function handler(req: NextApiRequest, res: NextApiResponse){

    if(req.method !== 'GET'){
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try{
        const dailyQuotes: DailyQuote[] = await getAllDailyQuotes();
        return res.status(200).json(dailyQuotes);

    } catch (err) {
        console.error('An error occurred while fetching all quotes: ' + err);
        return res.status(500).json({ error: 'Failed to fetch all quotes' });
    }
}

