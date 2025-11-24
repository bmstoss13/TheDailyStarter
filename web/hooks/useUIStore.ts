import { ShineDataWithRayStatus, TaskType } from "@/lib/firebase/interfaces";
import { create } from "zustand";

type State = {
    //Daily Task States
    isAddingDailyTask: boolean;
    taskType: TaskType; 

    //
    isQuoteModalOpen: boolean;
    isFormModalOpen: boolean;
    selectedShine: ShineDataWithRayStatus | null;
}

type Action = {
    //Daily Task Actions
    setIsAddingDailyTask: (isAddingDailyTask: boolean) => void; 
    setTaskType: (taskType: TaskType) => void;
    
    //Feed Actions
    openQuoteModal: () => void;
    closeQuoteModal: () => void;
    openFormModal: () => void;
    closeFormModal: () => void;
    openComments: (shine: ShineDataWithRayStatus) => void;
    closeComments: () => void;
}

export const useUIStore = create<State & Action>((set) => ({
    isAddingDailyTask: false,
    taskType: 'daily',

    setIsAddingDailyTask: (isAddingDailyTask) => set({ isAddingDailyTask: isAddingDailyTask}),
    setTaskType: (taskType) => set({taskType: taskType}),

    isQuoteModalOpen: false,
    isFormModalOpen: false,
    selectedShine: null,

    openQuoteModal: () => set({ isQuoteModalOpen: true }),
    closeQuoteModal: () => set({ isQuoteModalOpen: false }),
    openFormModal: () => set({ isFormModalOpen: true }),
    closeFormModal: () => set({ isFormModalOpen: false }),
    openComments: (shine) => set({ selectedShine: shine }),
    closeComments: () => set({ selectedShine: null }),
}))