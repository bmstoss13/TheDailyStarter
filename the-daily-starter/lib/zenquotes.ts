//daily quote fetched from zenquotes api

export async function fetchDailyQuote() {
    try{
        const res = await fetch("https://zenquotes.io/api/today");
        if (!res.ok) throw new Error("Failed to fetch quote");
        const data = await res.json()
        return { q: data[0].q, a: data[0].a }; //{ quote, author }
    } catch (err) {
        console.error("Error fetching daily quote: ", err);
    }

}