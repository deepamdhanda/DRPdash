import { toast } from "react-toastify";
import { appAxios } from "../axios/appAxios";
import { loginURL } from "../URLs/auth";
import { LoginFormData } from "../screens/auth/Login/LoginPage";

export const LoginUser = async (userdata: LoginFormData, next: () => void) => {
  try {
    const apiRes = await appAxios.post(loginURL, userdata, {
      withCredentials: true,
    });
    if (apiRes.data) {
      next();
    }
  } catch (error: any) {
    toast.error(error.message || "something went wrong");
  }
};
