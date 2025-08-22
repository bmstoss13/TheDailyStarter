//a list of all of the firebase collections

/* User profile data, displays user name, first name, last name, DOB, etc.*/
export const userCollection = "users";

//usernames of users for easy username lookup.
export const usernameCollection = "username";

//daily quotes - might be trashed later.
export const quotesCollection = "quotes";

//wins of the day, posted as shines - added to feeds.
export const shineCollection = "shines";

//rays, functioning as likes, are a subcollection of shines.
export const raySubcollection = "rays";

//reference collection to firebase storage bucket.
export const photoCollection = "photos";

//collection of comments under shine
export const commentSubcollection = "comments";