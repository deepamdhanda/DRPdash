import { toast } from "react-toastify";
import { appAxios } from "../axios/appAxios";
import { finances_url } from "../URLs/dash";
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
