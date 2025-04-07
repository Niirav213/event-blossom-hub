
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, TicketIcon, Users, Tag } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { eventsService, ticketsService } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import TicketPayment from "@/components/TicketPayment";

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await eventsService.getEventById(id);
        setEvent(data);
      } catch (err: any) {
        console.error("Error fetching event:", err);
        setError(err.message || "Failed to load event details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [id]);
  
  const handleTicketPurchase = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to purchase tickets");
      navigate("/sign-in");
      return;
    }
    
    setPaymentOpen(true);
  };
  
  const handlePaymentComplete = () => {
    setPaymentOpen(false);
    navigate("/tickets");
  };
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-56 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Error Loading Event</h2>
            <p>{error || "Event not found"}</p>
            <Button asChild className="mt-4">
              <Link to="/events">Back to Events</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero image */}
        <div className="relative h-64 md:h-96 overflow-hidden">
          <img 
            src={event.image_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"} 
            alt={event.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
          <div className="absolute bottom-0 left-0 p-6 md:p-10 text-white">
            <h1 className="text-2xl md:text-4xl font-bold mb-2">{event.title}</h1>
            <div className="flex items-center text-sm md:text-base">
              <Calendar className="h-5 w-5 mr-2" />
              <span>{formatDate(event.date)}</span>
            </div>
          </div>
        </div>
        
        {/* Event details */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Main details */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-bold mb-4">About This Event</h2>
                <p className="text-gray-700 mb-6 whitespace-pre-line">{event.description}</p>
                
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-semibold mb-4">Event Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-3 text-eventPurple flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium">Date</div>
                        <div className="text-gray-600">{formatDate(event.date)}</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 mr-3 text-eventPurple flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium">Time</div>
                        <div className="text-gray-600">{event.time_start} - {event.time_end}</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Tag className="h-5 w-5 mr-3 text-eventPurple flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium">Category</div>
                        <div className="text-gray-600 capitalize">{event.category}</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Users className="h-5 w-5 mr-3 text-eventPurple flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium">Capacity</div>
                        <div className="text-gray-600">{event.total_tickets} attendees</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Ticket purchase card */}
              <div>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-bold mb-4">Tickets</h3>
                  
                  <div className="flex justify-between items-center mb-6">
                    <div className="font-medium">Price</div>
                    <div className="text-2xl font-bold">
                      ₹{event.price ? event.price.toFixed(2) : "0.00"}
                    </div>
                  </div>
                  
                  <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full bg-eventPurple hover:bg-eventPurple-dark"
                        onClick={handleTicketPurchase}
                      >
                        <TicketIcon className="mr-2 h-4 w-4" />
                        Purchase Ticket
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <TicketPayment 
                        eventId={id!}
                        eventName={event.title}
                        price={event.price || 0}
                        onPaymentComplete={handlePaymentComplete}
                        onCancel={() => setPaymentOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                  
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Secure checkout powered by our payment system
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EventDetailPage;
