import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

// Types
interface Teacher {
  id: string;
  username: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
  img?: string;
  subjects: { name: string }[];
  classes: { name: string }[];
  _count: {
    subjects: number;
    lessons: number;
    classes: number;
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
  classId?: string;
  limit?: number;
}

// API functions
const fetchTeachers = async (params: QueryParams = {}): Promise<ApiResponse<Teacher>> => {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.classId) searchParams.set('classId', params.classId);
  if (params.limit) searchParams.set('limit', params.limit.toString());

  const response = await fetch(`/api/teachers?${searchParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch teachers');
  }
  
  return response.json();
};

const createTeacher = async (teacher: Partial<Teacher>): Promise<Teacher> => {
  const response = await fetch('/api/teachers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(teacher),
  });

  if (!response.ok) {
    throw new Error('Failed to create teacher');
  }

  return response.json();
};

const updateTeacher = async ({ id, ...teacher }: Partial<Teacher> & { id: string }): Promise<Teacher> => {
  const response = await fetch(`/api/teachers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(teacher),
  });

  if (!response.ok) {
    throw new Error('Failed to update teacher');
  }

  return response.json();
};

const deleteTeacher = async (id: string): Promise<void> => {
  const response = await fetch(`/api/teachers?id=${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete teacher');
  }
};

// Custom Hooks
export const useTeachers = (params: QueryParams = {}) => {
  return useQuery({
    queryKey: ['teachers', params],
    queryFn: () => fetchTeachers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeacher,
    onSuccess: () => {
      // Cache ni yangilash
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success('Teacher muvaffaqiyatli yaratildi');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Xatolik yuz berdi');
    },
  });
};

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTeacher,
    onSuccess: (data, variables) => {
      // Cache ni yangilash
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      // Bitta teacher cache ni ham yangilash
      queryClient.setQueryData(['teacher', variables.id], data);
      toast.success('Teacher muvaffaqiyatli yangilandi');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Xatolik yuz berdi');
    },
  });
};

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTeacher,
    onSuccess: () => {
      // Cache ni yangilash
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success('Teacher muvaffaqiyatli o\'chirildi');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Xatolik yuz berdi');
    },
  });
};