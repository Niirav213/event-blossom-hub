
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, Calendar as CalendarIcon, Lock } from "lucide-react";
import { toast } from "sonner";
import { ticketsService } from "@/services/api";

interface TicketPaymentProps {
  eventId: string;
  eventName: string;
  price: number | string;
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
  const [cardName, setCardName] = useState("");
  const [loading, setLoading] = useState(false);
  
  const numericPrice = typeof price === "string" ? parseFloat(price.replace(/[^0-9.]/g, "")) : price;
  
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!cardNumber || !expiry || !cvc || !cardName) {
      toast.error("Please fill in all payment details");
      return;
    }
    
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      toast.error("Please enter a valid 16-digit card number");
      return;
    }
    
    if (expiry.length !== 5 || !expiry.includes("/")) {
      toast.error("Please enter a valid expiry date (MM/YY)");
      return;
    }
    
    if (cvc.length !== 3) {
      toast.error("Please enter a valid 3-digit CVC");
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real app, you'd handle payment processing with Stripe or another provider here
      // For this example, we'll simulate a payment process
      
      // After successful payment, purchase the ticket
      await ticketsService.purchaseTicket(eventId);
      
      toast.success("Payment successful! Your ticket has been purchased.");
      onPaymentComplete();
    } catch (error: any) {
      toast.error(error.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const formatCardNumber = (value: string) => {
    const rawValue = value.replace(/\s/g, "");
    const formatted = rawValue.replace(/(\d{4})(?=\d)/g, "$1 ");
    return formatted.substring(0, 19); // Limit to 16 digits + 3 spaces
  };
  
  const formatExpiry = (value: string) => {
    const rawValue = value.replace(/\D/g, "");
    
    if (rawValue.length <= 2) {
      return rawValue;
    }
    
    return `${rawValue.substring(0, 2)}/${rawValue.substring(2, 4)}`;
  };
  
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Purchase Ticket</CardTitle>
        <CardDescription>
          {eventName} - ${numericPrice.toFixed(2)}
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handlePayment}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardName">Name on Card</Label>
            <Input
              id="cardName"
              placeholder="John Smith"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                className="pl-10"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  className="pl-10"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  maxLength={5}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="cvc"
                  placeholder="123"
                  className="pl-10"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").substring(0, 3))}
                  maxLength={3}
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <p className="text-sm text-gray-500">
              This is a demo payment form. No real payments will be processed.
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          
          <Button 
            type="submit"
            className="bg-eventPurple hover:bg-eventPurple-dark"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </span>
            ) : (
              <span>Pay ${numericPrice.toFixed(2)}</span>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TicketPayment;
