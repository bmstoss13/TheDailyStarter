import { ScheduleType } from "@/lib/firebase/interfaces";
import { useState } from "react";
import DateToggler from "./DateToggler";

// This week helper
const getWeekRange = (offset: number = 0) => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6

    // Calculate Monday of the current week
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) + offset * 7);

    // Calculate Sunday of the same week
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const format = (date: Date) =>
        date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });

    return `${format(monday)} - ${format(sunday)}`;     
}

const getDay = (curr: number = 0) => {
    const today = new Date();

    const currDay = new Date(today);
    currDay.setDate(today.getDate() + curr)

    const adjustedDay = currDay.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
    })

    const dayName = currDay.toLocaleDateString('en-US', {
        weekday: 'short'
    })

    return `${dayName}, ${adjustedDay}`
}

const getMonth = (monthOffset: number = 0, yearOffset: number = 0) => {
    const today = new Date();
    const baseMonth = today.getMonth() + monthOffset;
    const baseYear = today.getFullYear() + yearOffset;

    const date = new Date(baseYear, baseMonth);
    return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    })
}

interface ScheduleDateProps{
    scheduleType: ScheduleType;
}

const ScheduleDate = ({
    scheduleType
}: ScheduleDateProps) => {
    const [weekOffset, setWeekOffset] = useState<number>(0);
    const [dayOffset, setDayOffset] = useState<number>(0);
    const [monthOffset, setMonthOffset] = useState<number>(0);
    const [yearOffset, setYearOffset] = useState<number>(0);
    
    // Today's date (Format: Mon DD)
    const today = getDay(dayOffset);

    // This week starting Monday and ending Sunday (Mon DD - Mon DD)
    const weekRange = getWeekRange(weekOffset);

    // This month (Month)
    const month = getMonth(monthOffset, yearOffset)

    return (
        <div className={`flex h-[28px]`}>
            {scheduleType === "Day" && (
                <DateToggler 
                    date={today} 
                    onPrev={() => setDayOffset((prev) => prev - 1)}
                    onNext={() => setDayOffset((prev) => prev + 1)}
                />
            )}
            {scheduleType === "Week" && (
                <DateToggler 
                    date={weekRange} 
                    onPrev={() => setWeekOffset((prev) => prev - 1)}
                    onNext={() => setWeekOffset((prev) => prev + 1)}
                />

            )}
            {scheduleType === "Month" && (
                <DateToggler 
                    date={month} 
                    onPrev={() => setMonthOffset((prev) => prev - 1)}
                    onNext={() => setMonthOffset((prev) => prev + 1)}
                />
            )}
        </div>
    )
}

export default ScheduleDate;