import { db } from "@/lib/firebase/firebaseAdmin";
import { DailyQuote } from "../firebaseInterfaces";
import { fetchDailyQuote } from "@/lib/zenquotes";

// Collections
const quotesCollection = 'dailyQuotes';

// get helper for all daily quotes
export async function getAllDailyQuotes(): Promise<DailyQuote[]> {

    try{
        const ref = db.collection(quotesCollection);
        const snapshot = await ref.get();
        if(snapshot.empty){
            console.log("No documents found in the " + quotesCollection + " document.");
            return [];
        }

        const quotes: DailyQuote[] = [];
        snapshot.forEach(doc => {
            quotes.push({
                id: doc.id, 
                ...doc.data() as DailyQuote,
            });
        });

        return quotes;

    } catch (err) {
        console.error('Error fetching quotes from firebase collection: ' + err);
        throw new Error("Failed to fetch daily quotes.");
    }

}

//get from firebase or create new daily quote to store in firebase
export async function getOrCreateDailyQuoteForToday(): Promise<DailyQuote> {

    const today = new Date().toISOString().split('T')[0];
    const ref = db.collection(quotesCollection).doc(today);

    try{

        const snapshot = await ref.get();

        if(snapshot.exists){
            console.log("Daily quote already added in database.")
            return snapshot.data() as DailyQuote;
        }
        
        console.log(`Daily quote not found for ${today}. Fetching from api.`)
        const newDailyQuoteFromApi = await fetchDailyQuote();

        const quoteToStore: DailyQuote = {
            ...newDailyQuoteFromApi,
            date: today,
        };

        await ref.set(quoteToStore)

        return quoteToStore;

    } catch (err) {
        console.error('An error occurred while fetching daily quote: ' + err);
        throw new Error('Failed to fetch the daily quote for today.')
    }
}