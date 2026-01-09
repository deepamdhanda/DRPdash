import { toast } from "react-toastify";
import { appAxios } from "../axios/appAxios";
import { lead_url, score_url } from "../URLs/landingPage";

export const registerLead = async (data: any) => {
    try {
        const apiRes = await appAxios.post(lead_url, data);
        if (apiRes) {
            toast.success("Thank you for registering! We will get in touch with you soon.");
            return true
        } else {
            throw new Error("Something went wrong! Please try again.");
        }
    } catch (error: any) {
        toast.error(error.message || "something went wrong");
        return false
    }
};

export const getScore = async (data: any) => {
    try {
        const apiRes = await appAxios.post(score_url, data);
        if (apiRes) {
            // toast.success("Thank you for registering! We will get in touch with you soon.");
            return apiRes.data
        } else {
            throw new Error("Something went wrong! Please try again.");
        }
    } catch (error: any) {
        toast.error(error.message || "something went wrong");
        return false
    }
};
