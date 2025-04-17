import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from './auth';

export type Task = {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  userId: number;
  sharedWith?: number[];
  createdAt: string;
  updatedAt: string;
};

export type TaskFilter = 'all' | 'my' | 'shared';

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const filter = ref<TaskFilter>('all');
  const authStore = useAuthStore();

  const getAuthHeader = () => {
    if (!authStore.token) throw new Error('Not authenticated');
    return { Authorization: `Bearer ${authStore.token}` };
  };

  const fetchTasks = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await axios.get('/api/tasks', {
        headers: getAuthHeader()
      });
      tasks.value = response.data;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createTask = async (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await axios.post('/api/tasks', task, {
        headers: getAuthHeader()
      });
      tasks.value.push(response.data);
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateTask = async (id: number, task: Partial<Task>) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await axios.put(`/api/tasks/${id}`, task, {
        headers: getAuthHeader()
      });
      const index = tasks.value.findIndex(t => t.id === id);
      if (index !== -1) {
        tasks.value[index] = response.data;
      }
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteTask = async (id: number) => {
    try {
      loading.value = true;
      error.value = null;
      await axios.delete(`/api/tasks/${id}`, {
        headers: getAuthHeader()
      });
      tasks.value = tasks.value.filter(t => t.id !== id);
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const setFilter = (newFilter: TaskFilter) => {
    filter.value = newFilter;
  };

  const filteredTasks = computed(() => {
    if (!authStore.user) return [];
    
    const userId = authStore.user.uid;
    if (!userId) return [];
    
    switch (filter.value) {
      case 'my':
        return tasks.value.filter(task => task.userId === Number(userId));
      case 'shared':
        return tasks.value.filter(task => 
          task.sharedWith?.includes(Number(userId))
        );
      default:
        return tasks.value;
    }
  });

  return {
    tasks,
    loading,
    error,
    filter,
    filteredTasks,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    setFilter
  };
}); 