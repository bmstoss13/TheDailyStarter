import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseAdmin"; 
import { fetchDailyQuote } from "@/lib/zenquotes";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Check that the request method is GET
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const today = new Date().toISOString().split("T")[0]; // get today's date

    try {

        const ref = db.collection("dailyQuotes").doc(today);

        const snapshot = await ref.get();


        // Check if the daily quote already exists for today in the db.
        if (snapshot.exists) {
            return res.status(200).json(snapshot.data());
        }

        // Call the ZenQuotes API to fetch a new quote.
        const quote = await fetchDailyQuote();

        await ref.set({ ...quote, date: today });

        return res.status(200).json(quote);
    } catch (err) {
        console.error("Error getting daily quote at api endpoint, " + err);
        return res.status(500).json({ error: "Failed to fetch daily quote" });
    }
}
