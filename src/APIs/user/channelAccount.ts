import { toast } from "react-toastify";
import { appAxios } from "../../axios/appAxios";
import { channelAccounts_url } from "../../URLs/user";
import { ChannelAccount } from "../../screens/user/ChannelAccounts";

export const getAllChannelAccounts = async (
  page: number = 1,
  limit: number = 100
) => {
  try {
    const response = await appAxios.get(
      `${channelAccounts_url}?page=${page}&limit=${limit}`
    );
    return {
      data: response.data.data as ChannelAccount[],
      total: response.data.total,
    };
  } catch (error: any) {
    toast.error(
      "Failed to fetch channelAccounts. Error: " +
        (error.response?.data?.message || error.message)
    );
    throw error;
  }
};

export const createChannelAccount = async (data: any) => {
  try {
    // console.log(data)
    // return 0;
    const response = await appAxios.post(channelAccounts_url, data);
    toast.success("ChannelAccount created successfully!");
    return response.data;
  } catch (error: any) {
    toast.error(
      "Failed to create channelAccount. Error: " +
        (error.response?.data?.message || error.message)
    );
    throw error;
  }
};

export const updateChannelAccount = async (id: string, data: any) => {
  try {
    const response = await appAxios.patch(`${channelAccounts_url}/${id}`, data);
    toast.success("ChannelAccount updated successfully!");
    return response.data;
  } catch (error: any) {
    toast.error(
      "Failed to update channelAccount. Error: " +
        (error.response?.data?.message || error.message)
    );
    throw error;
  }
};

export const deleteChannelAccount = async (id: string) => {
  try {
    await appAxios.delete(`${channelAccounts_url}/${id}`);
    toast.success("ChannelAccount deleted successfully!");
  } catch (error: any) {
    toast.error(
      "Failed to delete channelAccount. Error: " +
        (error.response?.data?.message || error.message)
    );
    throw error;
  }
};

export const deactivateAccount = async (id: string) => {
  try {
    const { data } = await appAxios.put(`${channelAccounts_url}/${id}`);
    toast.success("ChannelAccount deleted successfully!");
    return data;
  } catch (err) {
    toast.error("Failed to update status.");
    throw err;
  }
};
