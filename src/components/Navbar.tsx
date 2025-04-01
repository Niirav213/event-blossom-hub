
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { SearchIcon, Menu, X, Calendar, MapPin, Users, Ticket } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-eventPurple" />
            <span className="text-2xl font-bold text-eventPurple">EventBlossom</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/events" className="text-gray-700 hover:text-eventPurple transition-colors">
              Events
            </Link>
            <Link to="/venues" className="text-gray-700 hover:text-eventPurple transition-colors">
              Venues
            </Link>
            <Link to="/organizers" className="text-gray-700 hover:text-eventPurple transition-colors">
              Organizers
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-eventPurple transition-colors">
              About Us
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search events..."
                className="pl-8 pr-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-eventPurple"
              />
              <SearchIcon className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
            </div>
            <Button className="bg-eventPurple hover:bg-eventPurple-dark">
              Create Event
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? (
              <X className="h-6 w-6 text-eventPurple" />
            ) : (
              <Menu className="h-6 w-6 text-eventPurple" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t mt-3 animate-fade-in">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/events" 
                className="text-gray-700 hover:text-eventPurple transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Events
              </Link>
              <Link 
                to="/venues" 
                className="text-gray-700 hover:text-eventPurple transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Venues
              </Link>
              <Link 
                to="/organizers" 
                className="text-gray-700 hover:text-eventPurple transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Organizers
              </Link>
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-eventPurple transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <div className="relative mt-2">
                <input
                  type="text"
                  placeholder="Search events..."
                  className="w-full pl-8 pr-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-eventPurple"
                />
                <SearchIcon className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
              </div>
              <Button className="bg-eventPurple hover:bg-eventPurple-dark w-full mt-2">
                Create Event
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
