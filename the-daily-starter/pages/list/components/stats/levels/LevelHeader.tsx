/**
 * Display the user's pfp and their level
 * Display the user's xp bar
 */

import ExperienceBar from "./ExperienceBar";
import LevelHeaderProfile from "./LevelHeaderProfile";
import UserLevel from "./UserLevel";

const LevelHeader = () => {
    return (
        <div className="flex flex-col gap-[6px]">
            <span className="flex flex-row w-full items-center">
                <LevelHeaderProfile/>
                <p className="ml-auto mr-auto">
                    <UserLevel level={'2'} />
                </p>

            </span>
            <ExperienceBar currentXP={5} levelUpXP={10} />

        </div>
    )
}

export default LevelHeader;