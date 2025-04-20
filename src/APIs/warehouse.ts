import { toast } from "react-toastify";
import { appAxios } from "../axios/appAxios";
import { warehouses_url } from "../URLs/dash";
import { Warehouse } from "../screens/dashboard/Warehouses";

export const getAllWarehouses = async () => {
  try {
    const response = await appAxios.get(warehouses_url);
    return response.data as Warehouse[];
  } catch (error: any) {
    toast.error("Failed to fetch warehouses.");
    throw error;
  }
};

export const createWarehouse = async (data: Warehouse) => {
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

export const updateWarehouse = async (id: string, data: Warehouse) => {
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
