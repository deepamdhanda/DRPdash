import { toast } from "react-toastify";
import { appAxios } from "../../axios/appAxios";
import { pools_url } from "../../URLs/user";

export const getAllPools = async (page: number = 1, limit: number = 100) => {
  try {
    const response = await appAxios.get(
      `${pools_url}?page=${page}&limit=${limit}`,
      {
        withCredentials: true,
      }
    );
    return {
      data: response.data.data as any[],
      total: response.data.totalRecords,
    };
  } catch (error: any) {
    toast.error("Failed to fetch pools.");
    throw error;
  }
};

export const createPool = async (data: any) => {
  try {
    // console.log(data)
    // return 0;
    const response = await appAxios.post(pools_url, data);
    toast.success("Pool created successfully!");
    return response.data;
  } catch (error: any) {
    toast.error("Failed to create pool.");
    throw error;
  }
};

export const updatePool = async (id: string, data: any) => {
  try {
    const response = await appAxios.patch(`${pools_url}/${id}`, data);
    toast.success("Pool updated successfully!");
    return response.data;
  } catch (error: any) {
    toast.error("Failed to update pool.");
    throw error;
  }
};

export const deletePool = async (id: string) => {
  try {
    await appAxios.delete(`${pools_url}/${id}`);
    toast.success("Pool deleted successfully!");
  } catch (error: any) {
    toast.error("Failed to delete pool.");
    throw error;
  }
};
