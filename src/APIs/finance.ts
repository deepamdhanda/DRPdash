import { toast } from "react-toastify";
import { appAxios } from "../axios/appAxios";
import { finances_url, payment } from "../URLs/dash";
import { Finance } from "../screens/dashboard/Finances";


// Declare Razorpay on the window object
declare global {
    interface Window {
        Razorpay: any;
    }
}
export const getAllFinances = async () => {
    try {
        const response = await appAxios.get(finances_url, {
            withCredentials: true,
        });
        return response.data as Finance[];
    } catch (error: any) {
        toast.error("Failed to fetch finances.");
        throw error;
    }
};

export const makePayment = async () => {
    try {
        const response = await appAxios.post(payment, {
            amount: 1, // Amount in rupees
            currency: 'INR',
        });
        const { id: order_id, amount, currency } = response.data;

        // Set up RazorPay options
        const options = {
            key: "rzp_live_stL91oujHW3VLL", // Replace with your RazorPay Key ID
            amount: amount,
            currency: currency,
            name: "OrderzUp",
            description: "Recharge your Wallet",
            image: "https://example.com/your_logo",
            order_id: order_id,
            handler: (response: any) => {
                alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
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

export const createFinance = async (data: any) => {
    try {
        // console.log(data)
        // return 0;
        const response = await appAxios.post(finances_url, data);
        toast.success("Finance created successfully!");
        return response.data;
    } catch (error: any) {
        toast.error("Failed to create finance.");
        throw error;
    }
};

export const updateFinance = async (id: string, data: any) => {
    try {
        const response = await appAxios.patch(`${finances_url}/${id}`, data);
        toast.success("Finance updated successfully!");
        return response.data;
    } catch (error: any) {
        toast.error("Failed to update finance.");
        throw error;
    }
};

export const deleteFinance = async (id: string) => {
    try {
        await appAxios.delete(`${finances_url}/${id}`);
        toast.success("Finance deleted successfully!");
    } catch (error: any) {
        toast.error("Failed to delete finance.");
        throw error;
    }
};
