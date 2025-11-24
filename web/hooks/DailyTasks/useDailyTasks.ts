import { getJsonApi } from '@/lib/routes/routes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../authProvider';
import { DailyTask, ShineDataWithRayStatus, UserProfileData } from '@/lib/firebase/interfaces';
import toast from 'react-hot-toast';

const api = getJsonApi();

export const useDailyTasks = () => {
    const { user } = useAuthContext();

    return useQuery({
        queryKey: ['dailyTasks', user?.uid],
        queryFn: async () => {
            if (!user) return null;
            const idToken = await user.getIdToken();
            const { data } = await api.get<DailyTask[]>('/v1/tasks', {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            return data;
        },
        enabled: !!user,
    });
};

export const useCreateDailyTask = () => {
    const queryClient = useQueryClient();
    const {user} = useAuthContext();
    const queryKey = ['dailyTasks', user?.uid];

    return useMutation({
        mutationFn: async(newDailyTask: DailyTask) => {
            if (!user) throw new Error("No user");
            const idToken = await user.getIdToken();
            const {data} = await api.post("/v1/tasks", newDailyTask, {
                headers: { 'Authorization': `Bearer ${idToken}`}
            });
            return data;
        },
        onSuccess: () => {
            // queryClient.setQueryData(queryKey, (oldData: DailyTask[] | undefined) => {
            //     return oldData ? [...oldData, newlyCreatedTask] : [newlyCreatedTask]
            // })
            toast.success("Task added successfully!")
            // queryClient.invalidateQueries({ queryKey: ['dailyTasks', user?.uid] });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['dailyTasks', user?.uid] });
        },
        onError: (err) => {
            console.error("failed to create daily task:", err)
            toast.error("Could not create task. Please try again.");

        }
    })
}

//Delete daily task from the db and reset dailyTask cache
export const useDeleteDailyTask = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthContext();
    const queryKey = ['dailyTasks', user?.uid];

    return useMutation({
        mutationFn: async(taskId: string) => {
            if(!user) throw new Error("No user");
            const idToken = await user.getIdToken();
            const { data } = await api.delete(`/v1/tasks/${taskId}`,{
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            return data
        },
        onMutate: async (deletedTaskId: string) => {
            // Cancel any outgoing refetches so they don't overwrite the optimistic update
            await queryClient.cancelQueries({ queryKey });

            // Snapshot the previous value (for if the delete fails)
            const previousTasks = queryClient.getQueryData(queryKey);
            
            // Optimistically update new value
            queryClient.setQueryData(queryKey, (old: DailyTask[]) => 
                old ? old.filter(task => task.id !== deletedTaskId) : []
            );

            // Context object with snapshot
            return { previousTasks }
        },
        onError: (err, newTodo, context) => {
            console.error("failed to delete daily task: ", err);
            queryClient.setQueryData(queryKey, context?.previousTasks)
            toast.error(
                "Could not delete task. Please try again."
            )
        },

        onSuccess: () => {
            toast.success(
                "Task deleted successfully."
            )
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        }
    })
}

export const useRecommendations = () => {
    const { user } = useAuthContext();

    return useQuery({
        queryKey: ['recommendations', user?.uid],
        queryFn: async () => {
            const {data} = await api.get('/v1/tasks/recommendations')
            return data;
        },
        enabled: !!user,
        staleTime: Infinity
    })
}

