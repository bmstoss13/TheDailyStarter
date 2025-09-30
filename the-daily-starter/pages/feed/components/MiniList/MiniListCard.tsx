import { DailyTask, NewsData, ScheduledEvent, UserProfileData } from '@/lib/firebase/interfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList } from '@fortawesome/free-solid-svg-icons/faList';
import MiniListFeed from './MiniListFeed';

interface MiniListCardProps{
    userProfile: UserProfileData;
}

const MiniListCard = ({userProfile}: MiniListCardProps) => {

    return(
        <div 
            className="container w-full pl-[16px] pr-[16px] pb-[16px] flex flex-col items-center
            bg-white rounded-xl border-[1px] border-gray-200 border-solid shadow-md"
        >
            <div className="w-full flex flex-col p-4 border-b-[1px] border-gray-200 items-center justify-center">
                <span className="flex flex-row items-center justify-center gap-[6px]">
                    <FontAwesomeIcon 
                        icon={faList}
                        className="text-[24px] text-(--primary)"
                    />
                    <h1
                        className="text-[24px]"

                    >
                        My Tasks
                    </h1>
                </span>

            </div>

            <div className="flex flex-col w-full mt-4 gap-4 h-[500px]">
                <MiniListFeed userProfile={userProfile} />
            </div>
        </div>
    )
};

export default MiniListCard;