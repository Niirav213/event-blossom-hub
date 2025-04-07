
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEffect, useState } from 'react';

const NavigationControls = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [history, setHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Only update history when location changes normally (not from back/forward)
    if (!isNavigating) {
      // If we've gone back and then navigated to a new page, truncate the history
      if (currentIndex >= 0 && currentIndex < history.length - 1) {
        setHistory(prev => [...prev.slice(0, currentIndex + 1), location.pathname]);
        setCurrentIndex(currentIndex + 1);
      } else {
        // Normal navigation, add to history
        setHistory(prev => [...prev, location.pathname]);
        setCurrentIndex(prev => prev + 1);
      }
    } else {
      // Reset the navigating flag
      setIsNavigating(false);
    }
  }, [location.pathname]);

  const handleBack = () => {
    if (currentIndex > 0) {
      setIsNavigating(true);
      setCurrentIndex(currentIndex - 1);
      navigate(history[currentIndex - 1]);
    }
  };

  const handleForward = () => {
    if (currentIndex < history.length - 1) {
      setIsNavigating(true);
      setCurrentIndex(currentIndex + 1);
      navigate(history[currentIndex + 1]);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex gap-2 bg-white p-2 rounded-lg shadow-md">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleBack} 
              disabled={currentIndex <= 0}
              className="bg-sky-300 hover:bg-sky-400 text-black disabled:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Go Back</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleForward} 
              disabled={currentIndex >= history.length - 1}
              className="bg-sky-300 hover:bg-sky-400 text-black disabled:bg-gray-100"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Go Forward</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default NavigationControls;
