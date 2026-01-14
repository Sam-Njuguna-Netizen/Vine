import axios from "@/app/api/axios";

export const applyPromoCode = async (code, cartTotal) => {
    try {
        const response = await axios.post('/api/apply-promo', { code, cartTotal });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getPromoCodes = async () => {
    try {
        const response = await axios.get('/api/admin/promos');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const createPromoCode = async (data) => {
    try {
        const response = await axios.post('/api/admin/promos', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deletePromoCode = async (id) => {
    try {
        const response = await axios.delete(`/api/admin/promos/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
