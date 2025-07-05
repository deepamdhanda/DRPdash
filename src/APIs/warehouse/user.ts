import { toast } from "react-toastify";
import { appAxios } from "../../axios/appAxios";
import { user_url } from "../../URLs/user";
export const getUser = async (email: string) => {
  try {
    const apiRes = email ? await appAxios.get(user_url + `?email=${email}`) : await appAxios.get(user_url);
    if (apiRes.data) {
      return apiRes.data;
    }
  } catch (error: any) {
    toast.error(error.message || "something went wrong");
  }
};
