import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark";

interface DeleteTaskButtonProps{
    taskId: string;
    onDeleteDailyTask: (taskId: string) => void;
}
export default function DeleteTaskButton({
    taskId,
    onDeleteDailyTask,
}:DeleteTaskButtonProps) {
    return(
        <button
            className={``}
            onClick={() => onDeleteDailyTask(taskId)}
        >
            <FontAwesomeIcon
                icon={faXmark}
            />
        </button>
    )
}