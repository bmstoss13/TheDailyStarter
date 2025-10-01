import { ScheduleType } from "@/lib/firebase/interfaces";
import { useState } from "react";
import WeekContainer from "./week/WeekContainer";
import DayContainer from "./day/DayContainer";
import ScheduleHeader from "./header/ScheduleHeader";

interface ScheduleProps{
}

const Schedule = ({
}: ScheduleProps) => {
    const [scheduleType, setScheduleType] = useState<ScheduleType>("Week");

    const handleScheduleTypeChange = (type: ScheduleType) => {
        try{
            setScheduleType(type)
            console.log("schedule type: ", type)
        } catch (err) {
            console.error(`error while toggling schedule type change to ${type}: `, err)
        }
    }

    return(
        <div className="flex flex-col h-full items-center">
            <ScheduleHeader 
                onToggleScheduleType={handleScheduleTypeChange}
                scheduleType={scheduleType} 
            />
            {scheduleType === "Day" && (
                <DayContainer />
            )}
            {scheduleType === "Week" && (
                <WeekContainer />
            )}
        </div>
    )
}

export default Schedule;