import { toast } from "react-toastify";
import { appAxios } from "../../axios/appAxios";
import { orders_url } from "../../URLs/user";
export const getAllOrders = async (
  page = 1,
  limit = 100,
  filters = {},
  subPath = ""
) => {
  try {
    // We don't need to manually build the URL with query parameters anymore
    // as we'll pass all parameters through the axios params object

    // Pass page, limit, and all filter parameters directly to axios
    const response = await appAxios.get(orders_url + subPath, {
      params: {
        page,
        limit,
        // Spread all filters into the params object
        ...filters,
      },
    });
    const responseData = response.data;
    if (!response.data) {
      console.error("API Error Response:", responseData);
    }

    // Handle empty response gracefully
    return {
      orders: responseData.orders || [],
      total: responseData.total || 0,
    };
  } catch (error) {
    console.error("Error in getAllOrders API call:", error);
    throw error;
  }
};

export const createOrder = async (data: any) => {
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

export const updateOrder = async (id: string, data: any) => {
  try {
    data.product_sku_id = undefined;
    await appAxios.patch(`${orders_url}/${id}`, data);
    toast.success("Order updated successfully!");
    return true;
  } catch (error: any) {
    toast.error("Failed to update order.");
    throw error;
  }
};

export const getAllFilters = async (flagged = false) => {
  try {
    const response = await appAxios.get(`${orders_url}/filters`, {
      withCredentials: true,
      params: {
        flagged,
      },
    });
    return response.data as any;
  } catch (error: any) {
    toast.error("Failed to fetch pools.");
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
