<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Tasks</h1>
      <div class="flex space-x-4">
        <select
          v-model="filter"
          class="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="all">All Tasks</option>
          <option value="my">My Tasks</option>
          <option value="shared">Shared Tasks</option>
        </select>
        <button
          @click="showCreateModal = true"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Task
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-4">
      Loading tasks...
    </div>

    <div v-else-if="error" class="text-red-500 text-center py-4">
      {{ error }}
    </div>

    <div v-else-if="filteredTasks.length === 0" class="text-center py-4">
      No tasks found.
    </div>

    <div v-else class="grid gap-4">
      <div
        v-for="task in filteredTasks"
        :key="task.id"
        class="bg-white shadow rounded-lg p-4"
      >
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-medium text-gray-900">{{ task.title }}</h3>
            <p class="mt-1 text-sm text-gray-500">{{ task.description }}</p>
          </div>
          <div class="flex space-x-2">
            <button
              @click="toggleTaskStatus(task)"
              class="text-sm text-indigo-600 hover:text-indigo-900"
            >
              {{ task.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed' }}
            </button>
            <button
              @click="deleteTask(task.id)"
              class="text-sm text-red-600 hover:text-red-900"
            >
              Delete
            </button>
          </div>
        </div>
        <div class="mt-2 text-xs text-gray-500">
          Created: {{ new Date(task.createdAt).toLocaleDateString() }}
        </div>
      </div>
    </div>

    <!-- Create Task Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 class="text-xl font-bold mb-4">Create New Task</h2>
        <form @submit.prevent="createNewTask">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="title">
              Title
            </label>
            <input
              id="title"
              v-model="newTask.title"
              type="text"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="description">
              Description
            </label>
            <textarea
              id="description"
              v-model="newTask.description"
              required
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            ></textarea>
          </div>
          <div class="flex justify-end space-x-2">
            <button
              type="button"
              @click="showCreateModal = false"
              class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTaskStore } from '../stores/tasks';
import { Task } from '../stores/tasks';

const taskStore = useTaskStore();
const showCreateModal = ref(false);
const newTask = ref({
  title: '',
  description: '',
  status: 'pending' as const
});

const { loading, error, filter, filteredTasks } = taskStore;

onMounted(async () => {
  await taskStore.fetchTasks();
});

const createNewTask = async () => {
  try {
    await taskStore.createTask(newTask.value);
    showCreateModal.value = false;
    newTask.value = {
      title: '',
      description: '',
      status: 'pending'
    };
  } catch (err) {
    console.error('Failed to create task:', err);
  }
};

const toggleTaskStatus = async (task: Task) => {
  try {
    await taskStore.updateTask(task.id, {
      status: task.status === 'completed' ? 'pending' : 'completed'
    });
  } catch (err) {
    console.error('Failed to update task:', err);
  }
};

const deleteTask = async (id: number) => {
  if (confirm('Are you sure you want to delete this task?')) {
    try {
      await taskStore.deleteTask(id);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  }
};
</script> 