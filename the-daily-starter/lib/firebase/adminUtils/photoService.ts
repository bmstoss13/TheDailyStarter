import { storage, db, admin } from "../firebaseAdmin";
import { photoCollection } from "../collectionNames";
import { PhotoData } from "../interfaces";
import { photoBucket } from "../storage/bucketNames";

//helper for getting the project id
function getProjectId(){
    const projectId = admin.app().options.projectId;
    if(typeof projectId !== 'string') {
        return '';
    }
    return projectId;
}

// uploads a photo file to firebase storage and stores metadata in firestore.
export async function uploadAndStorePhoto(uid: string, file: File): Promise<PhotoData | null> {
    try{
        const photoRef = storage.bucket().file(photoBucket(uid, file));

        const uploadResult = await photoRef.save(Buffer.from(await file.arrayBuffer()), {
            metadata: {
                contentType: file.type,
            },
        });

        console.log(`Successfully uploaded photo: ${uploadResult}`);

        const [url] = await photoRef.getSignedUrl({
            action: 'read',
            expires: '11/12/3002',
        });

        console.log(`Download URL generated: ${url}`);

        const photoData: PhotoData = {
            url: url,
            fileName: file.name,
            uploadedBy: uid,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await db.collection(`artifacts`).doc(getProjectId()).collection("users").doc(uid).collection(photoCollection).add(photoData);
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