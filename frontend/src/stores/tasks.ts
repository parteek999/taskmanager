import { defineStore } from 'pinia';
import { ref, computed, onUnmounted } from 'vue';
import axios from 'axios';
import { useUserStore } from './user';
import { authEvents, AUTH_READY_EVENT } from './auth';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  createdAt: string;
  createdBy: number;
  creator?: {
    name: string;
    email: string;
  };
}

interface AuthEventDetail {
  token: string | null;
}

export class TaskError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'TaskError';
  }
}

export const useTaskStore = defineStore('tasks', () => {
  // State
  const tasks = ref<Task[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const filter = ref<'all' | 'my'>('all');
  const initialized = ref(false);

  // Getters
  const filteredTasks = computed(() => {
    if (filter.value === 'all') return tasks.value;
    if (filter.value === 'my') {
      const userStore = useUserStore();
      return tasks.value.filter(task => task.createdBy === userStore.user?.id);
    }
    return tasks.value;
  });

  // Actions
  const fetchTasks = async (force = false) => {
    // Skip if already initialized and not forced
    if (initialized.value && !force) {
      return;
    }

    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get('/api/tasks', {
        params: {
          filter: filter.value
        }
      });
      tasks.value = response.data.map((task: any) => ({
        ...task,
        createdAt: task.createdAt || new Date().toISOString()
      }));
      initialized.value = true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch tasks';
      error.value = errorMessage;
      throw new TaskError(errorMessage, err.response?.data);
    } finally {
      loading.value = false;
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'createdBy'>) => {
    error.value = null;
    try {
      const response = await axios.post('/api/tasks', taskData);
      
      // Add the new task to the list and sort by creation date
      tasks.value = [...tasks.value, response.data]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to create task';
      error.value = errorMessage;
      throw new TaskError(errorMessage, err.response?.data);
    }
  };

  const updateTask = async (id: number, taskData: Partial<Task>) => {
    error.value = null;
    try {
      const response = await axios.put(`/api/tasks/${id}`, taskData);
      
      // Update the task in the list
      const index = tasks.value.findIndex(task => task.id === id);
      if (index !== -1) {
        tasks.value = [
          ...tasks.value.slice(0, index),
          { ...tasks.value[index], ...response.data },
          ...tasks.value.slice(index + 1)
        ];
      }
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to update task';
      error.value = errorMessage;
      throw new TaskError(errorMessage, err.response?.data);
    }
  };

  const deleteTask = async (id: number) => {
    error.value = null;
    try {
      await axios.delete(`/api/tasks/${id}`);
      
      // Remove the task from the list
      tasks.value = tasks.value.filter(task => task.id !== id);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to delete task';
      error.value = errorMessage;
      throw new TaskError(errorMessage, err.response?.data);
    }
  };

  // Listen for auth events
  const handleAuthEvent = (event: Event) => {
    const customEvent = event as CustomEvent<AuthEventDetail>;
    if (customEvent.detail.token) {
      // Reset initialization flag when auth token changes
      initialized.value = false;
      fetchTasks().catch(err => {
        console.error('Error fetching tasks after auth event:', err);
      });
    } else {
      tasks.value = [];
      initialized.value = false;
    }
  };

  authEvents.addEventListener(AUTH_READY_EVENT, handleAuthEvent);

  // Refresh tasks periodically (every 30 seconds)
  let refreshInterval: ReturnType<typeof setInterval>;
  
  const startAutoRefresh = () => {
    stopAutoRefresh(); // Clear any existing interval
    refreshInterval = setInterval(() => {
      // Force refresh on interval
      fetchTasks(true).catch(err => {
        console.error('Error in auto-refresh:', err);
      });
    }, 30000); // 30 seconds
  };

  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  };

  // Cleanup event listener when store is destroyed
  onUnmounted(() => {
    authEvents.removeEventListener(AUTH_READY_EVENT, handleAuthEvent);
    stopAutoRefresh();
  });

  return {
    // State
    tasks,
    loading,
    error,
    filter,
    // Getters
    filteredTasks,
    // Actions
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    startAutoRefresh,
    stopAutoRefresh
  };
}); 