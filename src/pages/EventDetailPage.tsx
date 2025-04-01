
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Share2, Heart, Users, Ticket, AlertCircle, LogIn } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const EventDetailPage = () => {
  const { id } = useParams();
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const loggedInStatus = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedInStatus);
  }, []);
  
  // In a real app, we would fetch this data based on the ID
  // For now, we'll use hardcoded data
  const event = {
    id: "1",
    title: "Annual College Fest",
    description: "Join us for the biggest college event of the year! Featuring live music performances, dance competitions, tech exhibitions, food stalls, and more.",
    longDescription: "The Annual College Fest is back with more excitement and activities than ever before! This two-day extravaganza showcases the best talent our campus has to offer.\n\nDay 1 features cultural performances including dance competitions, music performances, and theatrical presentations. The evening concludes with performances from local bands and our college rock group.\n\nDay 2 focuses on academic and technical exhibitions, workshops, and the much-anticipated talent show final. The event concludes with an award ceremony and DJ night.\n\nThis is the perfect opportunity to showcase your talents, meet fellow students, and create lasting memories of your college experience.",
    date: "May 15, 2024",
    startTime: "10:00 AM",
    endTime: "10:00 PM",
    location: "Main Campus Ground",
    address: "University Campus, College Road, Building 3",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    category: "Festivals",
    organizer: "Student Council",
    price: 15,
    availableTickets: 250,
    tags: ["Festival", "Music", "Dance", "Exhibition", "Food"],
    lineup: [
      "Opening Ceremony - 10:00 AM",
      "Cultural Performances - 11:30 AM",
      "Tech Exhibition - 2:00 PM",
      "Talent Competition - 4:00 PM",
      "Live Music - 6:30 PM",
      "DJ Night - 8:00 PM"
    ],
    faqs: [
      {
        question: "Can non-students attend this event?",
        answer: "Yes, non-students can attend with a guest pass. Each student can bring up to 2 guests."
      },
      {
        question: "Is food included in the ticket price?",
        answer: "No, food and beverages will be available for purchase from various stalls at the event."
      },
      {
        question: "What's the refund policy?",
        answer: "Tickets are non-refundable but can be transferred to another person up to 24 hours before the event."
      }
    ]
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const incrementQuantity = () => {
    setTicketQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setTicketQuantity(prev => prev > 1 ? prev - 1 : 1);
  };
  
  const handleBuyTickets = () => {
    if (!isLoggedIn) {
      toast({
        title: "Sign in required",
        description: "Please sign in to purchase tickets",
        variant: "destructive"
      });
      navigate("/sign-in");
      return;
    }
    
    // In a real app, this would call an API to process the ticket purchase
    toast({
      title: "Tickets purchased successfully!",
      description: `You've purchased ${ticketQuantity} ticket(s) for ${event.title}`,
    });
    
    navigate("/tickets");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Event Header */}
        <div className="relative h-64 md:h-96 bg-gray-900">
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
            <div className="container mx-auto">
              <span className="bg-eventPurple text-white px-3 py-1 text-sm font-medium rounded-md mb-2 inline-block">
                {event.category}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{event.title}</h1>
              <div className="flex flex-wrap gap-4 text-white">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>{event.startTime} - {event.endTime}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Event Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Event Details Column */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-semibold mb-4">About this event</h2>
                <p className="text-gray-700 mb-6">{event.description}</p>
                <p className="text-gray-700 whitespace-pre-line">{event.longDescription}</p>
                
                <h3 className="text-xl font-semibold mt-8 mb-4">Schedule</h3>
                <ul className="space-y-2 mb-8">
                  {event.lineup.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-eventPurple rounded-full mt-2 mr-3"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                
                <h3 className="text-xl font-semibold mt-8 mb-4">Location</h3>
                <div className="rounded-md overflow-hidden h-64 mb-4">
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <MapPin className="h-10 w-10 text-gray-400 mr-2" />
                    <span className="text-gray-500">Campus Map</span>
                  </div>
                </div>
                <p className="text-gray-700">{event.address}</p>
                
                <h3 className="text-xl font-semibold mt-8 mb-4">FAQs</h3>
                <div className="space-y-4">
                  {event.faqs.map((faq, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4">
                      <h4 className="font-medium text-lg mb-2">{faq.question}</h4>
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-wrap gap-3 mt-8">
                  {event.tags.map((tag, index) => (
                    <span key={index} className="bg-eventGray px-3 py-1 rounded-full text-sm text-gray-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-2xl font-semibold mb-4">Organizer</h2>
                <p className="text-lg mb-2">{event.organizer}</p>
                <p className="text-gray-600 mb-4">Contact: studentcouncil@college.edu</p>
              </div>
            </div>
            
            {/* Ticket/Registration Column */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-semibold">Tickets</h3>
                    <span className="text-2xl font-bold text-eventPurple">
                      {formatPrice(event.price)}
                    </span>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-gray-600 mb-1">Available tickets: {event.availableTickets}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-eventPurple h-2.5 rounded-full" style={{ width: "65%" }}></div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Quantity</label>
                    <div className="flex items-center">
                      <button 
                        onClick={decrementQuantity}
                        className="border border-gray-300 rounded-l-md px-3 py-2 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <input 
                        type="text" 
                        value={ticketQuantity} 
                        readOnly 
                        className="border-t border-b border-gray-300 px-3 py-2 w-16 text-center" 
                      />
                      <button 
                        onClick={incrementQuantity}
                        className="border border-gray-300 rounded-r-md px-3 py-2 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between mb-2">
                      <span>Price ({ticketQuantity} {ticketQuantity === 1 ? 'ticket' : 'tickets'})</span>
                      <span>{formatPrice(event.price * ticketQuantity)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatPrice(event.price * ticketQuantity)}</span>
                    </div>
                  </div>
                  
                  <Button onClick={handleBuyTickets} className="w-full bg-eventPurple hover:bg-eventPurple-dark mb-4 h-12 text-lg">
                    {isLoggedIn ? (
                      <>
                        <Ticket className="h-5 w-5 mr-2" />
                        Get Tickets
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5 mr-2" />
                        Sign in to purchase
                      </>
                    )}
                  </Button>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Save
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Event Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-eventPurple mt-0.5 mr-3" />
                      <div>
                        <p className="font-medium">Date and Time</p>
                        <p className="text-gray-700">{event.date}</p>
                        <p className="text-gray-700">{event.startTime} - {event.endTime}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-eventPurple mt-0.5 mr-3" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-gray-700">{event.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Ticket className="h-5 w-5 text-eventPurple mt-0.5 mr-3" />
                      <div>
                        <p className="font-medium">Ticket Policies</p>
                        <p className="text-gray-700">Non-refundable. Transferable up to 24h before event.</p>
                      </div>
                    </div>
                  </div>
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
