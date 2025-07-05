import { toast } from "react-toastify";
import { appAxios } from "../../axios/appAxios";
import { amazonS3s_url } from "../../URLs/warehouse";


export const createAmazonS3 = async (fileName: any, file: any) => {
  try {
    // console.log(data)
    // return 0;
    const response = await appAxios.post(amazonS3s_url, { fileName, fileContent: file });
    toast.success("Image uploaded successfully!");
    return response.data;
  } catch (error: any) {
    toast.error("Failed to upload the Image.");
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
