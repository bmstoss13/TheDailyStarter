import { NewsData } from "@/lib/firebase/interfaces";
import React from "react";

interface DailyNewsItemProps{
    newsItem: NewsData;
};

const DailyNewsItem = ({newsItem}: DailyNewsItemProps) => {
    
    return (
        <div className="w-full transition-all hover:text-(--primary)">
            <a
                href={newsItem.sourceUrl}
                target="_blank"
            >
                <div className="flex flex-col gap-[4px]">
                    <p>{newsItem.title}</p>
                    <p
                        className="text-xs text-[gray]"
                    >{newsItem.publishDate.replaceAll('T', ' at ').replaceAll('Z', '')}</p>
                </div>

            </a>
            
        </div>
    )
}

export default DailyNewsItem;