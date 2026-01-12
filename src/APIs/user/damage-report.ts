import { toast } from "react-toastify";
import { appAxios } from "../../axios/appAxios";
import { DamageReport, UploadPart } from "../../screens/user/DamageReport";
import { damgerReport_url } from "../../URLs/user";

export const getAllDamageReports = async (
  page: number = 1,
  limit: number = 100
) => {
  try {
    const response = await appAxios.get(
      `${damgerReport_url}?page=${page}&limit=${limit}`
    );

    return {
      data: response.data.data as DamageReport[],
      total: response.data.total, // backend must return this
    };
  } catch (error: any) {
    toast.error("Failed to fetch Reports.");
    throw error;
  }
};

export const postStartChunks = async (postdata: {
  order_id: string;
  videoId: string;
  damage_type: string;
  description: string;
}) => {
  try {
    const { data } = await appAxios.post(`${damgerReport_url}`, postdata);
    return { uploadId: data.uploadId, id: data.id };
  } catch (err) {
    toast.error("Failed to Post report");
    throw err;
  }
};

export const uploadChunk = async (formData: FormData) => {
  try {
    const { data } = await appAxios.post(
      `${damgerReport_url}/chunk`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return { partNumber: data.partNumber, ETag: data.etag };
  } catch (err) {
    toast.error("Failed to upload chunks");
    throw err;
  }
};

export const completeChunk = async (postData: {
  uploadId: string;
  videoId: string;
  parts: UploadPart[];
  id: string;
}) => {
  try {
    const { data } = await appAxios.post(
      `${damgerReport_url}/complete`,
      postData
    );
    return data;
  } catch (err) {
    toast.error("Failed to compile the video");
    throw err;
  }
};
