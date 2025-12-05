import { toast } from "react-toastify";
import { appAxios } from "../../axios/appAxios";
import { warehouses_url } from "../../URLs/user";
export const getAllWarehouses = async (
  page: number = 1,
  limit: number = 100
) => {
  try {
    const response = await appAxios.get(
      `${warehouses_url}?page=${page}&limit=${limit}`
    );
    return { data: response.data.data as any[], total: response.data.total };
  } catch (error: any) {
    toast.error("Failed to fetch warehouses.");
    throw error;
  }
};

export const createWarehouse = async (data: any) => {
  try {
    // console.log(data)
    // return 0;
    const response = await appAxios.post(warehouses_url, data);
    toast.success("Warehouse created successfully!");
    return response.data;
  } catch (error: any) {
    toast.error("Failed to create warehouse.");
    throw error;
  }
};

export const updateWarehouse = async (id: string, data: any) => {
  try {
    const response = await appAxios.patch(`${warehouses_url}/${id}`, data);
    toast.success("Warehouse updated successfully!");
    return response.data;
  } catch (error: any) {
    toast.error("Failed to update warehouse.");
    throw error;
  }
};

export const deleteWarehouse = async (id: string) => {
  try {
    await appAxios.delete(`${warehouses_url}/${id}`);
    toast.success("Warehouse deleted successfully!");
  } catch (error: any) {
    toast.error("Failed to delete warehouse.");
    throw error;
  }
};

export const updateStatus = async (id: string) => {
  try {
    const { data } = await appAxios.put(`${warehouses_url}/${id}`);
    toast.success("Status updated successfully!");
    return data;
  } catch (err) {
    toast.error("Failed to update status");
    throw err;
  }
};
