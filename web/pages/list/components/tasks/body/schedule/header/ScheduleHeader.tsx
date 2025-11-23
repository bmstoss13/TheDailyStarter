import { ScheduleType } from "@/lib/firebase/interfaces";
import ScheduleTypeToggle from "./ScheduleTypeToggle";
import ScheduleDate from "./ScheduleDate";

interface ScheduleHeaderProps{
    scheduleType: ScheduleType;
    onToggleScheduleType: (scheduleType: ScheduleType) => void;
}

const ScheduleHeader = ({
    scheduleType,
    onToggleScheduleType,
}: ScheduleHeaderProps) => {
    return (
        <div className="flex w-full items-center justify-center relative">
            <ScheduleDate 
                scheduleType={scheduleType}
            />
            <ScheduleTypeToggle 
                scheduleType={scheduleType}
                onToggleScheduleType={onToggleScheduleType}
            />
        </div>
    )
}

export default ScheduleHeader;