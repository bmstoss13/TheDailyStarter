import { UserProfileData, Username, UserSearchResult } from "../interfaces";
import { db, admin } from "../firebaseAdmin";
import { userCollection, usernameCollection } from "../collectionNames";

//Fetch the individual user profile
export async function getUserProfile(uid: string): Promise<UserProfileData | null> {
    try{
        const ref = db.collection(userCollection).doc(uid);
        const snapshot = await ref.get();
        if(!snapshot.exists){
            console.log("Data snapshot does not exist for given uid: " + uid);
            return null;
        }
        return { uid: snapshot.id, ...snapshot.data() } as UserProfileData;
    } catch (err: any) {
        console.error("An error occurred while trying to fetch user information: " + err);
        throw new Error(err.message || "User not found.");
    }
}

//list all user profiles - useful for search
export async function getAllUserProfiles(): Promise<UserProfileData[] | null> {
    try{
        const ref = db.collection(userCollection);
        const snapshot = await ref.get();
        if(snapshot.empty){
            console.log("No users found for: ", userCollection);
            return null;
        };
        
        const allUsers: UserProfileData[] = []
        snapshot.forEach(doc => {
            allUsers.push({
                ...doc.data() as UserProfileData,
            })
        })

        return allUsers;
    } catch (err: any) {
        console.error("An error occurred while fetching all user profile data: ", err);
        throw new Error(err.message || "No users found.");
    }
}

//delete the user and username automatically given the uid.
export async function deleteUserProfileAndUsername(uid: string): Promise<void> {
    try {
        await db.runTransaction(async (transaction) => {
            const userRef = db.collection(userCollection).doc(uid);
            const userDoc = await transaction.get(userRef);

            if (!userDoc.exists) {
                console.log("No user exists for the given uid: " + uid);
                return; // nothing to delete
            }

            const userData = userDoc.data() as UserProfileData;
            const usernameRef = db.collection(usernameCollection).doc(userData.username);

            // Queue up both deletions
            transaction.delete(userRef);
            transaction.delete(usernameRef);
        });

        await admin.auth().deleteUser(uid);

        console.log(`Successfully deleted user ${uid} and their username.`);
    } catch (err: any) {
        console.error("Transaction failed while deleting user with uid: " + uid, err);
        throw new Error(err.message || "Error while deleting user profile.");
    }
}

//create username-unique user profile by checking with username store.
export async function createUserProfile(
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

// Fetches searched users from query with a cap of 10 for efficiency
export async function getSearchedUsersCapped(query: string): Promise<UserSearchResult[] | null> {
    try{
        if(!query || query.trim() === ''){
            return [];
        }

        const userRef = db.collection(userCollection);
        const snapshot = await userRef
            .where('username', '>=', query)
            .where('username', '<=', '\uf8ff')
            .limit(10) //limit for efficiency's sake
            .select('uid', 'username', 'photoURL')
            .get();

        if(snapshot.empty){
            console.log('No users found for query: ', query);
            return [];
        }

        const searchResults: UserSearchResult[] = [];
        snapshot.forEach(doc => {
            const data = doc.data() as Partial<UserSearchResult>;
            searchResults.push({
                uid: data.uid as any, //had to solve this error somehow lol.
                username: data.username as any,
                photoURL: data.photoURL,                
            })
        })
        return searchResults;
    } catch (err: any) {
        console.error(`An error occurred while fetching searched users: ${err}`);
        throw new Error(err.message || "Error searching users.");
    }

}
