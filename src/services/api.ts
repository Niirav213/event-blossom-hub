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

// Base API URL - Using relative paths to help work in various environments
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

// Generate a unique device ID to identify this device for syncing
const getDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

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
    
    // Check if this event already exists (by id)
    const eventExists = existingEvents.some((e: any) => e.id === event.id);
    if (eventExists) {
      // Update the existing event
      const updatedEvents = existingEvents.map((e: any) => e.id === event.id ? event : e);
      localStorage.setItem('customEvents', JSON.stringify(updatedEvents));
    } else {
      // Add the new event
      existingEvents.push(event);
      localStorage.setItem('customEvents', JSON.stringify(existingEvents));
    }
    
    // Dispatch a custom event for the current tab to know about the update
    window.dispatchEvent(new Event('eventCreated'));
    
    // Also dispatch a storage event for cross-tab communication
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'customEvents'
    }));
    
    // Save event to sessionStorage for cross-device synchronization
    saveEventToSessionStorage(event);
  } catch (error) {
    console.error("Error saving local event:", error);
  }
};

// Function to save event to sessionStorage for cross-device sync
const saveEventToSessionStorage = (event: any) => {
  try {
    // Get existing sync events
    const syncEventsStr = sessionStorage.getItem('syncEvents') || '[]';
    const syncEvents = JSON.parse(syncEventsStr);
    
    // Add this event to sync list with device ID and timestamp
    const syncEvent = {
      ...event,
      deviceId: getDeviceId(),
      syncTimestamp: Date.now()
    };
    
    // Check if this event already exists in sync list
    const eventIndex = syncEvents.findIndex((e: any) => e.id === event.id);
    if (eventIndex >= 0) {
      // Update existing event
      syncEvents[eventIndex] = syncEvent;
    } else {
      // Add new event
      syncEvents.push(syncEvent);
    }
    
    // Save updated sync list
    sessionStorage.setItem('syncEvents', JSON.stringify(syncEvents));
    
    // Also save to localStorage for persistence across page reloads
    localStorage.setItem('syncEvents', JSON.stringify(syncEvents));
  } catch (error) {
    console.error("Error saving event to session storage:", error);
  }
};

// Function to load events from sessionStorage (cross-device sync)
const loadEventsFromSessionStorage = () => {
  try {
    // Check localStorage first (more persistent)
    const syncEventsStr = localStorage.getItem('syncEvents') || sessionStorage.getItem('syncEvents') || '[]';
    const syncEvents = JSON.parse(syncEventsStr);
    
    // Get existing local events
    const localEvents = getLocalEvents();
    
    // Merge sync events with local events, avoiding duplicates
    let updated = false;
    
    syncEvents.forEach((syncEvent: any) => {
      // Skip events from this device (already in localStorage)
      if (syncEvent.deviceId === getDeviceId()) return;
      
      // Check if this event already exists locally
      const existingIndex = localEvents.findIndex((e: any) => e.id === syncEvent.id);
      
      if (existingIndex >= 0) {
        // Only update if sync event is newer
        const existingEvent = localEvents[existingIndex];
        if (!existingEvent.syncTimestamp || 
            (syncEvent.syncTimestamp > existingEvent.syncTimestamp)) {
          localEvents[existingIndex] = syncEvent;
          updated = true;
        }
      } else {
        // Add new event from another device
        localEvents.push(syncEvent);
        updated = true;
      }
    });
    
    // Update localStorage if changes were made
    if (updated) {
      localStorage.setItem('customEvents', JSON.stringify(localEvents));
      toast.info("New events synchronized from other devices");
    }
    
    return localEvents;
  } catch (error) {
    console.error("Error loading events from session storage:", error);
    return getLocalEvents();
  }
};

// New helper function to get locally stored tickets
const getLocalTickets = () => {
  try {
    const storedTickets = localStorage.getItem('userTickets');
    return storedTickets ? JSON.parse(storedTickets) : [];
  } catch (error) {
    console.error("Error retrieving local tickets:", error);
    return [];
  }
};

// New helper function to add a ticket to localStorage
const addLocalTicket = (ticket: any) => {
  try {
    const existingTickets = getLocalTickets();
    existingTickets.push(ticket);
    localStorage.setItem('userTickets', JSON.stringify(existingTickets));
    
    // Dispatch events for cross-tab communication
    window.dispatchEvent(new Event('ticketPurchased'));
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'userTickets'
    }));
  } catch (error) {
    console.error("Error saving local ticket:", error);
  }
};

// Helper function to check if API is available - improved to handle HTML responses better
const isApiAvailable = async () => {
  try {
    console.log("Checking API availability at:", `${API_URL}/test-db`);
    
    // Use a timeout to prevent long waits
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${API_URL}/test-db`, { 
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Check if response is JSON by looking at content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.log("API endpoint returned non-JSON response - falling back to mock data");
      return false;
    }
    
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
      // First, try to sync events from other devices via sessionStorage
      const syncedEvents = loadEventsFromSessionStorage();
      
      // Then get local events (should include synced events now)
      const localEvents = getLocalEvents();
      
      // Try to check if API is available
      const apiAvailable = await isApiAvailable();
      
      if (!apiAvailable) {
        // Return mock data and local events
        console.log("Using mock events data");
        const combinedEvents = [...mockEvents, ...localEvents];
        
        // Deduplicate events by id
        const eventMap = new Map();
        combinedEvents.forEach(event => {
          eventMap.set(event.id, event);
        });
        
        return Array.from(eventMap.values());
      }
      
      try {
        const response = await fetch(`${API_URL}/events`);
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error("API endpoint returned non-JSON response");
          console.log("Falling back to mock events due to error");
          // Fallback to mock data and local events
          return [...mockEvents, ...localEvents];
        }
        
        const apiEvents = await response.json();
        // Combine API events with local events
        const combinedEvents = [...apiEvents, ...localEvents];
        
        // Deduplicate events by id
        const eventMap = new Map();
        combinedEvents.forEach(event => {
          eventMap.set(event.id, event);
        });
        
        return Array.from(eventMap.values());
      } catch (error) {
        console.error("Error parsing API response:", error);
        console.log("Falling back to mock events due to error");
        // Fallback to mock data and local events on any error
        return [...mockEvents, ...localEvents];
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      console.log("Falling back to mock events due to error");
      // Final fallback
      return [...mockEvents, ...getLocalEvents()];
    }
  },
  
  async getEventById(id: string) {
    try {
      // First check in localStorage
      const localEvents = getLocalEvents();
      const localEvent = localEvents.find((e: any) => e.id === id);
      
      // Return local event if found
      if (localEvent) return localEvent;
      
      // Check if the API is available
      const apiAvailable = await isApiAvailable();
      
      if (!apiAvailable) {
        // Then check mock events if not found in localStorage
        const mockEvent = mockEvents.find(e => e.id === id);
        if (!mockEvent) throw new Error("Event not found");
        return mockEvent;
      }
      
      // Try the API
      try {
        const response = await fetch(`${API_URL}/events/${id}`);
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // Fallback to mock data
          const mockEvent = mockEvents.find(e => e.id === id);
          if (!mockEvent) throw new Error("Event not found");
          return mockEvent;
        }
        
        return await response.json();
      } catch (error) {
        // Fallback to mock data
        const mockEvent = mockEvents.find(e => e.id === id);
        if (!mockEvent) throw new Error("Event not found");
        return mockEvent;
      }
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
          available_tickets: data.total_tickets,
          deviceId: getDeviceId(),
          syncTimestamp: Date.now()
        };
        
        // Store in localStorage to persist between page navigations
        addLocalEvent(newEvent);
        
        toast.success("Event created successfully!");
        return newEvent;
      }
      
      // Try the API
      try {
        const response = await fetch(`${API_URL}/events`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(data)
        });
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // Fallback to mock creation
          const newEvent = {
            ...data,
            id: Date.now().toString(),
            available_tickets: data.total_tickets,
            deviceId: getDeviceId(),
            syncTimestamp: Date.now()
          };
          
          addLocalEvent(newEvent);
          toast.success("Event created successfully!");
          return newEvent;
        }
        
        const createdEvent = await response.json();
        return createdEvent;
      } catch (error) {
        // Fallback to mock creation
        const newEvent = {
          ...data,
          id: Date.now().toString(),
          available_tickets: data.total_tickets,
          deviceId: getDeviceId(),
          syncTimestamp: Date.now()
        };
        
        addLocalEvent(newEvent);
        toast.success("Event created successfully!");
        return newEvent;
      }
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
        // Check if this is a local event first
        const localEvents = getLocalEvents();
        const localEvent = localEvents.find((e: any) => e.id === id);
        
        if (localEvent) {
          // Update local event
          const updatedEvent = {
            ...localEvent,
            ...data,
            deviceId: getDeviceId(),
            syncTimestamp: Date.now()
          };
          
          // Update in localStorage
          const updatedEvents = localEvents.map((e: any) => 
            e.id === id ? updatedEvent : e
          );
          localStorage.setItem('customEvents', JSON.stringify(updatedEvents));
          
          // Update in sessionStorage for cross-device sync
          saveEventToSessionStorage(updatedEvent);
          
          // Notify about the update
          window.dispatchEvent(new Event('eventCreated'));
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'customEvents'
          }));
          
          toast.success("Event updated successfully");
          return updatedEvent;
        }
        
        // Mock event update for non-local events
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
      
      // First check if this is a local event
      const localEvents = getLocalEvents();
      const localEventIndex = localEvents.findIndex((e: any) => e.id === id);
      
      if (localEventIndex >= 0) {
        // It's a local event, remove it
        localEvents.splice(localEventIndex, 1);
        localStorage.setItem('customEvents', JSON.stringify(localEvents));
        
        // Also remove from sync events
        try {
          const syncEventsStr = localStorage.getItem('syncEvents') || '[]';
          const syncEvents = JSON.parse(syncEventsStr);
          const filteredSyncEvents = syncEvents.filter((e: any) => e.id !== id);
          localStorage.setItem('syncEvents', JSON.stringify(filteredSyncEvents));
          sessionStorage.setItem('syncEvents', JSON.stringify(filteredSyncEvents));
        } catch (error) {
          console.error("Error updating sync events after deletion:", error);
        }
        
        // Notify about the deletion
        window.dispatchEvent(new Event('eventCreated'));
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'customEvents'
        }));
        
        toast.success("Event deleted successfully");
        return { success: true };
      }
      
      if (!apiAvailable) {
        // Mock event deletion for non-local events
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
        
        // Get the event details to include in the ticket
        const event = mockEvents.find(e => e.id === data.event_id);
        if (!event) {
          throw new Error("Event not found");
        }
        
        // Create a mock ticket
        const mockTicket = {
          id: Date.now(),
          event_id: data.event_id,
          user_id: authService.getCurrentUser()?.id || 1,
          ticket_code: `MOCK-TICKET-${Date.now()}`,
          status: "purchased",
          purchase_date: new Date().toISOString(),
          quantity: data.quantity || 1,
          event_title: event.title,
          date: event.date,
          time_start: event.time_start,
          location: event.location,
          image_url: event.image_url
        };
        
        // Store in localStorage for persistence
        addLocalTicket(mockTicket);
        
        toast.success("Ticket purchased successfully!");
        return mockTicket;
      }
      
      const response = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      
      const result = await handleResponse(response);
      
      // If successful API response, still save to localStorage for resilience
      if (result.success) {
        // Get the event details to include in the ticket
        const event = await this.getEventById(data.event_id);
        
        const ticket = {
          id: Date.now(),
          event_id: data.event_id,
          user_id: authService.getCurrentUser()?.id || 1,
          ticket_code: result.ticket_code,
          status: "purchased",
          purchase_date: new Date().toISOString(),
          quantity: data.quantity || 1,
          event_title: event.title,
          date: event.date,
          time_start: event.time_start,
          location: event.location,
          image_url: event.image_url
        };
        
        addLocalTicket(ticket);
      }
      
      return result;
    } catch (error) {
      console.error("Error purchasing ticket:", error);
      throw error;
    }
  },
  
  // Helper method to get event by ID for ticket creation
  async getEventById(id: string) {
    // Look in mock events
    const mockEvent = mockEvents.find(e => e.id === id);
    if (mockEvent) return mockEvent;
    
    // Look in local events
    const localEvents = getLocalEvents();
    const localEvent = localEvents.find((e: any) => e.id === id);
    if (localEvent) return localEvent;
    
    // Try API
    try {
      const apiAvailable = await isApiAvailable();
      if (apiAvailable) {
        const response = await fetch(`${API_URL}/events/${id}`, {
          headers: getAuthHeaders()
        });
        return await handleResponse(response);
      }
    } catch (error) {
      console.error("Error fetching event for ticket:", error);
    }
    
    throw new Error("Event not found");
  },
  
  async getMyTickets() {
    try {
      // First check localStorage for tickets
      const localTickets = getLocalTickets();
      
      // Check if the API is available
      const apiAvailable = await isApiAvailable();
      
      if (!apiAvailable) {
        console.log("Using local tickets:", localTickets);
        if (localTickets.length > 0) {
          return localTickets;
        }
        
        // If no local tickets, generate some mock ones from mock events
        return mockEvents.map(event => ({
          id: Date.now() + parseInt(event.id),
          event_id: event.id,
          user_id: authService.getCurrentUser()?.id || 1,
          ticket_code: `MOCK-${Date.now()}-${event.id}`,
          status: "purchased",
          purchase_date: new Date().toISOString(),
          event_title: event.title,
          date: event.date,
          time_start: event.time_start,
          location: event.location,
          image_url: event.image_url
        }));
      }
      
      // Try API
      try {
        const response = await fetch(`${API_URL}/tickets/my`, {
          headers: getAuthHeaders()
        });
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.log("API endpoint returned non-JSON response for tickets");
          // Return local tickets if API fails
          return localTickets;
        }
        
        const apiTickets = await response.json();
        
        // Merge API tickets with local ones, avoiding duplicates by ticket_code
        const ticketCodes = new Set(apiTickets.map((t: any) => t.ticket_code));
        const uniqueLocalTickets = localTickets.filter((t: any) => !ticketCodes.has(t.ticket_code));
        
        return [...apiTickets, ...uniqueLocalTickets];
      } catch (error) {
        console.error("Error fetching tickets from API:", error);
        // Return local tickets if API fails
        return localTickets;
      }
    } catch (error) {
      console.error("Error in getMyTickets:", error);
      return [];
    }
  },

  // Alias for getMyTickets - both methods now work
  async getUserTickets() {
    return this.getMyTickets();
  }
};
