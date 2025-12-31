import { create } from 'zustand';
import Cookies from 'js-cookie';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  setAuth: (user, token) => {
    Cookies.set('token', token, { expires: 7 }); // 7 days
    set({ user, token, isAuthenticated: true });
  },
  
  logout: () => {
    Cookies.remove('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  initAuth: () => {
    const token = Cookies.get('token');
    if (token) {
      // In a real app, you'd verify the token and get user data
      set({ token, isAuthenticated: true });
    }
  },
}));

export default useAuthStore;

