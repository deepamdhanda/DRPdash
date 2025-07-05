import { toast } from "react-toastify";
import { appAxios } from "../../axios/appAxios";
import { channelAccounts_url } from "../../URLs/user";
import { ChannelAccount } from "../../screens/user/ChannelAccounts";

export const getAllChannelAccounts = async () => {
  try {
    const response = await appAxios.get(channelAccounts_url);
    return response.data as ChannelAccount[];
  } catch (error: any) {
    toast.error("Failed to fetch channelAccounts.");
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
    toast.error("Failed to create channelAccount.");
    throw error;
  }
};

export const updateChannelAccount = async (id: string, data: any) => {
  try {
    const response = await appAxios.patch(`${channelAccounts_url}/${id}`, data);
    toast.success("ChannelAccount updated successfully!");
    return response.data;
  } catch (error: any) {
    toast.error("Failed to update channelAccount.");
    throw error;
  }
};

export const deleteChannelAccount = async (id: string) => {
  try {
    await appAxios.delete(`${channelAccounts_url}/${id}`);
    toast.success("ChannelAccount deleted successfully!");
  } catch (error: any) {
    toast.error("Failed to delete channelAccount.");
    throw error;
  }
};
