<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <!-- Notification -->
    <div v-if="notification.show" :class="{
      'fixed top-4 right-4 p-4 rounded-lg shadow-lg max-w-md z-50 transition-all duration-300': true,
      'bg-green-50 text-green-800 border border-green-200': notification.type === 'success',
      'bg-red-50 text-red-800 border border-red-200': notification.type === 'error'
    }">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium">{{ notification.message }}</p>
        <button @click="hideNotification" class="ml-4 text-gray-400 hover:text-gray-500">
          <span class="sr-only">Close</span>
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Header Section -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">{{ showCreateForm ? 'Create New Task' : 'My Tasks' }}</h1>
        <p class="text-sm text-gray-500 mt-1" v-if="userStore.user">
          Welcome back, {{ userStore.user.name }}! 
          <span v-if="!showCreateForm">Here's an overview of your tasks.</span>
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <template v-if="!showCreateForm">
          <div class="relative">
            <label class="text-sm text-gray-600 mr-2">Filter:</label>
            <select
              v-model="taskStore.filter"
              class="appearance-none bg-white px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700"
            >
              <option value="all">All Tasks</option>
              <option value="my">My Tasks</option>
            </select>
          </div>
          <button
            @click="showCreateForm = true"
            class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm"
          >
            New Task
          </button>
        </template>
        <template v-else>
          <button
            @click="showCreateForm = false"
            class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-sm"
          >
            Back to Tasks
          </button>
        </template>
      </div>
    </div>

    <!-- Task Statistics -->
    <div v-if="!showCreateForm" class="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Task Statistics</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 rounded-l-lg">Metric</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">Count</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 rounded-r-lg">Percentage</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="text-sm font-medium text-gray-900">Total Tasks</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-2xl font-semibold text-indigo-600">{{ taskStats.total }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">100%</div>
              </td>
            </tr>
            <tr>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="text-sm font-medium text-gray-900">Completed Tasks</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-2xl font-semibold text-green-600">{{ taskStats.completed }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ taskStats.total ? Math.round((taskStats.completed / taskStats.total) * 100) : 0 }}%</div>
              </td>
            </tr>
            <tr>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="text-sm font-medium text-gray-900">Pending Tasks</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-2xl font-semibold text-yellow-600">{{ taskStats.pending }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ taskStats.total ? Math.round((taskStats.pending / taskStats.total) * 100) : 0 }}%</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Task Form -->
    <div v-if="showCreateForm" class="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
      <form @submit.prevent="createNewTask" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700" for="title">
            Task Title
          </label>
          <input
            id="title"
            v-model="newTask.title"
            type="text"
            required
            placeholder="Enter a descriptive title"
            class="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700" for="description">
            Description
          </label>
          <textarea
            id="description"
            v-model="newTask.description"
            required
            placeholder="Provide detailed information about the task"
            rows="4"
            class="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700" for="status">
            Status
          </label>
          <select
            id="status"
            v-model="newTask.status"
            class="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        
        <div class="flex justify-end space-x-4">
          <button
            type="button"
            @click="showCreateForm = false"
            class="px-6 py-3 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="createLoading"
            class="inline-flex items-center px-6 py-3 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="createLoading">Creating...</span>
            <span v-else>Create Task</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Task List -->
    <div v-if="!showCreateForm">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <span class="text-lg text-gray-500">Loading tasks...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p class="text-red-800 font-medium">Error:</p>
        <p class="text-red-800">{{ error }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredTasks.length === 0" class="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
        <p class="text-gray-500 text-lg mb-2">No tasks found</p>
        <p class="text-gray-400 text-sm mb-4">Get started by creating your first task!</p>
        <button
          @click="showCreateForm = true"
          class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
        >
          Create Task
        </button>
      </div>

      <!-- Task List -->
      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <h2 class="text-lg font-semibold text-gray-900">Your Tasks</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="task in filteredTasks" :key="task.id" class="hover:bg-gray-50 transition-colors duration-200">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ task.title }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-500 max-w-md truncate">{{ task.description }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="{
                      'px-3 py-1 text-xs rounded-full font-medium': true,
                      'bg-green-100 text-green-800': task.status === 'completed',
                      'bg-yellow-100 text-yellow-800': task.status === 'pending'
                    }"
                  >
                    {{ task.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ task.creator?.name || 'Unknown' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ new Date(task.createdAt).toLocaleDateString() }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="toggleTaskStatus(task)"
                    :disabled="!canEditTask(task) || actionLoading[task.id]"
                    class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 mr-2"
                    :class="{
                      'text-indigo-600 hover:bg-indigo-50': canEditTask(task) && !actionLoading[task.id],
                      'text-gray-400 cursor-not-allowed': !canEditTask(task) || actionLoading[task.id]
                    }"
                  >
                    <span v-if="actionLoading[task.id]">Processing...</span>
                    <span v-else>{{ task.status === 'completed' ? 'Mark Pending' : 'Complete' }}</span>
                  </button>
                  <button
                    @click="deleteTask(task.id)"
                    :disabled="!canEditTask(task) || actionLoading[task.id]"
                    class="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                    :class="{
                      'text-red-600 hover:bg-red-50': canEditTask(task) && !actionLoading[task.id],
                      'text-gray-400 cursor-not-allowed': !canEditTask(task) || actionLoading[task.id]
                    }"
                  >
                    <span v-if="actionLoading[task.id]">Processing...</span>
                    <span v-else>Delete</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useTaskStore } from '../stores/tasks';
import { useUserStore } from '../stores/user';
import { Task, TaskError } from '../stores/tasks';

const taskStore = useTaskStore();
const userStore = useUserStore();
const showCreateForm = ref(false);
const actionLoading = ref<{ [key: number]: boolean }>({});
const createLoading = ref(false);
const notification = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error',
  timeout: null as number | null
});

const newTask = ref({
  title: '',
  description: '',
  status: 'pending' as const
});

// Use computed properties for reactive store values
const loading = computed(() => taskStore.loading);
const error = computed(() => taskStore.error);
const filteredTasks = computed(() => taskStore.filteredTasks);
const tasks = computed(() => taskStore.tasks);

// Computed properties for task statistics
const taskStats = computed(() => ({
  total: tasks.value.length,
  completed: tasks.value.filter(t => t.status === 'completed').length,
  pending: tasks.value.filter(t => t.status === 'pending').length
}));

const showNotification = (message: string, type: 'success' | 'error') => {
  if (notification.value.timeout) {
    clearTimeout(notification.value.timeout);
  }
  notification.value = {
    show: true,
    message,
    type,
    timeout: setTimeout(() => {
      hideNotification();
    }, 5000) as unknown as number
  };
};

const hideNotification = () => {
  notification.value.show = false;
  if (notification.value.timeout) {
    clearTimeout(notification.value.timeout);
    notification.value.timeout = null;
  }
};

const handleError = (err: unknown) => {
  console.error('Operation failed:', err);
  if (err instanceof TaskError) {
    showNotification(err.message, 'error');
  } else if (err instanceof Error) {
    showNotification(err.message, 'error');
  } else {
    showNotification('An unexpected error occurred', 'error');
  }
};

const createNewTask = async () => {
  if (createLoading.value) return;
  
  try {
    createLoading.value = true;
    await taskStore.createTask(newTask.value);
    // Reset form first
    newTask.value = {
      title: '',
      description: '',
      status: 'pending'
    };
    // Then update UI state
    showCreateForm.value = false;
    showNotification('Task created successfully', 'success');
    // Force refresh tasks
    await taskStore.fetchTasks(true);
  } catch (err) {
    handleError(err);
  } finally {
    createLoading.value = false;
  }
};

// Watch for showCreateForm changes to refresh data when returning to list
watch(showCreateForm, async (newValue) => {
  if (!newValue) { // When returning to list view
    try {
      await taskStore.fetchTasks(true);
    } catch (err) {
      handleError(err);
    }
  }
});

onMounted(async () => {
  try {
    await taskStore.fetchTasks();
    taskStore.startAutoRefresh();
  } catch (err) {
    handleError(err);
  }
});

onUnmounted(() => {
  taskStore.stopAutoRefresh();
  if (notification.value.timeout) {
    clearTimeout(notification.value.timeout);
  }
});

const canEditTask = (task: Task) => {
  return task.createdBy === userStore.user?.id;
};

const toggleTaskStatus = async (task: Task) => {
  if (!canEditTask(task) || actionLoading.value[task.id]) return;
  
  const newStatus = task.status === 'completed' ? 'pending' : 'completed';
  try {
    actionLoading.value[task.id] = true;
    await taskStore.updateTask(task.id, { status: newStatus });
    showNotification(`Task marked as ${newStatus}`, 'success');
    await taskStore.fetchTasks(true);
  } catch (err) {
    handleError(err);
  } finally {
    actionLoading.value[task.id] = false;
  }
};

const deleteTask = async (id: number) => {
  const task = tasks.value.find(t => t.id === id);
  if (!task || !canEditTask(task) || actionLoading.value[id]) return;
  
  if (confirm('Are you sure you want to delete this task?')) {
    try {
      actionLoading.value[id] = true;
      await taskStore.deleteTask(id);
      showNotification('Task deleted successfully', 'success');
      await taskStore.fetchTasks(true);
    } catch (err) {
      handleError(err);
    } finally {
      actionLoading.value[id] = false;
    }
  }
};
</script> 