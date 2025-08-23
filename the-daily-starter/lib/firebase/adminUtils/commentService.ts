import { db, admin } from "../firebaseAdmin";
import { getUserProfile } from "./userService";
import { UserProfileData, CommentDataWithRayStatus, CommentOrReplyData, CommentData, ReplyData, ReplyDataWithRayStatus } from "../interfaces";
import { shineCollection, commentsSubcollection, repliesSubcollection, raySubcollection } from "../collectionNames";
import { FieldValue } from "firebase-admin/firestore";

export async function createComment(uid: string, text: string, shineId: string): Promise<CommentOrReplyData | null> {
    try{
        const userProfile = await getUserProfile(uid);
        if(!userProfile){
            console.log('No profile exists for user: ', uid);
            return null;
        }

        const shineRef = db.collection(shineCollection).doc(shineId);
        const commentsRef = shineRef.collection(commentsSubcollection);

        const newComment = await db.runTransaction(async(transaction) => {
            const shineDoc = await transaction.get(shineRef);
            if(!shineDoc.exists){
                throw new Error("Shine post does not exist.");
            }

            const newCommentData = {
                uid: uid,
                username: userProfile.username,
                userPhotoUrl: userProfile.photoURL || null,
                text: text,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                rayCount: 0,
            };

            const commentRef = commentsRef.doc();
            transaction.set(commentRef, newCommentData);

            transaction.update(shineRef, {
                commentNumber: admin.firestore.FieldValue.increment(1)
            });

            return { id: commentRef.id, ...newCommentData};
        })
        return newComment as CommentOrReplyData;

    } catch (err: any) {
        console.error('An error occurred while creating comment: ' + err);
        throw new Error (err.message || 'Error while creating comment.');
    }
}

export async function deleteComment(uid: string, shineId: string) {

}

export async function createReply(uid: string, text: string, shineId: string, commentId: string): Promise<CommentOrReplyData | null> {
    try{
        const userProfile = await getUserProfile(uid);
        if(!userProfile){
            console.log('No profile exists for: ', uid);
            return null;
        }

        const commentRef = db.collection(shineCollection).doc(shineId)
            .collection(commentsSubcollection).doc(commentId);

        const newReply = await db.runTransaction(async(transaction) => {
            const commentDoc = await transaction.get(commentRef);
            if(!commentDoc.exists) {
                throw new Error("Parent comment does not exists.");
            }

            const newReplyData = {
                uid: uid,
                username: userProfile.username,
                userPhotoUrl: userProfile.photoURL || null,
                text: text,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                rayCount: 0,
            };

            const repliesRef = commentRef.collection(repliesSubcollection);
            const replyRef = repliesRef.doc();
            transaction.set(replyRef, newReplyData);

            //Add a reply count on the document later, this would simply add 1 to said reply doc.
            
            return { id: replyRef.id, ...newReplyData };
        });

        return newReply as CommentOrReplyData;

    } catch (err: any) {
        console.error('An error occurred while creating reply: ' + err);
        throw new Error (err.message || 'Error while creating reply')
    }
}

export async function deleteReply(uid: string, shineId: string, commentId: string) {

}

export async function getCommentsForShine(shineId: string, uid?: string, limit=10, startAfterCommentId?: string): Promise<CommentDataWithRayStatus[]> {
    try{
        let commentsQuery = db.collection(shineCollection).doc(shineId)
            .collection(commentsSubcollection)
            .orderBy('rayCount', 'desc')
            .orderBy('createdAt', 'desc')
            .limit(limit);

        if(startAfterCommentId) {
            const startAfterDoc = await db.collection(shineCollection).doc(shineId)
                .collection(commentsSubcollection).doc(startAfterCommentId).get();
            if(startAfterDoc.exists) {
                commentsQuery = commentsQuery.startAfter(startAfterDoc);
            }
        }

        const snapshot = await commentsQuery.get();

        const commentsWithStatus = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const comment = { id: doc.id, ...doc.data() } as CommentOrReplyData;
                let hasRayed = false;
                if (uid) {
                    hasRayed = await hasUserRayedComment(uid, shineId, comment.id!);
                }
                return { ...comment, shineId: shineId, hasRayed };
            })
        )
        return commentsWithStatus;

    } catch (err: any) {
        console.error('An error occurred while fetching comments for shine: ' + err);
        throw new Error (err.message || 'Error while fetching comments for shine')
    }
}

export async function getRepliesForComment(shineId: string, commentId: string, uid?: string, limit=10, startAfterReplyId?: string): Promise<ReplyDataWithRayStatus[]>{
    try{
        let repliesQuery = db.collection(shineCollection).doc(shineId)
            .collection(commentsSubcollection).doc(commentId)
            .collection(repliesSubcollection)
            .orderBy('rayCount', 'desc')
            .orderBy('createdAt', 'desc')
            .limit(limit);
        
        if(startAfterReplyId) {
            const startAfterDoc = await db.collection(shineCollection).doc(shineId)
                .collection(commentsSubcollection).doc(commentId)
                .collection(repliesSubcollection).doc(startAfterReplyId).get();
            if(startAfterDoc.exists){
                repliesQuery = repliesQuery.startAfter(startAfterDoc);
            }
        }
        return [];
    } catch (err: any) {
        console.error('An error occurred while fetching replies for comment: ' + err);
        throw new Error (err.message || 'Error while fetching replies for comment');
    }
}

export async function toggleRayForComment(uid: string, shineId: string, commentId: string): Promise<boolean>{
    try{
        return false;
    } catch(err: any){
        console.error('An error occurred while toggling ray for comment: ', err);
        throw new Error (err.message || 'Error while toggling ray for comment.');
    }
}

export async function toggleRayForReply(uid: string, shineId: string, commentId: string, replyId: string): Promise<boolean>{
    try{
        return false;
    } catch(err: any){
        console.error('An error occurred while toggling ray for reply: ', err);
        throw new Error (err.message || 'Error while toggling ray for reply.');
    }
} 

export async function hasUserRayedComment(uid: string, shineId: string, commentId: string): Promise<boolean>{
    try{
        return false;
    } catch(err: any){
        console.error('An error occurred while checking if user has rayed comment: ', err);
        throw new Error (err.message || 'Error while checking if user has rayed comment.');
    }

}

export async function hasUserRayedReply(uid: string, shineId: string, commentId: string, replyId: string){
    try{
        return false;
    } catch(err: any){
        console.error('An error occurred while checking if user has rayed reply: ', err);
        throw new Error (err.message || 'Error while checking if user has rayed comment.');
    }
}