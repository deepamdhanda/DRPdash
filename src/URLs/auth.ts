import { drpCrmBaseUrl } from "../axios/urls";

export const loginURL = `${drpCrmBaseUrl}/api/auth/login`;
export const registerURL = `${drpCrmBaseUrl}/api/auth/register`;
export const verifyURL = `${drpCrmBaseUrl}/api/auth/verify`;
export const resendOtpURL = `${drpCrmBaseUrl}/api/auth/resendOtp`;
export const forgotPasswordURL = `${drpCrmBaseUrl}/api/auth/forgotPassword`;
export const resetPasswordURL = `${drpCrmBaseUrl}/api/auth/resetPassword`;
export const fetchOrdersURL = `${drpCrmBaseUrl}/api/auth/fetchOrders`;