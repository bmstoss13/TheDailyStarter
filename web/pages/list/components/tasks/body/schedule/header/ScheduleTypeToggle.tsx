import { ScheduleType, scheduleTypes } from "@/lib/firebase/interfaces";

interface ScheduleTypeToggleProps{
    scheduleType: ScheduleType;
    onToggleScheduleType: (scheduleType: ScheduleType) => void;
}

const ScheduleTypeToggle = ({
    scheduleType,
    onToggleScheduleType,
}: ScheduleTypeToggleProps) => {
    return(
        <div 
            className="flex text-[12px] w-[150px] items-center border-solid border-[2px] border-gray-200
            rounded-[14px] absolute right-[0px]"
        >
            {scheduleTypes.map((type) => {
                return(
                    <button 
                        key={type}
                        onClick={() => onToggleScheduleType(type)}
                        className={
                            `flex justify-center pt-[6px] pb-[6px] w-[50px] font-bold cursor-pointer
                            ${type !== "Month" && 'border-r-[2px] border-r-gray-200 border-solid'}
                            ${type === scheduleType ? 'text-white bg-[var(--primary)]' : 'text-[var(--iconColor)] hover:bg-[var(--primaryBg)]'}
                            ${type === "Day" && 'rounded-bl-[12px] rounded-tl-[12px]'}
                            ${type === "Month" && 'rounded-br-[12px] rounded-tr-[12px]'}
                            transition-all duration-[0.1s] ease`
                        }
                    >
                        {type}
                    </button>
                )
            })}
        </div>
    )
}

export default ScheduleTypeToggle;