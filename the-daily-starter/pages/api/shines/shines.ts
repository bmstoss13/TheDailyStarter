import type { NextApiRequest, NextApiResponse } from "next";
import { createShine, getShines } from "@/lib/firebase/adminUtils/shineService";
import { admin } from "@/lib/firebase/firebaseAdmin";
import { corsInstance, runMiddleware, tokenAuthorization } from "@/lib/authorization/helper";

//Only do GET, POST, and OPTIONS (Pretty sure this is automatically handled by cors, but never hurts)
const cors = corsInstance(['GET', 'POST', 'OPTIONS']);

//handler for getting shines (with limit) and posting shine.
export default async function handler(req: NextApiRequest, res: NextApiResponse){

    await runMiddleware(req, res, cors);
    if(req.method === 'OPTIONS'){
        return res.status(200).end();
    }
    try{
        const requesterUid = await tokenAuthorization(req);

        //get shines within query limit.
        if(req.method === 'GET'){
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
            const startAfterShineId = req.query.startAfter as string | undefined;
            const shines = await getShines(limit, startAfterShineId);
            return res.status(200).json(shines);
        
        //post new shine, requiring text.
        } else if(req.method === 'POST'){
            const { text, mediaURL } = req.body;
            if(!text) {
                return res.status(400).json({ message: "Text is required for shines."});
            }
            const createdShine = await createShine(requesterUid, text, mediaURL);
            return res.status(201).json(createdShine);

        //invalid method (not OPTIONS, GET, or POST)
        } else {
            return res.status(405).json({ message: "Method Not Allowed."});
        };

    } catch (err: any) {
        if(err.message === 'Unauthorized'){
            res.status(401).json({ message: 'Unauthorized' });
        }
        console.error("API error for api/shines/shine: ", err);
        res.status(500).json({ error: err.message || "Failed to process request."});
    }
}