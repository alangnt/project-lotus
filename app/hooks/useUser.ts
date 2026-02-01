import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface User {
  id: number;
  email: string;
  username: string;
  points: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
}

// Query keys for consistent cache management
export const userKeys = {
  all: ["users"] as const,
  detail: (id: number) => [...userKeys.all, id] as const,
};

// Fetch user by ID
export function useUser(userId: number | undefined) {
  return useQuery({
    queryKey: userKeys.detail(userId!),
    queryFn: async (): Promise<User> => {
      const response = await fetch(`/api/user?id=${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      return response.json();
    },
    enabled: !!userId, // Only run if userId exists
  });
}

// Update user profile mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/update-user", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to update user");
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Get username from the formData to get the user ID
      const username = variables.get("username");
      // Invalidate and refetch user data after update
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

// Add points mutation
export function useAddPoints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, points }: { userId: number; points: number }) => {
      const response = await fetch(`/api/points?id=${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ points }),
      });
      if (!response.ok) {
        throw new Error("Failed to add points");
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Optimistically update the cache with new points
      queryClient.setQueryData(userKeys.detail(variables.userId), (oldData: User | undefined) => {
        if (oldData) {
          return { ...oldData, points: data.points };
        }
        return oldData;
      });
    },
  });
}
