import navigationData from "@/services/mockData/navigationLinks.json";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const navigationService = {
  getAll: async () => {
    await delay(100);
    return [...navigationData];
  },
  
  scrollToPricing: () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
};

export default navigationService;