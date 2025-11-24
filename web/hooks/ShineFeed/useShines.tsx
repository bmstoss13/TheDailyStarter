import { getJsonApi } from '@/lib/routes/routes';
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useAuthContext } from '../authProvider';
import { ShineDataWithRayStatus, UserProfileData } from '@/lib/firebase/interfaces';
import { useUIStore } from '../useUIStore';
import { User } from 'firebase/auth';
import toast from 'react-hot-toast';

const api = getJsonApi();

export const useShinesFeed = () => {
    const { user } = useAuthContext();
    const queryKey = ['shines', 'feed'];
    return useInfiniteQuery({
        queryKey: queryKey,
        queryFn: async ({ pageParam }) => {
            if (!user) throw new Error("No user")
            const idToken = await user.getIdToken(true);
            const {data} = await api.get<ShineDataWithRayStatus[]>(`v1/shines`, {
                params: {
                    limit: 10,
                    startAfter: pageParam,
                },
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            return data;
        },
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => {
            if (!lastPage || lastPage.length < 10) return undefined;
            return lastPage[lastPage.length - 1].id;
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        refetchOnMount: false,
    });
};

export const useDailyQuote = () => {
    const {user} = useAuthContext();
    const {openQuoteModal} = useUIStore();
    const queryKey = ['dailyQuote', user?.uid];

    return useQuery({
        queryKey: queryKey,
        queryFn: async () => {
            if(!user) throw new Error("No user");
            const idToken = await user.getIdToken(true);
            const { data } = await api.post('/v1/user/login', {},
                {
                    headers: {
                        'Authorization': `Bearer ${idToken}`,
                    }
                }
            );
            if (data.isNewQuote && data.dailyQuote) {
                openQuoteModal();
            }
            return data.dailyQuote || null;
        },
        enabled: !!user,
        retry: 1,
        staleTime: 1000 * 60 * 60 * 24,
    });
};

export const useDailyNews = () => {
    const { user } = useAuthContext();
    const queryKey = ['dailyNews'];
    return useQuery({
        queryKey: queryKey,
        queryFn: async () => {
            if(!user) throw new Error("No user");
            const idToken = await user.getIdToken(true);
            const { data } = await api.get(`/v1/news`, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            return data;
        },
        staleTime: 1000 * 60 * 60,
        gcTime: 1000 * 60 * 60,
        refetchOnMount: false,
        enabled: !!user,
    })
};

export const useBannerMessage = () => {
    const {user} = useAuthContext();
    const queryKey = ['banner', user?.uid];
    return useQuery({
        queryKey: queryKey,
        queryFn: async () => {
            if(!user) throw new Error("No user");
            const idToken = await user.getIdToken(true);
            const { data } = await api.get('/v1/banner', {
                headers:{
                    'Authorization': `Bearer ${idToken}`
                }
            });
            return data?.message || "";
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5,
    })
}

export const useToggleRay = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthContext();
    const queryKey = ['shines', 'feed'];

    return useMutation({
        mutationFn: async (shineId: string) => {
            if(!user) throw new Error("No user");
            const idToken = await user.getIdToken();
            const { data } = await api.post(`/v1/shines/${shineId}/toggleRay`, null, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });
            return { shineId, hasRayed: data};
        },
        onMutate: async(shineId: string) => {
            await queryClient.cancelQueries({ queryKey });
            const previousFeed = queryClient.getQueryData(queryKey);
            queryClient.setQueryData(queryKey, (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page: ShineDataWithRayStatus[]) => 
                        page.map(shine => {
                            if (shine.id === shineId) {
                                const newRayCount = shine.hasRayed
                                    ? shine.rayCount - 1
                                    : shine.rayCount + 1;
                                return { ...shine, hasRayed: !shine.hasRayed, rayCount: newRayCount};
                            }
                            return shine;
                        })
                    ),
                };
            });
            return { previousFeed };
        },
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(queryKey, context?.previousFeed);
            toast.error("Failed to update ray. Please try again.")
        },
        onSettled: () => {
            // queryClient.invalidateQueries({ queryKey });
        }
    });
};

export const useDeleteShine = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthContext();
    const queryKey = ['shines', 'feed'];

    return useMutation({
        mutationFn: async (shineId: string) => {
            if (!user) throw new Error("No user");
            const idToken = await user.getIdToken();
            await api.delete(`/v1/shines/${shineId}`, {
                headers: { 'Authorization': `Bearer ${idToken}` }
            });
            return shineId;
        },
        onSuccess: (deletedId) => {
            toast.success("Shine deleted");
            // Direct Cache Update (Remove item from list without refetching)
            queryClient.setQueryData(queryKey, (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page: ShineDataWithRayStatus[]) => 
                        page.filter((shine) => shine.id !== deletedId)
                    ),
                };
            });
        },
        onError: () => {
            toast.error("Could not delete shine.");
        }
    });
};

export const useCreateShine = (userProfile: UserProfileData) => {
    const queryClient = useQueryClient();
    const { user } = useAuthContext();

    return useMutation({
        mutationFn: async ({ text, file }: { text: string, file: File | null }) => {
            if (!user) throw new Error("No user");
            const idToken = await user.getIdToken();

            // Build FormData
            const formData = new FormData();
            formData.append("text", text.trim());
            if (file) {
                formData.append("photo", file);
            }

            const { data } = await api.postForm('/v1/shines', formData, {
                headers: { 
                    'Authorization': `Bearer ${idToken}`
                    // postForm automatically sets Content-Type to multipart/form-data
                }
            });

            return data as ShineDataWithRayStatus;
        },
        onSuccess: (newShine) => {

            const fullShineData: ShineDataWithRayStatus = {
                ...newShine,
                username: userProfile.username,
                userPhotoUrl: userProfile.photoURL,
                rayCount: 0,
                hasRayed: false,
            };

            // 2. Update the Infinite Scroll Cache
            queryClient.setQueryData(['shines', 'feed'], (oldData: any) => {
                if (!oldData) return oldData;
                
                // Clone the pages array
                const newPages = [...oldData.pages];
                
                // Add new shine to the TOP of the first page
                if (newPages.length > 0) {
                    newPages[0] = [fullShineData, ...newPages[0]];
                } else {
                    newPages[0] = [fullShineData];
                }

                return { ...oldData, pages: newPages };
            });

            toast.success("Shine posted successfully!");
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || "Failed to post shine.";
            toast.error(msg);
        }
    });
};