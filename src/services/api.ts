
import { toast } from "sonner";

// Update API URL to match the server.js endpoint structure
const API_URL = 'http://localhost:5000';

// Helper to handle response
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // Check if response is HTML (like a 404 page)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      throw new Error(`Server returned ${response.status}: Endpoint not found`);
    }
    
    try {
      const error = await response.json();
      throw new Error(error.message || `Error: ${response.status}`);
    } catch (e) {
      throw new Error(`Server error: ${response.status}`);
    }
  }
  return response.json();
};

// Authentication service
export const authService = {
  // Register a new user
  register: async (userData: { name: string; email: string; password: string }) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await handleResponse(response);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // Login user
  login: async (credentials: { email: string; password: string }) => {
    try {
      console.log('Attempting login to:', `${API_URL}/api/auth/login`);
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      const data = await handleResponse(response);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  // Get current user - handle potential JSON parsing errors
  getCurrentUser: () => {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) return null;
      return JSON.parse(userString);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      // If there's an error parsing, clear the corrupted data
      localStorage.removeItem('user');
      return null;
    }
  },
  
  // Check if user is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  },
  
  // Check if user is admin
  isAdmin: () => {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) return false;
      const user = JSON.parse(userString);
      return user?.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
};

// Events service
export const eventsService = {
  // Get all events
  getAllEvents: async (category?: string) => {
    try {
      const url = category 
        ? `${API_URL}/events?category=${encodeURIComponent(category)}` 
        : `${API_URL}/events`;
        
      const response = await fetch(url);
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },
  
  // Get event by ID
  getEventById: async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/events/${id}`);
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },
  
  // Create new event (admin only)
  createEvent: async (eventData: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },
  
  // Update event (admin only)
  updateEvent: async (id: string, eventData: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      const response = await fetch(`${API_URL}/events/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },
  
  // Delete event (admin only)
  deleteEvent: async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      const response = await fetch(`${API_URL}/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
};

// Tickets service
export const ticketsService = {
  // Purchase ticket
  purchaseTicket: async (eventId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      const response = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ event_id: eventId })
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Error purchasing ticket:', error);
      throw error;
    }
  },
  
  // Get user tickets
  getUserTickets: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      const response = await fetch(`${API_URL}/tickets/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  }
};

// Auth context hook
export function useAuthStatus() {
  const user = authService.getCurrentUser();
  const isLoggedIn = authService.isLoggedIn();
  const isAdmin = authService.isAdmin();
  
  const login = async (email: string, password: string) => {
    try {
      await authService.login({ email, password });
      toast.success("Logged in successfully");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
      return false;
    }
  };
  
  const register = async (name: string, email: string, password: string) => {
    try {
      await authService.register({ name, email, password });
      toast.success("Registered successfully");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to register");
      return false;
    }
  };
  
  const logout = () => {
    authService.logout();
    toast.success("Logged out successfully");
  };
  
  return { user, isLoggedIn, isAdmin, login, register, logout };
}
