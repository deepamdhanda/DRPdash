import { toast } from "react-toastify";
import { appAxios } from "../axios/appAxios";
import { fetchOrdersURL } from "../URLs/auth";

export const fetchNewOrders = async () => {
  try {
    return true
  } catch (error: any) {
    toast.error("Failed to fetch orders.");
    return false
    throw error;
  }
};

// export const createOrder = async (data: Order) => {
//   try {
//     // console.log(data)
//     // return 0;
//     const response = await appAxios.post(orders_url, data);
//     toast.success("Order created successfully!");
//     return response.data;
//   } catch (error: any) {
//     toast.error("Failed to create order.");
//     throw error;
//   }
// };

// export const updateOrder = async (id: string, data: Order) => {
//   try {
//     const response = await appAxios.patch(`${orders_url}/${id}`, data);
//     toast.success("Order updated successfully!");
//     return response.data;
//   } catch (error: any) {
//     toast.error("Failed to update order.");
//     throw error;
//   }
// };

// export const deleteOrder = async (id: string) => {
//   try {
//     await appAxios.delete(`${orders_url}/${id}`);
//     toast.success("Order deleted successfully!");
//   } catch (error: any) {
//     toast.error("Failed to delete order.");
//     throw error;
//   }
// };
