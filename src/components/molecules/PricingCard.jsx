import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

export default function PricingCard({ plan }) {
  const navigate = useNavigate();
  const isPopular = plan.popular;

  const handleGetStarted = () => {
    navigate('/checkout', { state: { selectedPlan: plan } });
  };

  return (
    <div
      className={cn(
        "relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 flex flex-col",
        isPopular && "border-2 border-primary transform scale-105"
      )}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-primary text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-5xl font-bold text-primary">${plan.price}</span>
          <span className="text-gray-600">/month</span>
        </div>
        <p className="text-gray-600 mt-2">{plan.description}</p>
      </div>

      <ul className="space-y-4 mb-8 flex-grow">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <ApperIcon
              name="Check"
              size={20}
              className="text-primary flex-shrink-0 mt-0.5"
            />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        size="lg"
        variant={isPopular ? "primary" : "secondary"}
        className="w-full"
        onClick={handleGetStarted}
      >
        Get Started
      </Button>
    </div>
  );
}