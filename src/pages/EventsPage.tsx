
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Search, Calendar, MapPin, Filter, ChevronDown } from "lucide-react";

// Sample event data - using the same as FeaturedEvents
const SAMPLE_EVENTS = [
  {
    id: "1",
    title: "Summer Music Festival",
    date: "Jul 15, 2024",
    time: "4:00 PM - 11:00 PM",
    location: "Central Park, New York",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    category: "Concerts",
    price: "From $49"
  },
  {
    id: "2",
    title: "Tech Innovation Summit",
    date: "Aug 5, 2024",
    time: "9:00 AM - 5:00 PM",
    location: "Convention Center, San Francisco",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    category: "Technology",
    price: "$199"
  },
  {
    id: "3",
    title: "Food & Wine Festival",
    date: "Sep 10, 2024",
    time: "12:00 PM - 8:00 PM",
    location: "Waterfront Plaza, Chicago",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    category: "Food & Drink",
    price: "$75"
  },
  {
    id: "4",
    title: "Wellness & Yoga Retreat",
    date: "Oct 8, 2024",
    time: "8:00 AM - 6:00 PM",
    location: "Harmony Resort, Colorado",
    image: "https://images.unsplash.com/photo-1599447421416-3414500d18a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    category: "Workshops",
    price: "$120"
  },
  {
    id: "5",
    title: "Art Exhibition - Modern Perspectives",
    date: "Nov 20, 2024",
    time: "10:00 AM - 7:00 PM",
    location: "Gallery 33, Boston",
    image: "https://images.unsplash.com/photo-1561839561-b13bcfe95249?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    category: "Exhibitions",
    price: "$15"
  },
  {
    id: "6",
    title: "Business Networking Mixer",
    date: "Dec 5, 2024",
    time: "6:00 PM - 9:00 PM",
    location: "Downtown Hilton, Seattle",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    category: "Networking",
    price: "$30"
  },
  {
    id: "7",
    title: "Local Community Fundraiser",
    date: "Jul 22, 2024",
    time: "11:00 AM - 4:00 PM",
    location: "Civic Center, Portland",
    image: "https://images.unsplash.com/photo-1593795899768-947c4929449d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2672&q=80",
    category: "Community",
    price: "$10"
  },
  {
    id: "8",
    title: "Craft Beer Festival",
    date: "Aug 15, 2024",
    time: "2:00 PM - 10:00 PM",
    location: "Riverfront Park, Denver",
    image: "https://images.unsplash.com/photo-1505075106905-fb052892c116?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    category: "Food & Drink",
    price: "$45"
  },
  {
    id: "9",
    title: "Photography Workshop",
    date: "Sep 18, 2024",
    time: "10:00 AM - 4:00 PM",
    location: "Downtown Studio, Austin",
    image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2670&q=80",
    category: "Workshops",
    price: "$85"
  }
];

const EventsPage = () => {
  const [events, setEvents] = useState(SAMPLE_EVENTS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories = [
    'All Categories',
    'Concerts',
    'Workshops',
    'Festivals',
    'Sports',
    'Exhibitions',
    'Networking',
    'Food & Drink',
    'Theater',
    'Technology'
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-eventPurple text-white py-10">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Discover Events</h1>
            <p className="text-lg">Find the perfect events for you and your friends.</p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="pl-10 pr-4 py-3 rounded-md border border-gray-200 w-full focus:outline-none focus:ring-2 focus:ring-eventPurple"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Location"
                    className="pl-10 pr-4 py-3 rounded-md border border-gray-200 w-full focus:outline-none focus:ring-2 focus:ring-eventPurple"
                  />
                </div>
                <Button 
                  className="bg-eventPurple hover:bg-eventPurple-dark text-white"
                  onClick={() => {/* Search functionality would go here */}}
                >
                  Search
                </Button>
              </div>
            </div>
            
            <div className="mt-4">
              <Button 
                variant="outline"
                className="flex items-center gap-2 text-gray-600 border-gray-300"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="h-4 w-4" />
                Filter Options
                <ChevronDown className={`h-4 w-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </Button>
              
              {isFilterOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select className="w-full rounded-md border border-gray-200 py-2 px-3">
                      {categories.map((cat, idx) => (
                        <option key={idx} value={cat === 'All Categories' ? '' : cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <select className="w-full rounded-md border border-gray-200 py-2 px-3">
                      <option>Any date</option>
                      <option>Today</option>
                      <option>Tomorrow</option>
                      <option>This weekend</option>
                      <option>This week</option>
                      <option>Next week</option>
                      <option>This month</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <select className="w-full rounded-md border border-gray-200 py-2 px-3">
                      <option>Any price</option>
                      <option>Free</option>
                      <option>Paid</option>
                      <option>Under $25</option>
                      <option>$25 - $50</option>
                      <option>$50 - $100</option>
                      <option>$100+</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <select className="w-full rounded-md border border-gray-200 py-2 px-3">
                      <option>Recommended</option>
                      <option>Date (Soonest)</option>
                      <option>Date (Latest)</option>
                      <option>Price (Low to High)</option>
                      <option>Price (High to Low)</option>
                      <option>Name (A-Z)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">{events.length} events found</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          </div>
          
          <div className="text-center py-8">
            <Button className="bg-eventPurple hover:bg-eventPurple-dark">
              Load More Events
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default EventsPage;
