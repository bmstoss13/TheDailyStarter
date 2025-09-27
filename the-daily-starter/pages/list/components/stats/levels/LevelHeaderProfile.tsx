/**
 * Level Header Profile picture
 */

import Image from "next/image";

interface LevelHeaderProfileProps{
    profilePicture: string
}

const LevelHeaderProfile = () => {
    return (
        <Image 
            src="/logo3.png" 
            alt="profile picture"
            width={100}
            height={100}
            className="border-solid border-[1px] border-gray rounded-[100%]"
        />
    )
};

export default LevelHeaderProfile;