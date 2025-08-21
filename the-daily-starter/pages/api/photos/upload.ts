// /api/photos/upload

import { NextApiRequest, NextApiResponse } from "next";
import { uploadAndStorePhoto } from "@/lib/firebase/adminUtils/photoService";
import { Formidable } from 'formidable';
import fs from 'fs';
import path from "path";
import { corsInstance, runMiddleware } from "@/lib/authorization/helper";
import { tokenAuthorization } from "@/lib/authorization/helper";

export const config = {
    api: {
        bodyParser: false,
    },
};

const cors = corsInstance(['POST']);



// Posting photo to storage bucket and storing metadata via photoService.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    runMiddleware(req, res, cors);
    if(req.method !== 'POST'){
        return res.status(405).json({ message: 'Method Not Allowed.' });
    }

    try{
        const requesterUid = await tokenAuthorization(req);
        const formidable = new Formidable({
            maxFileSize: 4*1024*1024, //4mb is still very generous for photos.
            allowEmptyFiles: false,
        });

        const formResult = await new Promise<{ fields: any, files: any}>((resolve, reject) => {
            formidable.parse(req, (err, fields, files) => {
                if(err){
                    return reject(err);
                }
                resolve({ fields, files });
            })
        })
        
        const file = formResult.files.file?.[0];
        if(!file){
            return res.status(400).json({ message: "No file uploaded." });
        };
                
    } catch (err: any){
        console.error('API error for /api/photos/upload: ', err);
        return res.status(500).json({ error: err.message || 'Internal Server Error.' });
    }
}