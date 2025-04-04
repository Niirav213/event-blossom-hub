
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CalendarCheck } from "lucide-react";

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically navigate to the events page with filters
    console.log('Search:', { searchQuery, location, category });
  };
  
  return (
    <div className="bg-gradient-to-r from-eventPurple to-eventPurple-dark text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Amazing College Events
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Find and book tickets for the best events happening at Manipal Institute of Technology Bengaluru Campus
          </p>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white p-2 md:p-3 rounded-lg shadow-lg flex flex-col md:flex-row gap-2 md:gap-3 mb-8">
            <div className="flex-1 relative">
              <Input 
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full h-11 text-gray-900 font-medium"
              />
              <Search className="h-4 w-4 absolute left-3 top-3.5 text-gray-500" />
            </div>
            
            <div className="flex-1 relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 pl-3 pr-8 rounded-md border border-input bg-background text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Categories</option>
                <option value="music">Music</option>
                <option value="technology">Technology</option>
                <option value="arts">Arts</option>
                <option value="sports">Sports</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
              </select>
            </div>
            
            <div className="flex-1 relative">
              <Input 
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full h-11 text-gray-900 font-medium"
              />
            </div>
            
            <Button type="submit" className="h-11 px-6 bg-eventTeal hover:bg-eventTeal-dark text-white">
              Search
            </Button>
          </form>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-eventPurple hover:bg-gray-100">
              <Link to="/events">
                <Search className="mr-2 h-5 w-5" />
                Browse Events
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-eventTeal hover:bg-eventTeal-dark">
              <Link to="/create-event">
                <CalendarCheck className="mr-2 h-5 w-5" />
                Host an Event
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
