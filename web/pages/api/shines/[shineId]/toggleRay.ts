// api/shines/[shineId]/toggleRay

import type { NextApiRequest, NextApiResponse } from "next";
import { corsInstance, runMiddleware, tokenAuthorization } from "@/lib/authorization/helper";
import { toggleRay } from "@/lib/firebase/adminUtils/shineService";

const cors = corsInstance(['POST', 'OPTIONS']);

//Should toggle ray and add user to list of users who have added a ray
export default async function handler(req: NextApiRequest, res: NextApiResponse){

    await runMiddleware(req, res, cors);
    if(req.method === 'OPTIONS'){
        return res.status(200).end();
    }

    if(req.method !== 'POST'){
        return res.status(405).json({ message: "Method Not Allowed." });
    }

    try{
        const requesterUid = await tokenAuthorization(req);
        const { shineId } = req.query;

        if(!shineId || typeof shineId !== 'string'){
            return res.status(400).json({ error: 'Shine ID is required as string' });
        };

        const rayToggled = await toggleRay(requesterUid, shineId);
        return res.status(201).json(rayToggled);

    } catch (err: any) {
        if(err.message === 'Unauthorized'){
            return res.status(401).json({ message: "Unauthorized" });
        }
        console.error(`API Error for api/shines/${req.query.shineId}/toggleRay`);
        return res.status(500).json({ error: err.message || "Failed to process request" });
    }
}