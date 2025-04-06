
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/api";
import { toast } from "sonner";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Protected routes that need authentication
  const protectedRoutes = ['/tickets', '/create-event', '/admin'];
  
  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = () => {
      try {
        const storedUser = authService.getCurrentUser();
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setInitialCheckDone(true);
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Redirect unauthenticated users from protected routes
  useEffect(() => {
    if (initialCheckDone && !loading) {
      const isProtected = protectedRoutes.some(route => location.pathname.startsWith(route));
      
      if (isProtected && !user) {
        toast.error("Please sign in to access this page");
        navigate('/sign-in', { replace: true });
      }
    }
  }, [location.pathname, user, initialCheckDone, loading, navigate]);
  
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const data = await authService.login({ email, password });
      setUser(data.user);
      toast.success("Logged in successfully!");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const data = await authService.register({ name, email, password });
      setUser(data.user);
      toast.success("Registration successful!");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success("Logged out successfully");
    navigate("/");
  };
  
  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
    loading
  };
  
  // Only render children after initial auth check is done
  if (!initialCheckDone) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-eventPurple"></div>
      </div>
    ); 
  }
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
