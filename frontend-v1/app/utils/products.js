import axios from '@/app/api/axios';

export const allProductsCategories = async () => {
  try {
    const response = await axios.get('/api/productsCategories');

    if (response.data) {
      return { success: true, categories: response.data };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.errors
          ? error.response.data.errors.join(', ')
          : 'Something went wrong. Please try again.',
    };
  }
};
export const addProductsCategory = async (newData) => {
  try {
    const response = await axios.post('/api/productsCategories', newData);

    if (response.data) {
      return { success: true, categories: response.data };
    }
    return { success: false };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.errors
          ? error.response.data.errors.join(', ')
          : 'Something went wrong. Please try again.',
    };
  }
};

export const updateProductsCategory = async (newData) => {
  try {
    const response = await axios.put(`/api/productsCategories/${newData.id}`, newData);

    if (response.data.category) {
      return { success: true, categories: response.data.category };
    }
    return { success: false };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.errors
          ? error.response.data.errors.join(', ')
          : 'Something went wrong. Please try again.',
    };
  }
};

export const deleteProductsCategory = async (categoryId) => {
  try {
    const response = await axios.delete(`/api/productsCategories/${categoryId}`);

    if (response.status == 200) {
      return { success: true };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.errors
          ? error.response.data.errors.join(', ')
          : 'Something went wrong. Please try again.',
    };
  }
};

export const addProduct = async (newData) => {
  try {
    const response = await axios.post('/api/products', newData);

    if (response.data) {
      return { success: true, product: response.data };
    }
    return { success: false };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.errors
          ? error.response.data.errors.join(', ')
          : 'Something went wrong. Please try again.',
    };
  }
}