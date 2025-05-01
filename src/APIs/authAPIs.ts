import { toast } from "react-toastify";
import { appAxios } from "../axios/appAxios";
import { loginURL, registerURL } from "../URLs/auth";
import { LoginFormData } from "../screens/auth/LoginPage";
import Cookies from "js-cookie";
import { RegisterFormData } from "../screens/auth/RegisterPage";

export const LoginUser = async (userdata: LoginFormData, next: () => void) => {
  try {
    const apiRes = await appAxios.post(loginURL, userdata, {
      withCredentials: true,
    });
    if (apiRes.data) {
      // console.log(apiRes.data.token)
      Cookies.set("username", apiRes.data.name, { expires: 1000 });
      Cookies.set("authToken", apiRes.data.token.split(' ')[1], { expires: 1000 });

      next();
    }
  } catch (error: any) {
    toast.error(error.message || "something went wrong");
  }
};

export const RegisterUser = async (userdata: RegisterFormData, next: () => void) => {
  try {
    const apiRes = await appAxios.post(registerURL, userdata, {
      withCredentials: true,
    });
    if (apiRes.data) {
      // console.log(apiRes.data.token)
      Cookies.set("username", apiRes.data.name, { expires: 1000 });
      Cookies.set("authToken", apiRes.data.token.split(' ')[1], { expires: 1000 });
    }
    next();
  } catch (error: any) {
    toast.error(error.message || "something went wrong");
  }
} 