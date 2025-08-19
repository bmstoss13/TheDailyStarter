import { NextApiRequest, NextApiResponse } from "next";
import { deleteUserProfileAndUsername } from "@/lib/firebase/adminUtils/firebaseUserService";
import { admin } from "@/lib/firebase/firebaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse){

    if(req.method !== 'DELETE'){
        res.status(405).json({ message: "Method Not Allowed." })
    }

    try{
        const authHeader = req.headers.authorization;
        if(!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({ message: "Unauthorized." });
        };

        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        const requesterUid = decodedToken.uid;
        const isAdmin = decodedToken.admin === true;

        const { uid } = req.body as { uid?: string };

        if (!uid) {
            return res.status(400).json({ error: "Missing uid" });
        }

        //Check permissions 
        if (!isAdmin && requesterUid !== uid) {
            return res.status(403).json({ error: "Permission denied" });
        }

        await deleteUserProfileAndUsername(uid);

        return res.status(200).json({ message: `User ${uid} deleted successfully` });

    } catch (err: any) {
        console.error("An error occurred while attempting to delete this account: " + err);
        return res.status(500).json({ error: err.message || "Error while deleting account" });
    }
}