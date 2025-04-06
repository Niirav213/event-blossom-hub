
import { useState, useEffect } from "react";
import EventCard from "./EventCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { eventsService } from "@/services/api";
import { toast } from "sonner";

// Define a proper Event type
type Event = {
  id: string;
  title: string;
  event_date?: string;
  date?: string;
  time_start?: string;
  time_end?: string;
  location?: string;
  image_url?: string;
  category?: string;
  price?: number;
};

const FeaturedEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const fetchedEvents = await eventsService.getAllEvents();
        console.log("Fetched events:", fetchedEvents);
        setEvents(fetchedEvents);
      } catch (err: any) {
        console.error("Error fetching events:", err);
        setError(err.message || "Failed to load events");
        toast.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);
  
  // Format events to match the EventCard component props
  const formattedEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    date: event.event_date || event.date ? new Date(event.event_date || event.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : 'Date TBA',
    time: event.time_start && event.time_end ? 
      `${event.time_start} - ${event.time_end}` : 'Time TBA',
    location: event.location || 'Location TBA',
    image: event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    category: event.category || 'General',
    price: event.price ? `$${event.price}` : 'Free'
  }));
  
  // Display the formatted events
  const displayEvents = formattedEvents.length > 0 ? formattedEvents : [];
  
  if (loading) {
    return (
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-title mb-8">Featured Events</h2>
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-eventPurple" />
          </div>
        </div>
      </section>
    );
  }
  
  if (error) {
    return (
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-title mb-8">Featured Events</h2>
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            <p>Unable to load events: {error}</p>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="section-title mb-0">Featured Events</h2>
          <Link to="/events" className="hidden md:flex items-center text-eventPurple hover:text-eventPurple-dark transition-colors">
            <span className="mr-1">View all events</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        {displayEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No events available right now.</p>
            <Button asChild variant="default" className="bg-eventPurple hover:bg-eventPurple-dark">
              <Link to="/create-event">Host an Event</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayEvents.slice(0, 6).map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        )}
        
        <div className="text-center mt-8 md:hidden">
          <Button asChild variant="outline" className="border-eventPurple text-eventPurple hover:bg-eventPurple hover:text-white">
            <Link to="/events">View All Events</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedEvents;
