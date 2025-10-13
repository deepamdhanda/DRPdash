import { toast } from "react-toastify";
import { appAxios } from "../axios/appAxios";
import { pincode_url } from "../URLs/pincode";

export const pincodeDetails = async (data: any) => {
    try {
        const apiRes = await appAxios.get(pincode_url, { params: data });
        if (apiRes) {
            return apiRes.data
        } else {
            throw new Error("Something went wrong! Please try again.");
        }
    } catch (error: any) {
        toast.error(error.message || "something went wrong");
        return false
    }
};
