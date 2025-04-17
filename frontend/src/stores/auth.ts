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

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const setUser = (newUser: User | null) => {
    user.value = newUser;
  };

  const setToken = (newToken: string | null) => {
    token.value = newToken;
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      loading.value = true;
      error.value = null;
      
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseToken = await userCredential.user.getIdToken();
      
      // Register with backend
      await axios.post('/api/auth/signup', {
        email,
        name,
        firebaseToken
      });

      setUser(userCredential.user);
      setToken(firebaseToken);
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
      
      return response.data;
    } catch (err: any) {
      error.value = err.message;
      return null;
    }
  };

  // Initialize auth state listener
  onAuthStateChanged(auth, (newUser) => {
    setUser(newUser);
    if (newUser) {
      newUser.getIdToken().then(setToken);
    } else {
      setToken(null);
    }
  });

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