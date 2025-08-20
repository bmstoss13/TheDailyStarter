import { NextApiRequest, NextApiResponse } from "next";
import { getAllUserProfiles } from "@/lib/firebase/adminUtils/userService";

//fetch all profiles from firebase.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if(req.method !== 'GET'){
        return res.status(405).json({ message: "Method Not Allowed." });
    }

    try{
        const userProfiles = await getAllUserProfiles();
        return res.status(200).json(userProfiles);

    } catch (err) {
        console.error("An error occurred while fetching all user profile data", err);
        return res.status(500).json({ error: "Failed to fetch all user profile data" });
    }
}