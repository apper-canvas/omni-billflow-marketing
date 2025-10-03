import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Container from "@/components/atoms/Container";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { plan, paymentIntentId, email } = location.state || {};

  useEffect(() => {
    if (!plan) {
      navigate('/');
    }
  }, [plan, navigate]);

  if (!plan) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Container>
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <ApperIcon name="Check" size={40} className="text-green-600" />
            </motion.div>

            <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
            <p className="text-xl text-gray-600 mb-8">
              Thank you for subscribing to BillFlow {plan.name}
            </p>

            <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold mb-4">Subscription Details</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-semibold">{plan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price</span>
                  <span className="font-semibold">${plan.price}/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="font-semibold">{email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID</span>
                  <span className="font-mono text-sm">{paymentIntentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trial Period</span>
                  <span className="font-semibold">14 days</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
              <div className="flex items-start gap-3">
                <ApperIcon name="Info" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="font-semibold text-green-900 mb-1">What's Next?</p>
                  <p className="text-sm text-green-800">
                    A confirmation email has been sent to {email}. You can start using all {plan.name} features immediately.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full"
                onClick={() => navigate('/')}
              >
                Go to Dashboard
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="w-full"
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Need help? <a href="#contact" className="text-primary hover:underline">Contact our support team</a>
            </p>
          </motion.div>
        </div>
      </Container>
    </div>
  );
}