import { toast } from "react-toastify";
import { appAxios } from "../../axios/appAxios";
import { channels_url } from "../../URLs/user";

export const getAllChannels = async () => {
  try {
    const response = await appAxios.get(channels_url);
    return response.data as any[];
  } catch (error: any) {
    toast.error("Failed to fetch channels.");
    throw error;
  }
};

// export const createChannel = async (data: Channel) => {
//   try {
//     // console.log(data)
//     // return 0;
//     const response = await appAxios.post(channels_url, data);
//     toast.success("Channel created successfully!");
//     return response.data;
//   } catch (error: any) {
//     toast.error("Failed to create channel.");
//     throw error;
//   }
// };

// export const updateChannel = async (id: string, data: Channel) => {
//   try {
//     const response = await appAxios.patch(`${channels_url}/${id}`, data);
//     toast.success("Channel updated successfully!");
//     return response.data;
//   } catch (error: any) {
//     toast.error("Failed to update channel.");
//     throw error;
//   }
// };

// export const deleteChannel = async (id: string) => {
//   try {
//     await appAxios.delete(`${channels_url}/${id}`);
//     toast.success("Channel deleted successfully!");
//   } catch (error: any) {
//     toast.error("Failed to delete channel.");
//     throw error;
//   }
// };
