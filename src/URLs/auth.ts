import { drpCrmBaseUrl } from "../axios/urls";

export const loginURL = `${drpCrmBaseUrl}/auth/login`;
export const registerURL = `${drpCrmBaseUrl}/auth/register`;
export const verifyURL = `${drpCrmBaseUrl}/auth/verify`;
export const resendOtpURL = `${drpCrmBaseUrl}/auth/resendOtp`;
export const forgotPasswordURL = `${drpCrmBaseUrl}/auth/forgotPassword`;
export const resetPasswordURL = `${drpCrmBaseUrl}/auth/resetPassword`;
export const fetchOrdersURL = `${drpCrmBaseUrl}/auth/fetchOrders`;
