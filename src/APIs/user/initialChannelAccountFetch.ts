import { toast } from "react-toastify";
import { appAxios } from "../../axios/appAxios";
import { initialChannelAccountFetchs_url } from "../../URLs/user";


export const initialChannelAccountFetch = async (channel_id: any, type: any = "orders") => {
  try {
    // console.log(data)
    // return 0;
    const response = await appAxios.get(initialChannelAccountFetchs_url, {
      params: {
        channel_account_id: channel_id, type
      }
    });
    toast.success(`Fetched new ${type}!`);
    return response.data;
  } catch (error: any) {
    toast.error(`Failed to fetch the ${type}. ` + error);
    throw error;
  }
};

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
