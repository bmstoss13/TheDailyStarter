import { getJsonApi } from '@/lib/routes/routes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '../authProvider';
import { DailyTask } from '@/lib/firebase/interfaces';

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
            queryClient.invalidateQueries({ queryKey: ['dailyTasks', user?.uid] });
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