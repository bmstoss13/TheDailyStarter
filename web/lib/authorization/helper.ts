import type { NextApiRequest, NextApiResponse } from "next";
import { admin } from "../firebase/firebaseAdmin";
import Cors from 'cors';

//create new instance of cors with the given methods.
export function corsInstance(methods: string[]){
    const cors = Cors({
        methods: methods,
        origin: process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : ['http://sunshine.app', 'https://the-daily-starter.firebaseapp.com'],
    });
    return cors;
}

export function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        })
    })
}

export async function tokenAuthorization(req: NextApiRequest): Promise<string> {
    const authHeader = req.headers.authorization;
    if(!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")){
        throw new Error("Unauthorized");
    }
            
    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken.uid;
}
