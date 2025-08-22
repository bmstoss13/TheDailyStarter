import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "firebase-admin/auth";
import { app } from "@/lib/firebase/firebaseAdmin";
import { createUserProfile as createProfileService } from '@/lib/firebase/adminUtils/userService';
import { corsInstance, runMiddleware } from "@/lib/authorization/helper";
import { Formidable } from 'formidable';
import fs from 'fs';
import { uploadAndStorePhoto } from "@/lib/firebase/adminUtils/photoService";

export const config = {
    api: {
        bodyParser: false,
    },
};

const cors = corsInstance(['POST', 'OPTIONS']);

// Creating profile with authorization.
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
        console.log("autorized!");
        
        const formidable = new Formidable();
        const { fields, files } = await new Promise<{ fields: any, files: any }>((resolve, reject) => {
            formidable.parse(req, (err, fields, files) => {
                if (err) {
                    return reject(err);
                }
                resolve({ fields, files });
            });
        });

        const firstName = fields.firstName?.[0];
        const lastName = fields.lastName?.[0];
        const dob = fields.dob?.[0];
        const username = fields.username?.[0];

        if (!firstName || !lastName || !dob || !username) {
            return res.status(400).json({ error: 'Missing required profile data.' });
        }

        const file = files.file?.[0];
        console.log('file: ' + file);
        let photoData = null;
        
        if (file) {
            try {

                const fileContent = fs.readFileSync(file.filepath);
                console.log('File Content: ', fileContent);
                console.log('at filepath: ' + file.filepath);
                photoData = await uploadAndStorePhoto(uid, fileContent, file.originalFilename || 'unnamed-file', file.mimetype || 'application/octet-stream');
                console.log('Photo data: ' + photoData);

            } catch (uploadErr) {
                console.error("Error during photo upload: ", uploadErr);
                // Return an error without creating the profile if the photo upload fails
                return res.status(500).json({ error: "Failed to upload profile photo." });
            }
        }
        
        const newProfile = await createProfileService(uid, {
            firstName,
            lastName,
            dob,
            username,
            email,
            photoURL: photoData?.url || null, // Pass the photoURL if it exists
        });
        
        // Return both the profile and photo data in the response
        return res.status(200).json({ success: true, profile: newProfile, photoData });
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
