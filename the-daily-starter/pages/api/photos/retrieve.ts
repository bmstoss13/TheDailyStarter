// api/photos/retrieve

import type { NextApiRequest, NextApiResponse } from "next";
import { getSinglePhotoForUser } from "@/lib/firebase/adminUtils/photoService";
import { corsInstance, runMiddleware, tokenAuthorization } from "@/lib/authorization/helper";

const cors = corsInstance(['GET']);

//GET API endpoint for retrieving a single photo
export default async function handler (req: NextApiRequest, res: NextApiResponse) {
    runMiddleware(req, res, cors);
    if(req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed.'})
    }

    try {
        const requesterUid = await tokenAuthorization(req);
        const photoData = await getSinglePhotoForUser(requesterUid);

        return res.status(200).json({ photoData });

    } catch (err: any) {
        console.error('An API endpoint error occurred at ')
        return res.status(500).json({ error: 'Internal server error.' });
    }
}