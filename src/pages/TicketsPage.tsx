
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Download, ExternalLink, AlertCircle, Ticket } from "lucide-react";

const TicketsPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  
  // Sample ticket data
  const upcomingTickets = [
    {
      id: "1",
      eventName: "Annual College Fest",
      date: "May 12, 2024",
      time: "5:00 PM - 10:00 PM",
      location: "Main Auditorium",
      ticketType: "VIP Access",
      ticketNumber: "T-20240512-001",
      qrCode: "https://api.qrserver.com/v1/create-qr-code/?data=T20240512001&size=150x150"
    },
    {
      id: "2",
      eventName: "Tech Workshop: AI Fundamentals",
      date: "May 18, 2024",
      time: "10:00 AM - 2:00 PM",
      location: "Computer Science Building",
      ticketType: "Standard Entry",
      ticketNumber: "T-20240518-042",
      qrCode: "https://api.qrserver.com/v1/create-qr-code/?data=T20240518042&size=150x150"
    }
  ];
  
  const pastTickets = [
    {
      id: "3",
      eventName: "Spring Concert",
      date: "Apr 20, 2024",
      time: "7:00 PM - 11:00 PM",
      location: "Campus Grounds",
      ticketType: "General Admission",
      ticketNumber: "T-20240420-115",
      qrCode: "https://api.qrserver.com/v1/create-qr-code/?data=T20240420115&size=150x150"
    }
  ];
  
  // Check login status
  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
    
    if (!loggedIn) {
      navigate("/sign-in");
    }
  }, [navigate]);
  
  if (!isLoggedIn) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-eventPurple text-white py-10">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">My Tickets</h1>
            <p className="text-lg">Access and manage your event tickets</p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming" className="text-base px-6">Upcoming Events</TabsTrigger>
              <TabsTrigger value="past" className="text-base px-6">Past Events</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              {upcomingTickets.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {upcomingTickets.map((ticket) => (
                    <div key={ticket.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-semibold mb-2">{ticket.eventName}</h3>
                            <div className="space-y-1.5 mb-4">
                              <div className="flex items-center text-gray-600">
                                <Calendar className="h-4 w-4 text-eventPurple mr-2" />
                                <span>{ticket.date}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Clock className="h-4 w-4 text-eventPurple mr-2" />
                                <span>{ticket.time}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <MapPin className="h-4 w-4 text-eventPurple mr-2" />
                                <span>{ticket.location}</span>
                              </div>
                            </div>
                            <div className="mb-4">
                              <div className="text-sm text-gray-500">Ticket Type</div>
                              <div className="font-medium">{ticket.ticketType}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Ticket #</div>
                              <div className="font-medium">{ticket.ticketNumber}</div>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <img src={ticket.qrCode} alt="QR Code" className="h-24 w-24 mb-2" />
                            <div className="text-xs text-gray-500">Scan for entry</div>
                          </div>
                        </div>
                        
                        <div className="mt-6 flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <Download className="h-4 w-4 mr-1" /> Download
                          </Button>
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/events/${ticket.id}`} className="flex items-center gap-1">
                              <ExternalLink className="h-4 w-4 mr-1" /> Event Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <Ticket className="h-16 w-16 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No upcoming tickets</h3>
                  <p className="text-gray-600 mb-6">You don't have any tickets for upcoming events yet.</p>
                  <Button asChild>
                    <Link to="/events">Browse Events</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="past">
              {pastTickets.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pastTickets.map((ticket) => (
                    <div key={ticket.id} className="bg-white rounded-lg shadow-md overflow-hidden opacity-75">
                      <div className="p-6 relative">
                        <div className="absolute top-0 right-0 left-0 bottom-0 flex items-center justify-center">
                          <div className="transform rotate-45 text-red-500 text-4xl font-bold border-4 border-red-500 px-4 py-2 rounded">
                            PAST
                          </div>
                        </div>
                        <div className="flex justify-between items-start">
                          <div className="relative z-10">
                            <h3 className="text-xl font-semibold mb-2">{ticket.eventName}</h3>
                            <div className="space-y-1.5 mb-4">
                              <div className="flex items-center text-gray-600">
                                <Calendar className="h-4 w-4 text-eventPurple mr-2" />
                                <span>{ticket.date}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Clock className="h-4 w-4 text-eventPurple mr-2" />
                                <span>{ticket.time}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <MapPin className="h-4 w-4 text-eventPurple mr-2" />
                                <span>{ticket.location}</span>
                              </div>
                            </div>
                            <div className="mb-4">
                              <div className="text-sm text-gray-500">Ticket Type</div>
                              <div className="font-medium">{ticket.ticketType}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Ticket #</div>
                              <div className="font-medium">{ticket.ticketNumber}</div>
                            </div>
                          </div>
                          
                          <div className="text-center relative z-10">
                            <img src={ticket.qrCode} alt="QR Code" className="h-24 w-24 mb-2 opacity-50" />
                          </div>
                        </div>
                        
                        <div className="mt-6 flex flex-wrap gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link to={`/events/${ticket.id}`} className="flex items-center gap-1">
                              <ExternalLink className="h-4 w-4 mr-1" /> Event Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <Ticket className="h-16 w-16 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">No past tickets</h3>
                  <p className="text-gray-600 mb-6">Your attended events will appear here.</p>
                  <Button asChild>
                    <Link to="/events">Browse Events</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TicketsPage;
