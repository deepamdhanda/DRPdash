import { toast } from "react-toastify";
import { appAxios } from "../axios/appAxios";
import { orders_url } from "../URLs/dash";
import { Order } from "../screens/dashboard/Orders";

export const getAllOrders = async (page: number = 1, limit: number = 10) => {
  try {
    const response = await appAxios.get(orders_url + `/?page=${page}&limit=${limit}`);
    return response.data as Order[];
  } catch (error: any) {
    toast.error("Failed to fetch orders.");
    throw error;
  }
};

export const createOrder = async (data: Order) => {
  try {
    // console.log(data)
    // return 0;
    const response = await appAxios.post(orders_url, data);
    toast.success("Order created successfully!");
    return response.data;
  } catch (error: any) {
    toast.error("Failed to create order.");
    throw error;
  }
};

export const updateOrder = async (id: string, data: Order) => {
  try {
    const response = await appAxios.patch(`${orders_url}/${id}`, data);
    toast.success("Order updated successfully!");
    return response.data;
  } catch (error: any) {
    toast.error("Failed to update order.");
    throw error;
  }
};

export const deleteOrder = async (id: string) => {
  try {
    await appAxios.delete(`${orders_url}/${id}`);
    toast.success("Order deleted successfully!");
  } catch (error: any) {
    toast.error("Failed to delete order.");
    throw error;
  }
};
