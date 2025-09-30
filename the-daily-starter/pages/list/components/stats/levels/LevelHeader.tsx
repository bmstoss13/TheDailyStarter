/**
 * Display the user's pfp and their level
 * Display the user's xp bar
 */

import ProgressBar from "../ProgressMeter";
import LevelHeaderProfile from "./LevelHeaderProfile";
import UserLevel from "./UserLevel";

const LevelHeader = () => {
    return (
        <div className="flex flex-col gap-[6px]">
            <span className="flex flex-row w-full items-center">
                <LevelHeaderProfile/>
                <div className="ml-auto mr-auto">
                    <UserLevel level={'2'} />
                </div>

            </span>
            <ProgressBar 
                completed={5} 
                total={10} 
                color="var(--primary)"
                height="8px" 
            />

        </div>
    )
}

export default LevelHeader;