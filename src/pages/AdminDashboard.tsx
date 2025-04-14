
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, Calendar, Users, Ticket } from "lucide-react";
import { eventsService } from "@/services/api";
import { toast } from "sonner";

interface Event {
  id: number | string;
  title: string;
  date: string;
  location: string;
  category: string;
  total_tickets: number;
  available_tickets: number;
}

const AdminDashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Improved event fetching function with better error handling
  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log("Fetching events for admin dashboard...");
      const data = await eventsService.getAllEvents();
      console.log("Events retrieved:", data);
      
      // Format the data to match the Event interface
      const formattedEvents = data.map((event: any) => ({
        id: event.id || event.ID,
        title: event.title || event.TITLE,
        date: event.date || event.EVENT_DATE,
        location: event.location || event.LOCATION,
        category: event.category || event.CATEGORY,
        total_tickets: event.total_tickets || event.TOTAL_TICKETS || 0,
        available_tickets: event.available_tickets || event.AVAILABLE_TICKETS || 0
      }));
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  // Listen for both regular navigation events and local storage changes
  useEffect(() => {
    fetchEvents();
    
    // Set up polling for new events (cross-device sync)
    const syncInterval = setInterval(() => {
      fetchEvents();
    }, 30000); // Check every 30 seconds
    
    // Listen for event creation/deletion to refresh the list
    const handleEventChange = () => {
      console.log("Event created/updated event detected, refreshing events...");
      fetchEvents();
    };
    
    // Add event listeners
    window.addEventListener('eventCreated', handleEventChange);
    window.addEventListener('storage', (event) => {
      if (event.key === 'customEvents' || event.key === 'syncEvents') {
        console.log("Storage event detected for customEvents, refreshing events...");
        handleEventChange();
      }
    });
    
    // Clean up
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('eventCreated', handleEventChange);
      window.removeEventListener('storage', handleEventChange);
    };
  }, []);

  const handleDelete = async (id: number | string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      await eventsService.deleteEvent(id.toString());
      setEvents(events.filter(event => event.id !== id));
      toast.success("Event deleted successfully");
      
      // Manually dispatch an event to notify about the change
      window.dispatchEvent(new Event('eventCreated'));
    } catch (error) {
      toast.error("Failed to delete event");
      console.error(error);
    }
  };

  // Helper to format date strings consistently
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString; // Return original if parsing fails
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <Button 
              className="bg-eventPurple hover:bg-eventPurple-dark flex items-center gap-2"
              onClick={() => navigate("/admin/events/new")}
            >
              <PlusCircle className="h-4 w-4" />
              Add New Event
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-3">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">Total Events</h3>
                  <p className="text-2xl font-bold">{events.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-3">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">Available Events</h3>
                  <p className="text-2xl font-bold">
                    {events.filter(event => {
                      const eventDate = new Date(event.date);
                      return eventDate >= new Date();
                    }).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center">
                <div className="bg-purple-100 rounded-full p-3">
                  <Ticket className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium">Total Tickets</h3>
                  <p className="text-2xl font-bold">
                    {events.reduce((sum, event) => sum + (event.total_tickets - event.available_tickets), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <h2 className="text-xl font-semibold mb-4">Events Management</h2>
            
            {loading ? (
              <div className="text-center py-8">Loading events...</div>
            ) : events.length > 0 ? (
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-4 text-left">Event Name</th>
                    <th className="py-3 px-4 text-left">Date</th>
                    <th className="py-3 px-4 text-left">Location</th>
                    <th className="py-3 px-4 text-left">Category</th>
                    <th className="py-3 px-4 text-center">Available Tickets</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <Link 
                          to={`/events/${event.id}`} 
                          className="font-medium text-eventPurple hover:underline"
                        >
                          {event.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4">{formatDate(event.date)}</td>
                      <td className="py-3 px-4">{event.location}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gray-100">
                          {event.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {event.available_tickets} / {event.total_tickets}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                            onClick={() => navigate(`/admin/events/${event.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            onClick={() => handleDelete(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No events found. Click "Add New Event" to create your first event.
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
