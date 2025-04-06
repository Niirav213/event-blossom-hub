
import { toast } from "sonner";

// Types
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
};

type EventData = {
  title: string;
  description?: string;
  image_url?: string;
  date: string;
  time_start: string;
  time_end: string;
  location: string;
  category: string;
  price: number;
  total_tickets: number;
  created_by?: number;
};

type TicketData = {
  event_id: string;
  quantity?: number;
};

// Base API URL - use relative URLs
const API_URL = '/api';

// Helper functions
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Error: ${response.statusText}`);
  }
  return response.json();
};

// Auth service
export const authService = {
  async login(data: LoginData) {
    console.log("Attempting login to:", `${API_URL}/auth/login`);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const responseData = await handleResponse(response);
      
      // Store token and user info
      localStorage.setItem('token', responseData.token);
      localStorage.setItem('user', JSON.stringify(responseData.user));
      
      return responseData;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  
  async register(data: RegisterData) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const responseData = await handleResponse(response);
      
      // Store token and user info
      localStorage.setItem('token', responseData.token);
      localStorage.setItem('user', JSON.stringify(responseData.user));
      
      return responseData;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },
  
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      // Clear potentially corrupted data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  },
  
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },
  
  isAdmin() {
    try {
      const user = this.getCurrentUser();
      return user && user.role === 'admin';
    } catch (error) {
      return false;
    }
  },
  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Events service
export const eventsService = {
  async getAllEvents() {
    try {
      const response = await fetch(`${API_URL}/events`);
      return await handleResponse(response);
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  },
  
  async getEventById(id: string) {
    try {
      const response = await fetch(`${API_URL}/events/${id}`);
      return await handleResponse(response);
    } catch (error) {
      console.error("Error fetching event:", error);
      throw error;
    }
  },
  
  async createEvent(data: EventData) {
    try {
      const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  },

  async updateEvent(id: string, data: Partial<EventData>) {
    try {
      const response = await fetch(`${API_URL}/events/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  },

  async deleteEvent(id: string) {
    try {
      const response = await fetch(`${API_URL}/events/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  }
};

// Tickets service
export const ticketsService = {
  async purchaseTicket(data: TicketData) {
    try {
      const response = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Error purchasing ticket:", error);
      throw error;
    }
  },
  
  async getMyTickets() {
    try {
      const response = await fetch(`${API_URL}/tickets/my`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      throw error;
    }
  },

  async getUserTickets() {
    // Alias for getMyTickets to fix the error
    return this.getMyTickets();
  }
};
