import { TaskType } from "@/lib/firebase/interfaces";
import { create } from "zustand";

type State = {
    isAddingDailyTask: boolean;
    taskType: TaskType;   
}

type Action = {
    setIsAddingDailyTask: (isAddingDailyTask: boolean) => void; 
    setTaskType: (taskType: TaskType) => void; 
}

export const useUIStore = create<State & Action>((set) => ({
    isAddingDailyTask: false,
    taskType: 'daily',

    setIsAddingDailyTask: (isAddingDailyTask) => set({ isAddingDailyTask: isAddingDailyTask}),
    setTaskType: (taskType) => set({taskType: taskType})
}))