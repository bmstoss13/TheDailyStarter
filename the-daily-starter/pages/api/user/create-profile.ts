import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "firebase-admin/auth";
import { app } from "@/lib/firebase/firebaseAdmin";
import { createUserProfile as createProfileService } from '@/lib/firebase/adminUtils/userService';
import { corsInstance, runMiddleware } from "@/lib/authorization/helper";

const cors = corsInstance(['POST', 'OPTIONS']);

//Creating profile with authorization.
export default async function handler (req: NextApiRequest, res: NextApiResponse){
    await runMiddleware(req, res, cors);
    if(req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if(req.method !== 'POST') {
        return res.status(405).json({ message: "Method Not Allowed." });
    }

    try {
        const idToken = req.headers.authorization?.split('Bearer ')[1];
        if(!idToken) {
            return res.status(401).json({ error: "Unauthorized: No token provided." });
        }
        
        let decodedToken;
        try {
            decodedToken = await getAuth(app).verifyIdToken(idToken);
        } catch (err) {
            console.error("Error verifying ID token: ", err);
            return res.status(401).json({ error: "Unauthorized: Invalid token." });
        }

        const uid = decodedToken.uid;
        const email = decodedToken.email;

        const { firstName, lastName, dob, username } = req.body;

        if (!firstName || !lastName || !dob || !username) {
            return res.status(400).json({ error: 'Missing required profile data.' });
        }

        const newProfile = await createProfileService(uid, {
            firstName,
            lastName,
            dob,
            username,
            email,
            // displayName: username,
        })
        return res.status(200).json({ success: true, profile: newProfile });
    } catch (err: any) {
        console.error("An error occurred while creating user profile via API route: " + err);

        // Map specific errors to appropriate HTTP responses
        if (err.message.includes("Username already taken")) {
            return res.status(409).json({ error: "Username is already taken. Please choose a different one." });
        }
        if (err.message.includes("User profile already exists")) {
            return res.status(409).json({ error: "A profile for this user already exists." });
        }
        return res.status(500).json({ error: "Failed to create user profile due to a server error." });
        
    }
}