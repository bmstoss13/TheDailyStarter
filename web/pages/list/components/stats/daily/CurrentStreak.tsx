import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire } from "@fortawesome/free-solid-svg-icons";

// Pass in the streak for setting up checklist
interface CurrentStreakProps{
    streak: number
}

/**
 * Display current streak for setting up checklist
 */

const CurrentStreak = ({streak}: CurrentStreakProps) => {

    return (
        <div>
            <span className="flex flex-row font-semibold items-center">
                <h2>
                    Streak:
                </h2>

                <div
                    className="text-(--primary) ml-auto"
                >
                    {streak}
                    {streak > 0 && (
                        <FontAwesomeIcon 
                            icon={faFire}
                        />
                    )}
                </div>

            </span>
        </div>
    )
};

export default CurrentStreak;