import { toast } from "react-toastify";
import { appAxios } from "../../axios/appAxios";
import { dashboard_url } from "../../URLs/user";

export const getOrdersSummary = async (data: any = {}) => {
  try {
    const response = await appAxios.get(dashboard_url + "/ordersSummary", { params: data });
    return response.data as any[];
  } catch (error: any) {
    toast.error("Failed to fetch Orders Summary.");
    throw error;
  }
};

export const getAccountSummary = async () => {
  try {
    const response = await appAxios.get(dashboard_url + "/accountSummary");
    return response.data as any[];
  } catch (error: any) {
    toast.error("Failed to fetch Account Summary.");
    throw error;
  }
};
