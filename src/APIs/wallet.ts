import { toast } from "react-toastify";
import { appAxios } from "../axios/appAxios";
import { wallets_url, walletRecharge_url } from "../URLs/dash";
import { Wallet } from "../screens/dashboard/Wallets";


// Declare Razorpay on the window object
declare global {
    interface Window {
        Razorpay: any;
    }
}
export const getAllWallets = async () => {
    try {
        const response = await appAxios.get(wallets_url, {
            withCredentials: true,
        });
        return response.data as Wallet[];
    } catch (error: any) {
        toast.error("Failed to fetch wallets.");
        throw error;
    }
};

export const verifyPayment = async (wallet_recharge_id: any, response: any) => {
    try {
        const response1 = await appAxios.put(walletRecharge_url + `/${wallet_recharge_id}`, response);
        console.log("Payment response:", response1.data);
    }
    catch (error: any) {
        console.error("Error updating payment:", error);
        toast.error("Failed to update payment.");
    }
}

export const makePayment = async (amount: any, pool: any) => {
    try {
        amount = Math.round(amount * 100); // Convert to paise (1 INR = 100 paise)
        const currency = 'INR'; // Assuming INR for Indian Rupees
        const response = await appAxios.post(walletRecharge_url, {
            amount: amount, // Amount in rupees
            currency: currency,
            pool_id: pool, // Pool name or ID
        });
        const { _id: wallet_recharge_id, razorpay_order_id: order_id } = response.data;

        // Set up RazorPay options
        const options = {
            key: "rzp_live_stL91oujHW3VLL", // Replace with your RazorPay Key ID
            amount: amount,
            currency: currency,
            name: "OrderzUp",
            description: `Add ₹${amount} to ${pool}`,
            image: "https://orderzup.com/wp-content/uploads/2025/05/logo-orderzup-real.png",
            order_id: order_id,
            handler: async (response: any) => {
                verifyPayment(wallet_recharge_id, response);
            },
            prefill: {
                name: "John Doe",
                email: "john.doe@example.com",
                contact: "9999999999",
            },
            theme: {
                color: "#3399cc",
            },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();

    }
    catch (error: any) {
        toast.error("Failed to make payment.");
        throw error;
    }
}

export const createWallet = async (data: any) => {
    try {
        // console.log(data)
        // return 0;
        const response = await appAxios.post(wallets_url, data);
        toast.success("Wallet created successfully!");
        return response.data;
    } catch (error: any) {
        toast.error("Failed to create wallet.");
        throw error;
    }
};

export const updateWallet = async (id: string, data: any) => {
    try {
        const response = await appAxios.patch(`${wallets_url}/${id}`, data);
        toast.success("Wallet updated successfully!");
        return response.data;
    } catch (error: any) {
        toast.error("Failed to update wallet.");
        throw error;
    }
};

export const deleteWallet = async (id: string) => {
    try {
        await appAxios.delete(`${wallets_url}/${id}`);
        toast.success("Wallet deleted successfully!");
    } catch (error: any) {
        toast.error("Failed to delete wallet.");
        throw error;
    }
};
