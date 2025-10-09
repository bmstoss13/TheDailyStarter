import Modal from "@/components/Modal";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import DailyTaskModalBody from "./DailyTaskModalBody";
import DailyTaskModalFooter from "./footer/DailyTaskModalFooter";
import { DailyTask } from "@/lib/firebase/interfaces";

interface DailyTaskModalProps{
    onCloseModal: () => void;
    onAddDailyTask: (dailyTask: DailyTask) => void;
}

const DailyTaskModal = ({
    onCloseModal,
    onAddDailyTask
}: DailyTaskModalProps) => {
    return(
        <>
            <Modal 
                onClose={onCloseModal}
                title='New Task'
                iconProps={{
                    icon: faPlus,
                    color: 'var(--primary)'
                }}
                children={
                    <DailyTaskModalBody />
                }
                footer={
                    <DailyTaskModalFooter 
                        onAddDailyTask={onAddDailyTask}
                    />
                }
            />
        </>
    )
}

export default DailyTaskModal;