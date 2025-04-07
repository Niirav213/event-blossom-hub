
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
  description: string;
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

// Base API URL - Check if we're in development mode and use relative URL
// This helps the app work in various environments including deployment previews
const API_URL = import.meta.env.DEV ? '/api' : '/api';

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

// Mock data for testing when API is not available
const mockEvents = [
  {
    id: '1',
    title: 'Campus Music Festival',
    description: 'Annual music festival featuring student bands and local artists.',
    image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    date: '2025-05-15',
    time_start: '16:00',
    time_end: '23:00',
    location: 'University Main Quad',
    category: 'music',
    price: 15,
    total_tickets: 500,
    available_tickets: 350
  },
  {
    id: '2',
    title: 'Tech Career Fair',
    description: 'Connect with tech companies and startups for internship and job opportunities.',
    image_url: 'https://images.unsplash.com/photo-1591115765373-5207764f72e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    date: '2025-04-20',
    time_start: '10:00',
    time_end: '16:00',
    location: 'Student Union Ballroom',
    category: 'academic',
    price: 0,
    total_tickets: 300,
    available_tickets: 150
  },
  {
    id: '3',
    title: 'Spring Cultural Festival',
    description: 'Celebrate cultural diversity with food, performances, and activities.',
    image_url: 'https://images.unsplash.com/photo-1504680177321-2e6a879aac86?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    date: '2025-05-05',
    time_start: '12:00',
    time_end: '20:00',
    location: 'Campus Park',
    category: 'cultural',
    price: 10,
    total_tickets: 400,
    available_tickets: 280
  }
];

// Helper function to get locally stored custom events
const getLocalEvents = () => {
  try {
    const storedEvents = localStorage.getItem('customEvents');
    return storedEvents ? JSON.parse(storedEvents) : [];
  } catch (error) {
    console.error("Error retrieving local events:", error);
    return [];
  }
};

// Helper function to add a custom event to localStorage
const addLocalEvent = (event: any) => {
  try {
    const existingEvents = getLocalEvents();
    existingEvents.push(event);
    localStorage.setItem('customEvents', JSON.stringify(existingEvents));
    
    // Dispatch a custom event for the current tab to know about the update
    window.dispatchEvent(new Event('eventCreated'));
  } catch (error) {
    console.error("Error saving local event:", error);
  }
};

// Helper function to check if API is available
const isApiAvailable = async () => {
  try {
    console.log("Checking API availability at:", `${API_URL}/test-db`);
    const response = await fetch(`${API_URL}/test-db`, { 
      method: 'GET',
      // Adding a timeout to prevent long waits
      signal: AbortSignal.timeout(3000) 
    });
    return response.ok;
  } catch (error) {
    console.warn("API not available, using mock data:", error);
    return false;
  }
};

// Auth service
export const authService = {
  async login(data: LoginData) {
    console.log("Attempting login to:", `${API_URL}/auth/login`);
    try {
      // Check if the API is available
      const apiAvailable = await isApiAvailable();
      
      if (!apiAvailable) {
        // Mock login for development
        if (data.email === "admin@example.com" && data.password === "password") {
          const mockUser = { id: 1, name: "Admin User", email: data.email, role: "admin" };
          const mockToken = "mock-token-for-development";
          
          localStorage.setItem('token', mockToken);
          localStorage.setItem('user', JSON.stringify(mockUser));
          
          return { user: mockUser, token: mockToken };
        } else if (data.email === "user@example.com" && data.password === "password") {
          const mockUser = { id: 2, name: "Regular User", email: data.email, role: "user" };
          const mockToken = "mock-token-for-development";
          
          localStorage.setItem('token', mockToken);
          localStorage.setItem('user', JSON.stringify(mockUser));
          
          return { user: mockUser, token: mockToken };
        } else {
          throw new Error("Invalid email or password");
        }
      }
      
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
      // Check if the API is available
      const apiAvailable = await isApiAvailable();
      
      if (!apiAvailable) {
        // Mock registration for development
        const mockUser = { id: Date.now(), name: data.name, email: data.email, role: "user" };
        const mockToken = "mock-token-for-development";
        
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        return { user: mockUser, token: mockToken };
      }
      
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
      // Check if the API is available
      const apiAvailable = await isApiAvailable();
      
      if (!apiAvailable) {
        // Return mock data and local events for development
        console.log("Using mock events data");
        const localEvents = getLocalEvents();
        return [...mockEvents, ...localEvents];
      }
      
      const response = await fetch(`${API_URL}/events`);
      return await handleResponse(response);
    } catch (error) {
      console.error("Error fetching events:", error);
      // Fallback to mock data and local events
      console.log("Falling back to mock events due to error");
      const localEvents = getLocalEvents();
      return [...mockEvents, ...localEvents];
    }
  },
  
  async getEventById(id: string) {
    try {
      // Check if the API is available
      const apiAvailable = await isApiAvailable();
      
      if (!apiAvailable) {
        // First check in localStorage
        const localEvents = getLocalEvents();
        const localEvent = localEvents.find((e: any) => e.id === id);
        
        // Then check mock events if not found in localStorage
        if (localEvent) return localEvent;
        
        // Find mock event by ID
        const mockEvent = mockEvents.find(e => e.id === id);
        if (!mockEvent) throw new Error("Event not found");
        return mockEvent;
      }
      
      const response = await fetch(`${API_URL}/events/${id}`);
      return await handleResponse(response);
    } catch (error) {
      console.error("Error fetching event:", error);
      throw error;
    }
  },
  
  async createEvent(data: EventData) {
    try {
      // Check if the API is available
      const apiAvailable = await isApiAvailable();
      
      if (!apiAvailable) {
        // Mock event creation
        console.log("Mock event creation:", data);
        
        // Create a mock event with a unique ID
        const newEvent = {
          ...data,
          id: Date.now().toString(),
          available_tickets: data.total_tickets
        };
        
        // Store in localStorage to persist between page navigations
        addLocalEvent(newEvent);
        
        toast.success("Event created successfully (mock)");
        return newEvent;
      }
      
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
      // Check if the API is available
      const apiAvailable = await isApiAvailable();
      
      if (!apiAvailable) {
        // Mock event update
        console.log("Mock event update:", id, data);
        toast.success("Event updated successfully (mock)");
        return { ...data, id };
      }
      
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
      // Check if the API is available
      const apiAvailable = await isApiAvailable();
      
      if (!apiAvailable) {
        // Mock event deletion
        console.log("Mock event deletion:", id);
        toast.success("Event deleted successfully (mock)");
        return { success: true };
      }
      
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
      // Check if the API is available
      const apiAvailable = await isApiAvailable();
      
      if (!apiAvailable) {
        // Mock ticket purchase
        console.log("Mock ticket purchase:", data);
        toast.success("Ticket purchased successfully (mock)");
        return {
          id: Date.now(),
          event_id: data.event_id,
          ticket_code: `MOCK-TICKET-${Date.now()}`,
          purchase_date: new Date().toISOString()
        };
      }
      
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
      // Check if the API is available
      const apiAvailable = await isApiAvailable();
      
      if (!apiAvailable) {
        // Mock tickets data
        return mockEvents.map(event => ({
          id: `ticket-${event.id}`,
          event_id: event.id,
          event_title: event.title,
          date: event.date,
          time_start: event.time_start,
          location: event.location,
          image_url: event.image_url,
          ticket_code: `MOCK-${Date.now()}-${event.id}`,
          purchase_date: new Date().toISOString()
        }));
      }
      
      const response = await fetch(`${API_URL}/tickets/my`, {
        headers: getAuthHeaders()
      });
      return await handleResponse(response);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      throw error;
    }
  },

  // Alias for getMyTickets to fix the error
  async getUserTickets() {
    return this.getMyTickets();
  }
};
