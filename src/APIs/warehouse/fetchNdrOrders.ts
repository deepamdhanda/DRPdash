import { toast } from "react-toastify/unstyled";
import { appAxios } from "../../axios/appAxios";

interface IFetchNDROrdersArgs {
  page: number;
  limit: number;
  from: string;
  to: string;
  search: string;
  channel_id: string;
}
export const fetchNDROrders = async (params: IFetchNDROrdersArgs) => {
  try {
    const apiRes = await appAxios.get("/ndr", { params });
    if (apiRes.status == 200) {
      console.log(apiRes);
      return apiRes.data;
    }
  } catch (error: any) {
    toast.error(error.message);
  }
};
