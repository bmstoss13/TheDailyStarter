import { admin } from "../firebaseAdmin";

//photo for storing user uploaded photos.
export function photoBucket(uid: string, file: File) {
    return `artifacts/${admin.app().options.projectId}/users/${uid}/photos/${file.name}`;
};