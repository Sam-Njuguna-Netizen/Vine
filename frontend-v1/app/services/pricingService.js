import axios from "../api/axios";

export const getPricingPlan = async () => {
    const response = await axios.get(`/api/super-admin/pricing-plans`);
    return response.data;
};

export const getPublicPricingPlan = async () => {
    const response = await axios.get(`/api/pricing-plan`);
    return response.data;
};

export const updatePricingPlan = async (data) => {
    const response = await axios.post(`/api/super-admin/pricing-plans`, data);
    return response.data;
};
