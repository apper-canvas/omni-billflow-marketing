import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Container from "@/components/atoms/Container";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import pricingService from "@/services/api/pricingService";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apperClient, setApperClient] = useState(null);
  
  const [formData, setFormData] = useState({
    email: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardName: "",
    billingAddress: "",
    city: "",
    postalCode: "",
    country: ""
  });

  useEffect(() => {
    loadPlans();
    initializeApperClient();
  }, []);

  const initializeApperClient = () => {
    if (window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      const client = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      setApperClient(client);
    }
  };

  const loadPlans = async () => {
    try {
      const data = await pricingService.getAll();
      setPlans(data);
      
      const preselected = location.state?.selectedPlan;
      if (preselected) {
        setSelectedPlan(preselected);
      } else if (data.length > 0) {
        setSelectedPlan(data[0]);
      }
    } catch (err) {
      toast.error("Failed to load pricing plans");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    if (name === "cardNumber") {
      formattedValue = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
    } else if (name === "cardExpiry") {
      formattedValue = value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2").substr(0, 5);
    } else if (name === "cardCvc") {
      formattedValue = value.replace(/\D/g, "").substr(0, 4);
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return false;
    }
    
    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, "").length < 13) {
      toast.error("Please enter a valid card number");
      return false;
    }
    
    if (!formData.cardExpiry || formData.cardExpiry.length !== 5) {
      toast.error("Please enter a valid expiry date (MM/YY)");
      return false;
    }
    
    if (!formData.cardCvc || formData.cardCvc.length < 3) {
      toast.error("Please enter a valid CVC");
      return false;
    }
    
    if (!formData.cardName) {
      toast.error("Please enter the cardholder name");
      return false;
    }
    
    if (!formData.billingAddress || !formData.city || !formData.postalCode || !formData.country) {
      toast.error("Please complete all billing address fields");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!apperClient) {
      toast.error("Payment system not initialized");
      return;
    }

    setLoading(true);

    try {
      const result = await apperClient.functions.invoke(
        import.meta.env.VITE_CREATE_STRIPE_PAYMENT_INTENT,
        {
          body: JSON.stringify({
            amount: selectedPlan.price * 100,
            currency: "usd",
            planName: selectedPlan.name,
            email: formData.email,
            cardNumber: formData.cardNumber.replace(/\s/g, ""),
            cardExpiry: formData.cardExpiry,
            cardCvc: formData.cardCvc,
            cardName: formData.cardName,
            billingAddress: {
              line1: formData.billingAddress,
              city: formData.city,
              postal_code: formData.postalCode,
              country: formData.country
            }
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const responseData = await result.json();

      if (responseData.success) {
        toast.success("Payment successful!");
        navigate('/success', { 
          state: { 
            plan: selectedPlan,
            paymentIntentId: responseData.paymentIntentId,
            email: formData.email
          } 
        });
      } else {
        console.info(`apper_info: Got an error in this function: ${import.meta.env.VITE_CREATE_STRIPE_PAYMENT_INTENT}. The response body is: ${JSON.stringify(responseData)}.`);
        toast.error(responseData.error || "Payment failed. Please try again.");
      }
    } catch (error) {
      console.info(`apper_info: Got this error in this function: ${import.meta.env.VITE_CREATE_STRIPE_PAYMENT_INTENT}. The error is: ${error.message}`);
      toast.error("An error occurred processing your payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-primary mb-8 transition-colors"
          >
            <ApperIcon name="ArrowLeft" size={20} />
            Back to Home
          </button>

          <h1 className="text-4xl font-bold mb-8">Complete Your Purchase</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Payment Information</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Plan
                    </label>
                    <select
                      value={selectedPlan.Id}
                      onChange={(e) => {
                        const plan = plans.find(p => p.Id === parseInt(e.target.value));
                        setSelectedPlan(plan);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {plans.map(plan => (
                        <option key={plan.Id} value={plan.Id}>
                          {plan.name} - ${plan.price}/month
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        maxLength="5"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVC
                      </label>
                      <input
                        type="text"
                        name="cardCvc"
                        value={formData.cardCvc}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Billing Address</h3>
                    
                    <div className="space-y-4">
                      <input
                        type="text"
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleInputChange}
                        placeholder="Street Address"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="City"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          placeholder="Postal Code"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="Country"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </span>
                    ) : (
                      `Pay $${selectedPlan.price}/month`
                    )}
                  </Button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8">
                <h3 className="text-xl font-bold mb-4">Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-semibold">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Billing</span>
                    <span className="font-semibold">Monthly</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">${selectedPlan.price}/mo</span>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <ApperIcon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-900">
                      14-day free trial included. Cancel anytime before the trial ends.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold mb-2">What's Included:</h4>
                  {selectedPlan.features.slice(0, 5).map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <ApperIcon name="Check" size={16} className="text-primary flex-shrink-0 mt-1" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}