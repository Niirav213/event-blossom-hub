
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Loader2, CreditCard, Check } from "lucide-react";
import { ticketsService } from "@/services/api";
import { toast } from "sonner";

interface TicketPaymentProps {
  eventId: string;
  eventName: string;
  price: number;
  onPaymentComplete: () => void;
  onCancel: () => void;
}

const TicketPayment = ({ 
  eventId, 
  eventName, 
  price, 
  onPaymentComplete, 
  onCancel 
}: TicketPaymentProps) => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format with spaces every 4 digits
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19);
  };

  const formatExpiry = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Add slash after first two digits
    if (digits.length > 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    
    return digits;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardNumber || !expiry || !cvc || !name) {
      toast.error("Please fill all payment details");
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real app, you would process the payment with a payment provider
      // For this demo, we'll just simulate a successful payment
      
      // Purchase ticket
      await ticketsService.purchaseTicket({
        event_id: eventId,
        quantity: quantity
      });
      
      // Show success
      setSuccess(true);
      toast.success("Ticket purchased successfully!");
      
      // Notify parent component
      setTimeout(() => {
        onPaymentComplete();
      }, 1500);
      
    } catch (error: any) {
      toast.error(error.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-4 text-center">
        <div className="bg-green-50 p-6 rounded-lg mb-4 flex flex-col items-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">Payment Successful</h3>
          <p className="text-green-700">Your ticket purchase has been confirmed</p>
        </div>
        <Button onClick={onPaymentComplete} className="w-full">
          View My Tickets
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">
        Purchase Ticket: {eventName}
      </h3>
      
      <div className="bg-gray-50 p-4 rounded-md mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">Event</span>
          <span className="font-medium">{eventName}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">Quantity</span>
          <div className="flex items-center">
            <Button 
              type="button"
              size="sm" 
              variant="outline" 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-8 w-8 p-0"
            >
              -
            </Button>
            <span className="mx-3 min-w-8 text-center">{quantity}</span>
            <Button 
              type="button"
              size="sm" 
              variant="outline" 
              onClick={() => setQuantity(quantity + 1)}
              className="h-8 w-8 p-0"
            >
              +
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">Price per ticket</span>
          <span>₹{price.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-200 my-2 pt-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total</span>
            <span className="font-bold">₹{(price * quantity).toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
              Cardholder Name
            </label>
            <Input
              id="cardName"
              placeholder="Name on card"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <div className="relative">
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                required
              />
              <CreditCard className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                maxLength={5}
                required
              />
            </div>
            <div>
              <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 mb-1">
                CVC
              </label>
              <Input
                id="cvc"
                placeholder="123"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                maxLength={3}
                required
              />
            </div>
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-eventPurple hover:bg-eventPurple-dark"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ₹${(price * quantity).toFixed(2)}`
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TicketPayment;
