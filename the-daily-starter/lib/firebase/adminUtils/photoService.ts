import { storage, db, admin, app } from "../firebaseAdmin";
import { photoCollection } from "../collectionNames";
import { PhotoData } from "../interfaces";
import { photoBucket } from "../storage/bucketNames";
import { v4 as uuidv4 } from "uuid";

//helper for getting the project id
function getProjectId(){
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    if(typeof projectId !== 'string') {
        return '';
    }
    return projectId;
}

// uploads a photo file to firebase storage and stores metadata in firestore.
export async function uploadAndStorePhoto(
    uid: string, 
    fileContent: Buffer, 
    fileName: string, 
    contentType: string
): Promise<PhotoData | null> {
    try {
        const uniqueFileName = `${uuidv4()}_${fileName}`;
        const photoRef = storage.bucket().file(`users/${uid}/profile-photos/${uniqueFileName}`);

        // Upload the file to Firebase Storage
        await photoRef.save(fileContent, {
            metadata: {
                contentType: contentType,
            },
            public: true, // Make the file publicly accessible
        });

        // Get the public URL for the uploaded photo
        const url = `https://storage.googleapis.com/${photoRef.bucket.name}/${photoRef.name}`;
        
        console.log(`Successfully uploaded photo: ${url}`);

        // Create the PhotoData object to store in Firestore
        const photoData: PhotoData = {
            url: url,
            fileName: fileName,
            uploadedBy: uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // Store photo metadata in Firestore
        const docRef = await db
            .collection(`artifacts`)
            .doc(getProjectId())
            .collection("users")
            .doc(uid)
            .collection(photoCollection)
            .add(photoData);

        console.log(`Successfully stored photo metadata in Firestore with id: ${docRef.id}`);

        return photoData;

    } catch (err: any) {
        console.error("An error occurred while uploading photo: ", err);
        throw new Error(err.message || "Error uploading photo.");
    }
}

//Fetch all photo urls for a given user
export async function getPhotosForUser(uid: string): Promise<PhotoData[]> {
    try{
        const photoRef = db.collection(`artifacts`).doc(getProjectId()).collection("users").doc(uid).collection(photoCollection)
        const snapshot = await photoRef.orderBy('createdAt', 'desc').get();

        if (snapshot.empty){
            console.log('No photos found for user: ', uid);
            return [];
        }

        const orderedPhotos: PhotoData[] = [];
        snapshot.forEach(doc => {
            orderedPhotos.push({
                ...doc.data() as PhotoData,
                createdAt: doc.data().createdAt,
            });
        });

        return orderedPhotos;
    } catch (err: any){
        console.error(`An error occurred while fetching photos for user: ${uid}`);
        throw new Error(err.message || "Error while getting photos for user.");
    }
}

export async function getSinglePhotoForUser(uid: string): Promise<PhotoData|null> {
    try{
        const photoRef = db.collection("artifacts").doc(getProjectId()).collection("users").doc(uid).collection(photoCollection);
        const snapshot = await photoRef.orderBy('createdAt', 'desc').limit(1).get();

        if(snapshot.empty) {
            console.log(`No photos found for user: ${uid}`);
            return null;
        }

        const doc = snapshot.docs[0];


        return { ...doc.data() as PhotoData, createdAt: doc.data().createdAt, };
    } catch (err: any){
        console.error(`An error occurred while fetching this photo for user: ${uid}`)
        throw new Error(err.message || 'Error while fetching photo for user.')
    }
}