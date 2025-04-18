import { defineStore } from 'pinia';
import { ref } from 'vue';
import { auth } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import axios from 'axios';
import { useUserStore } from './user';

// Constants for localStorage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Event bus for auth state changes
export const authEvents = new EventTarget();
export const AUTH_READY_EVENT = 'auth-ready';

export const useAuthStore = defineStore('auth', () => {
  // Initialize from localStorage
  const storedUser = localStorage.getItem(USER_KEY);
  const user = ref<User | null>(storedUser ? JSON.parse(storedUser) : null);
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY));
  const loading = ref(false);
  const error = ref<string | null>(null);
  const userStore = useUserStore();

  const setUser = (newUser: User | null) => {
    user.value = newUser;
    if (newUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  };

  const setToken = (newToken: string | null) => {
    token.value = newToken;
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken);
      // Set axios default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } else {
      localStorage.removeItem(TOKEN_KEY);
      // Remove axios default authorization header
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const notifyAuthReady = () => {
    authEvents.dispatchEvent(new CustomEvent(AUTH_READY_EVENT, {
      detail: { token: token.value }
    }));
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      loading.value = true;
      error.value = null;
      
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseToken = await userCredential.user.getIdToken();
      
      // Register with backend
      const response = await axios.post('/api/auth/signup', {
        email,
        name,
        firebaseToken
      });

      setUser(userCredential.user);
      setToken(firebaseToken);
      userStore.setUser(response.data);
      notifyAuthReady();
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      loading.value = true;
      error.value = null;
      
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseToken = await userCredential.user.getIdToken();
      
      // Login with backend
      const response = await axios.post('/api/auth/login', {
        firebaseToken
      });

      setUser(userCredential.user);
      setToken(firebaseToken);
      userStore.setUser(response.data.user);
      notifyAuthReady();
      return response.data.user;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      loading.value = true;
      error.value = null;
      await signOut(auth);
      setUser(null);
      setToken(null);
      userStore.clearUser();
      notifyAuthReady();
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getCurrentUser = async () => {
    try {
      if (!token.value) return null;
      
      const response = await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      });
      
      userStore.setUser(response.data);
      notifyAuthReady();
      return response.data;
    } catch (err: any) {
      // If we get a 401 error, the token is invalid or expired
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        // Clear the invalid token and user data
        setToken(null);
        setUser(null);
        userStore.clearUser();
        notifyAuthReady();
      }
      error.value = err.message;
      return null;
    }
  };

  // Initialize auth state listener
  onAuthStateChanged(auth, async (newUser) => {
    if (newUser) {
      try {
        const token = await newUser.getIdToken();
        setUser(newUser);
        setToken(token);
        await getCurrentUser();
        notifyAuthReady();
      } catch (err) {
        console.error('Failed to initialize auth state:', err);
        // If there's an error, clear the invalid state
        setUser(null);
        setToken(null);
        userStore.clearUser();
        notifyAuthReady();
      }
    } else {
      setUser(null);
      setToken(null);
      userStore.clearUser();
      notifyAuthReady();
    }
  });

  // Initialize session on store creation if we have a token
  if (token.value) {
    getCurrentUser().catch((err) => {
      console.error('Failed to restore session:', err);
      // If we fail to restore the session, clear everything
      setUser(null);
      setToken(null);
      userStore.clearUser();
      notifyAuthReady();
    });
  }

  return {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    getCurrentUser
  };
}); 