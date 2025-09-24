import { NewsData } from '@/lib/firebase/interfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun } from '@fortawesome/free-solid-svg-icons';
import DailyNewsItem from './DailyNewsItem';

interface DailyNewsFeedProps{
    dailyNews: NewsData[];
}
const DailyNewsFeed = ({dailyNews}: DailyNewsFeedProps) => {

    return(
        <div 
            className="container w-full pl-[16px] pr-[16px] pb-[16px] flex flex-col items-center
            bg-white rounded-xl border-[1px] border-gray-200 border-solid shadow-md"
        >
            <div className="w-full flex flex-col p-4 border-b-[1px] border-gray-200 items-center justify-center">
                <span className="flex flex-row items-center justify-center gap-[6px]">
                    <FontAwesomeIcon 
                        icon={faSun}
                        className="text-[24px] text-(--primary)"
                    />
                    <h1
                        className="text-[24px]"

                    >
                        The Daily Sunshine
                    </h1>
                </span>

            </div>

            <div className="flex flex-col mt-4 gap-4">
                {dailyNews && (
                    dailyNews.map((newsItem) => {
                        return(
                            <DailyNewsItem 
                                key={newsItem.id}
                                newsItem={newsItem}
                            />
                        )
                    })
                )}
            </div>
        </div>
    )
};

export default DailyNewsFeed;