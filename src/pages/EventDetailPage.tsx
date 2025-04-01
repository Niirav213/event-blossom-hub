
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Share2, Heart, Users, Ticket } from "lucide-react";

const EventDetailPage = () => {
  const { id } = useParams();
  const [ticketQuantity, setTicketQuantity] = useState(1);
  
  // In a real app, we would fetch this data based on the ID
  // For now, we'll use hardcoded data
  const event = {
    id: "1",
    title: "Summer Music Festival",
    description: "Join us for an unforgettable summer music festival featuring top artists from around the world. Experience amazing performances across multiple stages, delicious food vendors, art installations, and more. This family-friendly event has something for everyone!",
    longDescription: "The Summer Music Festival is back for its 5th annual celebration of music, art, and community. Spanning over two days, this year's festival features an incredible lineup of diverse musical talents, from emerging local artists to internationally acclaimed performers.\n\nIn addition to the music, explore art installations created by talented local artists, enjoy culinary delights from our curated food vendors, and participate in various workshops throughout the festival grounds.\n\nThis year's festival is committed to sustainability, with eco-friendly initiatives including reusable cup programs, waste sorting stations, and carbon offset options for attendees.",
    date: "Jul 15, 2024",
    startTime: "4:00 PM",
    endTime: "11:00 PM",
    location: "Central Park",
    address: "Central Park, New York, NY 10022",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    category: "Concerts",
    organizer: "City Events Inc.",
    price: 49,
    availableTickets: 250,
    tags: ["Music", "Festival", "Live Performance", "Outdoor"],
    lineup: [
      "The Groove Masters - 4:30 PM",
      "Electric Dreams - 6:00 PM",
      "Sarah Collins & The Night - 7:30 PM",
      "Headliner: Cosmic Sound - 9:00 PM"
    ],
    faqs: [
      {
        question: "What items are prohibited?",
        answer: "Outside food and drinks, glass containers, professional cameras, and drones are not allowed at the event."
      },
      {
        question: "Is the event family-friendly?",
        answer: "Yes, children under 12 can enter for free when accompanied by a paying adult."
      },
      {
        question: "What happens if it rains?",
        answer: "The event will proceed rain or shine. In case of severe weather, updates will be posted on our website and social media."
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
                
                <h3 className="text-xl font-semibold mt-8 mb-4">Lineup</h3>
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
                    <span className="text-gray-500">Map location</span>
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
                <p className="text-gray-600 mb-4">Event organizer since 2018</p>
                <Link to={`/organizers/${event.organizer}`} className="text-eventPurple hover:text-eventPurple-dark font-medium">
                  View organizer profile
                </Link>
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
                  
                  <Button className="w-full bg-eventPurple hover:bg-eventPurple-dark mb-4 h-12 text-lg">
                    Get Tickets
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
                        <p className="text-gray-700">All sales are final. No refunds.</p>
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
