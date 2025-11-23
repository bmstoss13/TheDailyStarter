import { UserProfileData } from "@/lib/firebase/interfaces";
import MiniListDailyTask from "./MiniListDailyItem";

interface MiniListFeedProps{
    userProfile: UserProfileData;
}

const MiniListFeed = ({userProfile}: MiniListFeedProps) => {

    return(
        <div className='w-full'>
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
                    <div className="flex flex-col w-full">
                        <button
                            className="rounded-xl border-[2px] border-gray-200 border-dashed w-full h-[80px] text-gray-400 text-[18px]
                            cursor-pointer"
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