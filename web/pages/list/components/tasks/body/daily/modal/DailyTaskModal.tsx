import Modal from "@/components/Modal";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import DailyTaskModalBody from "./DailyTaskModalBody";
import DailyTaskModalFooter from "./footer/DailyTaskModalFooter";
import { DailyTask, UserProfileData } from "@/lib/firebase/interfaces";
import { useState } from "react";

interface DailyTaskModalProps{
    onCloseModal: () => void;
    onAddDailyTask: (dailyTask: DailyTask) => void;
    user: UserProfileData
}

const DailyTaskModal = ({
    onCloseModal,
    onAddDailyTask,
    user
}: DailyTaskModalProps) => {
    const [newTask, setNewTask] = useState<DailyTask>({
        id: "",
        uid: user.uid,
        title: "",
        category: null,
        isDaily: false,
        isComplete: false,
        createdAt: new Date(),
        points: 1
    });
 
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
                    <DailyTaskModalBody 
                        dailyTask={newTask}
                        onAddDailyTask={onAddDailyTask}
                        onChangeFormField={setNewTask}
                    />
                }
                footer={
                    <DailyTaskModalFooter 
                        dailyTask={newTask}
                        onAddDailyTask={onAddDailyTask}
                    />
                }
            />
        </>
    )
}

export default DailyTaskModal;