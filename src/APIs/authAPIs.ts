import { toast } from "react-toastify";
import { appAxios } from "../axios/appAxios";
import { loginURL, registerURL, verifyURL, resendOtpURL, forgotPasswordURL, resetPasswordURL } from "../URLs/auth";
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
    alert(JSON.stringify(error));
    toast.error(error.message || "something went wrong");
  }
};

export const RegisterUser = async (userdata: RegisterFormData, next: (email: string) => void) => {
  try {
    const apiRes = await appAxios.post(registerURL, userdata, {
      withCredentials: true,
    });
    if (apiRes.data) {
      // console.log(apiRes.data.token)
      // Cookies.set("username", apiRes.data.name, { expires: 1000 });
      // Cookies.set("authToken", apiRes.data.token.split(' ')[1], { expires: 1000 });
    }
    next(apiRes.data.email);
  } catch (error: any) {
    toast.error(error.message || "something went wrong");
  }
}

export const VerifyUser = async (userdata: any, next: () => void) => {
  try {
    const apiRes = await appAxios.post(verifyURL, userdata, {
      withCredentials: true,
    });
    if (apiRes.data) {
      // console.log(apiRes.data.token)
      Cookies.set("username", apiRes.data.name, { expires: 1000 });
      Cookies.set("authToken", apiRes.data.token.split(' ')[1], { expires: 1000 });
    }
    next();
  } catch (error: any) {
    console.log(error)
    toast.error(error.message || "something went wrong");
  }
}
export const ResendOTP = async (userdata: any, next: () => void) => {
  try {
    await appAxios.post(resendOtpURL, userdata, {
      withCredentials: true,
    });
    toast.success("OTP sent successfully.")
    next();
  } catch (error: any) {
    console.log(error)
    toast.error(error.message || "something went wrong");
  }
}
export const ForgotPassword = async (userdata: any, next: () => void) => {
  try {
    console.log("sdfsa")
    await appAxios.post(forgotPasswordURL, userdata, {
      withCredentials: true,
    });
    toast.success("Email sent successfully.")
    next();
  } catch (error: any) {
    console.log(error)
    toast.error(error.message || "something went wrong");
  }
}
export const ResetPassword = async (userdata: any, next: () => void) => {
  try {
    await appAxios.post(resetPasswordURL, userdata, {
      withCredentials: true,
    });
    toast.success("Password Updated Successfully")
    next();
  } catch (error: any) {
    console.log(error)
    toast.error(error.message || "something went wrong");
  }
}