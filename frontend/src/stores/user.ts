import { defineStore } from 'pinia';
import { ref } from 'vue';

interface User {
  id: number;
  name: string;
  email: string;
  firebaseUid: string;
}

const USER_DATA_KEY = 'user_data';

export const useUserStore = defineStore('user', () => {
  // Initialize user from localStorage if available
  const storedUser = localStorage.getItem(USER_DATA_KEY);
  const user = ref<User | null>(storedUser ? JSON.parse(storedUser) : null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const setUser = (userData: User | null) => {
    user.value = userData;
    if (userData) {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(USER_DATA_KEY);
    }
  };

  const clearUser = () => {
    user.value = null;
    localStorage.removeItem(USER_DATA_KEY);
  };

  return {
    user,
    loading,
    error,
    setUser,
    clearUser
  };
}); 