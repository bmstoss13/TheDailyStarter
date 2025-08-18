import { UserProfileData, Username } from "../firebaseInterfaces";
import { db } from "../firebaseAdmin";

const userCollection = "users";
const usernameCollection = "username"

export async function getUserProfile(uid: string): Promise<UserProfileData | null> {
    try{
        const ref = db.collection(userCollection).doc(uid);
        const snapshot = await ref.get();
        if(snapshot.exists){
            return { uid: snapshot.id, ...snapshot.data() } as UserProfileData;
        }
        return null;
    } catch (err: any) {
        console.error("An error occurred while trying to fetch user information: " + err);
        throw new Error(err.message || "User not found.");
    }
}

export async function createProfileWithUsernameCheck(
    uid: string,
    profileData: {
        firstName: string;
        lastName: string;
        dob: string;
        username: string;
        email?: string | null;
        displayName?: string | null;
        photoURL?: string | null;
    }
): Promise<UserProfileData> {
    const ref = db.collection(userCollection).doc(uid);
    const usernameRef = db.collection(usernameCollection).doc(profileData.username.toLowerCase());
    return db.runTransaction(async (transaction) => {

        //Check if the username exists.
        const usernameDoc = await transaction.get(usernameRef);
        if (usernameDoc.exists) {
            throw new Error("Username already taken. Please choose a different one.");
        }

        //Check if the uid is already in use. Don't want to overwrite accounts.
        const userDoc = await transaction.get(ref);
        if (userDoc.exists) {
            throw new Error("User profile already exists for this id. Cannot create new one.")
        }

        //Create user's main profile document.
        const newProfileData: UserProfileData = {
            uid: uid,
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            dob: profileData.dob,
            username: profileData.username,
            email: profileData.email || null,
            displayName: profileData.displayName || null,
            photoURL: profileData.photoURL || null,
            createdAt: new Date(),
        };
        transaction.set(ref, newProfileData); //add to 'users' or whatever the user collection is called.

        const newUsername: Username = {
            uid: uid,
            username: profileData.username,
            createdAt: new Date(),
        };

        transaction.set(usernameRef, newUsername);
        
        console.log(`Backend: Transaction successful for ${uid}. Profile and username created.`);
        return newProfileData;
    }).catch(err => {
        console.error("An error occurred during user profile creation: ", err);
        if(err.includes("Username already taken.")){
            throw err;
        }
        throw new Error ("Failed to create user profile due to a backend error.")
    })
}

export async function updateUserProfile(
    uid: string,
    updates: Partial<Omit<UserProfileData, 'uid' | 'createdAt' | 'email' | 'username'>> 
): Promise<void> {
    try {
        const ref = db.collection(userCollection).doc(uid);
        await ref.update(updates);
        console.log(`User profile for ${uid} updated with: ` + updates);
    } catch (err: any) {
        console.error("An error occurred while updating user profile: " + err);
        throw new Error(err.message || "Error updating profile");
    }
}
