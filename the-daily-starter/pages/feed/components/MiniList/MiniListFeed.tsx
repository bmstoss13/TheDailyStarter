import { UserProfileData } from "@/lib/firebase/interfaces";
import MiniListDailyTask from "./MiniListDailyItem";

interface MiniListFeedProps{
    userProfile: UserProfileData;
}

const MiniListFeed = ({userProfile}: MiniListFeedProps) => {

    return(
        <div>
                {userProfile.dailyCheckList ? (
                    <div>
                        {userProfile.dailyCheckList.map((item) => {
                            return(
                                <div>
                                    <MiniListDailyTask dailyTask={item} />
                                </div>
                            )
                        })}

                    </div>
                ) : (
                    <div className="flex flex-col">
                        <button
                            className="rounded-xl border-[2px] border-(--iconColor) border-dashed p-4 text-(--iconColor) text-[18px]"
                        >
                            <p>
                                + Start Your Day!
                            </p>
                        </button>
                    </div>

                )}
        </div>
    )
};

export default MiniListFeed;