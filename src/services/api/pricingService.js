import pricingData from "@/services/mockData/pricingPlans.json";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const pricingService = {
  getAll: async () => {
    await delay(100);
    return [...pricingData];
  },

  getById: async (id) => {
    await delay(100);
    const plan = pricingData.find((p) => p.Id === parseInt(id));
    if (!plan) {
      throw new Error("Plan not found");
    }
    return { ...plan };
  }
};

export default pricingService;