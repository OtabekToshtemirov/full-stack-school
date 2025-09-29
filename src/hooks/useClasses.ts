import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

// Types
interface Class {
  id: number;
  name: string;
  capacity: number;
  supervisor: { name: string; surname: string };
  grade: { level: number };
  _count: {
    students: number;
    lessons: number;
  };
}

interface ApiResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface QueryParams {
  page?: number;
  search?: string;
  supervisorId?: string;
  gradeId?: string;
  limit?: number;
}

// API functions
const fetchClasses = async (params: QueryParams = {}): Promise<ApiResponse<Class>> => {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.supervisorId) searchParams.set('supervisorId', params.supervisorId);
  if (params.gradeId) searchParams.set('gradeId', params.gradeId);
  if (params.limit) searchParams.set('limit', params.limit.toString());

  const response = await fetch(`/api/classes?${searchParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch classes');
  }
  
  return response.json();
};

const createClass = async (classData: Omit<Class, 'id'>): Promise<Class> => {
  const response = await fetch('/api/classes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(classData),
  });

  if (!response.ok) {
    throw new Error('Failed to create class');
  }

  return response.json();
};

const updateClass = async ({ id, ...classData }: Partial<Class> & { id: number }): Promise<Class> => {
  const response = await fetch(`/api/classes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(classData),
  });

  if (!response.ok) {
    throw new Error('Failed to update class');
  }

  return response.json();
};

const deleteClass = async (id: string): Promise<void> => {
  const response = await fetch(`/api/classes?id=${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete class');
  }
};

// Custom Hooks
export const useClasses = (params: QueryParams = {}) => {
  return useQuery({
    queryKey: ['classes', params],
    queryFn: () => fetchClasses(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class muvaffaqiyatli yaratildi!');
    },
    onError: (error: Error) => {
      toast.error(`Xatolik: ${error.message}`);
    },
  });
};

export const useUpdateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class muvaffaqiyatli yangilandi!');
    },
    onError: (error: Error) => {
      toast.error(`Xatolik: ${error.message}`);
    },
  });
};

export const useDeleteClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (error: Error) => {
      toast.error(`Xatolik: ${error.message}`);
    },
  });
};