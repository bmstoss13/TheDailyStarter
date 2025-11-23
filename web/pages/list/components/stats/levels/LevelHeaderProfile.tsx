/**
 * Level Header Profile picture
 */

import Image from "next/image";

interface LevelHeaderProfileProps{
    profilePicture: string
}

const LevelHeaderProfile = ({
    profilePicture
}: LevelHeaderProfileProps) => {
    return (
        <Image 
            src={profilePicture !== "" ? profilePicture : "/logo3.png"} 
            alt="profile picture"
            width={100}
            height={100}
            className="border-solid border-[1px] border-gray-300 rounded-[100%]"
            priority={true}
        />
    )
};

export default LevelHeaderProfile;