import { ShineData, ShineDataWithRayStatus } from "@/lib/firebase/interfaces";

const cacheKey = process.env.SHINE_FEED_CACHE_KEY || 'shine-feed-cache';

interface ShineCache {
    data: ShineDataWithRayStatus[];
    timestamp: number;
}

//Saves shine data to the browser's sessionStorage
export const saveShineFeedToCache = (shines: ShineDataWithRayStatus[]) => {
    try {
        const cache: ShineCache = {
            data: shines,
            timestamp: Date.now()
        };
        console.log("save cache key: " + cacheKey)
        sessionStorage.setItem(cacheKey, JSON.stringify(cache));    
    } catch (err: any){
        console.error("Failed to save shine cache:", err)
    }
};

export const loadShineFeedFromCache = (): ShineDataWithRayStatus[] | null => {
    console.log("load cache key: " + cacheKey)
    const cachedData = sessionStorage.getItem(cacheKey);
    if (!cachedData){
        return null
    } 
    try{
        const cache: ShineCache = JSON.parse(cachedData);
        const staleness = 5 * 60 * 1000; //5 minutes for staleness check

        if(Date.now() - cache.timestamp > staleness) {
            sessionStorage.removeItem(cacheKey);
            return null; //return null if data is stale
        }
        return cache.data;
    } catch (err: any) {
        console.error("Failed to parse shine cache:", err);
        sessionStorage.removeItem(cacheKey);
        return null;
    }
}