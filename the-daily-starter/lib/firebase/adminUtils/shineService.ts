import { ShineData, RayData, ShineDataWithRayStatus, UserProfileData } from "../interfaces";
import { shineCollection, raySubcollection } from "../collectionNames";
import { getUserProfile } from "./userService";
import { db, admin } from "../firebaseAdmin";

//Function for creating a shine
export async function createShine (uid: string, text: string, mediaURL?: string): Promise<ShineData|null> {
    try{
        //get user profile from user service.
        const userProfile = await getUserProfile(uid); 
        if(!userProfile){
            console.log(`No user found for id: ${uid}.`);
            return null;
        }

        //create new shine with all parameters except id, which will be integrated when added to db.
        const newShine: Omit<ShineData, 'id'> = {
            uid: uid,
            username: userProfile.username,
            userPhotoUrl: userProfile.photoURL || null,
            text: text,
            createdAt: new Date(),     
            rayCount: 0,
            mediaURL: mediaURL || null
        }

        //Create new Shine in db
        const shineRef = await db.collection(shineCollection).add(newShine);
        console.log(`New shine, ${shineRef.id}, added by ${uid} to collection`);

        return { id:  shineRef.id, ...newShine};

    } catch (err: any) {
        console.error("An error occurred while creating shine: ", err);
        throw new Error(err.message || "Error while creating shine.");
    }
}

//Like button toggle on or off
export async function toggleRay (uid: string, shineId: string): Promise<boolean> {
    try{
        const shineRef = db.collection(shineCollection).doc(shineId);
        const rayRef = shineRef.collection(raySubcollection).doc(uid);

        return db.runTransaction(async (transaction) => {
            const shineDoc = await transaction.get(shineRef);
            const rayDoc = await transaction.get(rayRef);

            if(!shineDoc.exists){
                throw new Error("Shine post does not exist.");
            }
            let rayAdded = false;
            if(rayDoc.exists){
                transaction.delete(rayRef);
                transaction.update(shineRef, {
                    rayCount: admin.firestore.FieldValue.increment(-1)
                });
                rayAdded = false;
                console.log(`Ray removed by ${uid} from shine ${shineId}.`);
            } else {
                transaction.set(rayRef, { timestamp: new Date() } as RayData);
                transaction.update(shineRef, {
                    rayCount: admin.firestore.FieldValue.increment(1)
                });
                rayAdded = true;
                console.log(`Ray added by ${uid} from shine ${shineId}`);
            }
            return rayAdded;
        })
    } catch (err: any) {
        console.log("An error occurred while toggling ray: " + err);
        throw new Error(err.message || "Error toggling ray."); 
    }
}

export async function getShines(limit: number = 20, startAfterShineId?: string, uid?: string): Promise<ShineDataWithRayStatus[]> {
    try {
        let query = db.collection(shineCollection)
            .orderBy('createdAt', 'desc')
            .limit(limit);
        if (startAfterShineId) {
            const startAfterDoc = await db.collection(shineCollection).doc(startAfterShineId).get();
            if(startAfterDoc.exists){
                query = query.startAfter(startAfterDoc);
            } else {
                console.warn(`Backend: startAfterShineId ${startAfterShineId} not found. Fetching from the beginning`);
            }
        }

        const snapshot = await query.get();

        const shinesWithStatus = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const shine = {
                    id: doc.id,
                    ...doc.data() as ShineData,
                }
                let hasRayed = false;
                let userRef = null;
                if(uid) {
                    hasRayed = await hasUserRayedShine( uid, shine.id );
                    userRef = await getUserProfile(shine.uid);
                    shine.userPhotoUrl = userRef?.photoURL;
                }
                return { ...shine, hasRayed}
            })
        )
        console.log(`Fetched ${shinesWithStatus.length} shines.`);
        return shinesWithStatus;
    } catch (err: any){
        console.error("An error occurred while fetching shines: " + err);
        throw new Error(err.message || 'Error while getting shines.');
    }
}

//Check if user has placed a ray on the shine through subcollection of shine.
export async function hasUserRayedShine(uid: string, shineId: string): Promise<boolean>{
    try{
        const rayRef = db.collection(shineCollection).doc(shineId).collection(raySubcollection).doc(uid);
        const rayDoc = await rayRef.get();
        return rayDoc.exists;
    } catch (err: any) {
        console.error(`An error occurred while checking if user ${uid} rayed shine ${shineId}: `, err);
        throw new Error(err.message || "Error while checking user rayed the shine.");
    }
}
