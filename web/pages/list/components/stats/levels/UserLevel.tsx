/**
 * Display the current level of the user
 */

interface UserLevelProps{
    level: string;
}

const UserLevel = ({level}: UserLevelProps) => {
    return(
        <div>
            <span className="flex flex-row gap-[6px] text-[36px] font-bold">
                <h1>
                    LV
                </h1>
                <h1 className="text-(--primary)">
                    {level}
                </h1>
            </span>
        </div>
    )
};

export default UserLevel;