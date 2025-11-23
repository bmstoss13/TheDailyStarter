import { TaskType, taskTypes } from "@/lib/firebase/interfaces";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAlarmClock, faBucket, faCalendarDay } from "@fortawesome/free-solid-svg-icons";

interface TaskHeaderProps{
    taskType: TaskType
    onSwitchType: (taskType: TaskType) => void;
}

const TaskHeader = ({taskType, onSwitchType}: TaskHeaderProps) => {

    return (
        <div className="border-b-[1px] border-solid border-gray-200">
            <span className='flex justify-around align-center'>            
            {taskTypes.map((type) => {
                return(
                <button
                    key={type}
                    className='cursor-pointer pb-2 text-[28px]
                    text-[var(--iconColor)] hover:text-[var(--primary)]
                    transition-all duration-[0.1s] ease'
                    style={{
                        color: type === taskType ? 'var(--primary)' : undefined,
                    }}
                    onClick={() => onSwitchType(type)}
                >
                    {type==='daily' && (
                        <FontAwesomeIcon 
                            icon={faCalendarDay} 
                        />
                    )}
                    {type==='schedule' && (
                        <FontAwesomeIcon 
                            icon={faAlarmClock} 
                        />
                    )}
                    {type==='bucket' && (
                        <FontAwesomeIcon 
                            icon={faBucket} 
                        />
                    )}
                </button>
            )})}
            </span>
        </div>
    )
}

export default TaskHeader;