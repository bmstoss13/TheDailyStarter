import { storage, db, admin } from "../firebaseAdmin";
import { photoCollection } from "../collectionNames";
import { PhotoData } from "../interfaces";
import { photoBucket } from "../storage/bucketNames";

/*function to upload (POST) photo and store in firebase storage.
Should take in the uid and the file to be uploaded. 
return the photo data (metadata)
*/

// uploads a photo file to firebase storage and stores metadata in firestore.
export async function uploadAndStorePhoto(uid: string, file: File): Promise<PhotoData | null> {
    try{
        const photoRef = storage.bucket().file(photoBucket(uid, file));

        const uploadResult = await photoRef.save(Buffer.from(await file.arrayBuffer()), {
            metadata: {
                contentType: file.type,
            },
        });

        console.log(`Successfully uploaded photo`);
        return null;
    } catch (err: any) {
        console.error("An error occurred while uploading photo: ", err);
        throw new Error(err.message || "Error uploading photo.");
    }
}