import { toast } from "react-toastify";
import { appAxios } from "../../axios/appAxios";
import { gst_url } from "../../URLs/user";
export const getGST = async (gst: string) => {
  try {
    const apiRes = gst ? await appAxios.get(gst_url + `?gst=${gst}`) : await appAxios.get(gst_url);
    if (apiRes.data) {
      return apiRes.data;
    }
  } catch (error: any) {
    toast.error(error.message || "something went wrong");
  }
};
