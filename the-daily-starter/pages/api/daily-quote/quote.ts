
import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebase";
import { fetchDailyQuote } from "@/lib/zenquotes";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check that the request method is GET
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const today = new Date().toISOString().split("T")[0]; // get today's date

  try {
    const ref = doc(collection(db, "dailyQuotes"), today);
    const snapshot = await getDoc(ref);

    // Check if the daily quote already exists for today in the db.
    if (snapshot.exists()) {
      return res.status(200).json(snapshot.data());
    }

    // Call the ZenQuotes API to fetch a new quote.
    const quote = await fetchDailyQuote();
    
    // Save the new quote to the database.
    await setDoc(ref, { ...quote, date: today });
    
    // Return the new quote as a JSON response.
    return res.status(200).json(quote);
  } catch (err) {
    console.error("Error getting daily quote at api endpoint, " + err);
    // Return an error response.
    return res.status(500).json({ error: "Failed to fetch daily quote" });
  }
}