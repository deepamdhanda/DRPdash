import { toast } from "react-toastify";
import { appAxios } from "../../axios/appAxios";
import { customerAddress_url } from "../../URLs/user";

export const createCustomerAddress = async (data: any) => {
  try {
    // console.log(data)
    // return 0;
    const response = await appAxios.post(customerAddress_url, data);
    toast.success("CustomerAddress created successfully!");
    return response.data;
  } catch (error: any) {
    toast.error(
      "Failed to create customerAddress. Error: " +
        (error.response?.data?.message || error.message)
    );
    throw error;
  }
};

export const updateCustomerAddress = async (id: string, data: any) => {
  try {
    const response = await appAxios.patch(`${customerAddress_url}/${id}`, data);
    toast.success("Customer Address updated successfully!");
    return response.data;
  } catch (error: any) {
    toast.error(
      "Failed to update customerAddress. Error: " +
        (error.response?.data?.message || error.message)
    );
    throw error;
  }
};