import { RecommendationBlueprint } from "@/lib/firebase/interfaces";

interface RecommendationItemProps{
    rec: RecommendationBlueprint;
    color: string;
}

const RecommendationItem = ({
    rec,
    color
}: RecommendationItemProps) => {

    return(
        <div
            className='flex flex-col w-full min-h-[80px] border-[2px] border-solid rounded-xl p-[10px]'
            style={{
                borderColor: color
            }}
        >
                {rec.title}

        </div>
    )
}

export default RecommendationItem;