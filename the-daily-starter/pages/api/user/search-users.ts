// /api/user/search-users

import type { NextApiRequest, NextApiResponse } from "next";
import { Username } from "@/lib/firebase/interfaces";
import { getSearchedUsersCapped } from "@/lib/firebase/adminUtils/userService";

// Fetch uids, usernames, mediaURLs
export default async function handler (req: NextApiRequest, res: NextApiResponse){
    if(req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed.' });
    }

    try{
        const query = req.query.q as string;
        console.log(query);
        if(!query){
            return res.status(200).json([]);
        }
        const searchResults = await getSearchedUsersCapped(query);
        console.log(searchResults);

        return res.status(200).json(searchResults);
        

    } catch (err: any){ 
        return res.status(500).json({ error: err.message || "Internal Server Error."})
    }
}