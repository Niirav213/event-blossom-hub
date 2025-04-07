
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { SearchIcon, Menu, X, Calendar, Ticket, LogIn, LogOut, User, UserPlus, Plus, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-eventPurple" />
            <span className="text-2xl font-bold text-eventPurple">CollegeEventHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/events" className="text-gray-700 hover:text-eventPurple transition-colors">
              Events
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/tickets" className="text-gray-700 hover:text-eventPurple transition-colors">
                  My Tickets
                </Link>
                <Link to="/create-event" className="text-gray-700 hover:text-eventPurple transition-colors">
                  Host Event
                </Link>
              </>
            )}
            <Link to="/about" className="text-gray-700 hover:text-eventPurple transition-colors">
              About
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search events..."
                className="pl-8 pr-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-eventPurple text-gray-900"
              />
              <SearchIcon className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
            </div>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-eventPurple text-eventPurple hover:bg-eventPurple hover:text-white flex items-center"
                    >
                      <User className="h-4 w-4 mr-1" />
                      {user?.name?.split(' ')[0]}
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/tickets')}>
                      <Ticket className="h-4 w-4 mr-2" />
                      My Tickets
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-500 focus:text-red-500"
                      onClick={logout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="outline" className="border-eventPurple text-eventPurple hover:bg-eventPurple hover:text-white">
                  <Link to="/sign-up">
                    <UserPlus className="h-4 w-4 mr-1" />
                    Sign Up
                  </Link>
                </Button>
                <Button asChild className="bg-eventPurple hover:bg-eventPurple-dark">
                  <Link to="/sign-in">
                    <LogIn className="h-4 w-4 mr-1" />
                    Sign In
                  </Link>
                </Button>
              </div>
            )}
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
              >
                Events
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/tickets" 
                    className="text-gray-700 hover:text-eventPurple transition-colors py-2"
                  >
                    <Ticket className="h-4 w-4 inline mr-2" />
                    My Tickets
                  </Link>
                  <Link 
                    to="/create-event" 
                    className="text-gray-700 hover:text-eventPurple transition-colors py-2"
                  >
                    <Plus className="h-4 w-4 inline mr-2" />
                    Host Event
                  </Link>
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="text-gray-700 hover:text-eventPurple transition-colors py-2"
                    >
                      <Calendar className="h-4 w-4 inline mr-2" />
                      Admin Dashboard
                    </Link>
                  )}
                </>
              ) : null}
              
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-eventPurple transition-colors py-2"
              >
                About
              </Link>
              
              <div className="relative mt-2">
                <input
                  type="text"
                  placeholder="Search events..."
                  className="w-full pl-8 pr-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-eventPurple text-gray-900"
                />
                <SearchIcon className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
              </div>
              
              {isAuthenticated ? (
                <div className="pt-2 border-t mt-2">
                  <div className="flex items-center mb-2">
                    <User className="h-5 w-5 text-eventPurple mr-2" />
                    <span className="text-sm font-medium">{user?.name}</span>
                  </div>
                  <Button 
                    onClick={logout}
                    className="w-full bg-red-500 hover:bg-red-600 text-white"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="pt-2 border-t mt-2 space-y-2">
                  <Button asChild className="w-full bg-eventPurple hover:bg-eventPurple-dark">
                    <Link to="/sign-in">
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full border-eventPurple text-eventPurple hover:bg-eventPurple hover:text-white">
                    <Link to="/sign-up">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
