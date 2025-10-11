import { useSelector } from "react-redux";

// Custom hook to access authentication state from Redux
export const useAuthStore = () => {
  const user = useSelector(state => state.auth.user);
  const token = useSelector(state => state.auth.token);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const loading = useSelector(state => state.auth.loading);
  const error = useSelector(state => state.auth.error);

  return { user, token, isAuthenticated, loading, error };
};
