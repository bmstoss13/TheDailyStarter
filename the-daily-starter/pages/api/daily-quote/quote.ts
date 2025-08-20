import { NextApiRequest, NextApiResponse } from "next";
import { getOrCreateDailyQuoteForToday } from "@/lib/firebase/adminUtils/quoteService";

//api endpoint for fetching today's quote from zenquotes or firebase.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const quote = await getOrCreateDailyQuoteForToday();
        return res.status(200).json(quote);
    } catch (err) {
        console.error("Error getting daily quote at api endpoint, " + err);
        return res.status(500).json({ error: "Failed to fetch daily quote" });
    }
}
