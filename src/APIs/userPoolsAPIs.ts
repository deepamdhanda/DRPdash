import { toast } from "react-toastify";
import { appAxios } from "../axios/appAxios";
import { userPoolsUrl } from "../URLs/userPoolsUrls";

export const getPools = async () => {
  try {
    const apiRes = await appAxios.get(userPoolsUrl, {});
    if (apiRes.data) {
      return apiRes.data;
    }
  } catch (error: any) {
    toast.error(error.message || "something went wrong");
  }
};
