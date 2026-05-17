import { QueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
      retry: (failureCount, error: any) => {
        // Don't retry auth errors or 404s
        if (error?.status === 401 || error?.status === 404) return false
        // Retry network errors up to 3 times
        return failureCount < 3
      },
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 2,
      onError: (error: any) => {
        console.error('Mutation error:', error)
        toast.error(error.message || 'An error occurred while saving data')
      },
    },
  },
})
