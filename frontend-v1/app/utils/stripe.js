// import axios from 'axios'
import axios from "../api/axios";

export const createStripeAccount = async (api = "/api/stripe/connect") => {
  try {
    const response = await axios.post(api, {}, { withCredentials: true });
    console.log(response);
    // if(!response.data.success)
    // {
    //     alert(response.data.message)
    //     return
    // }
    return response.data; // Redirect instructor to Stripe onboarding
  } catch (error) {
    console.log(
      "Error creating Stripe account:",
      error.response?.data?.message
    );
    throw new Error("error creating stripe account");
  }
};
