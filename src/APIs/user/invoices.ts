import { toast } from "react-toastify";
import { appAxios } from "../../axios/appAxios";
import { getInvoicesUrl } from "../../URLs/invoicesUrls";

export const fetchInvoices = async (
  filters: { fromDate: string; toDate: string; userId: string },
  role: string
) => {
  try {
    const payload: any = {
      filter: {},
    };

    if (filters.fromDate || filters.toDate) {
      payload.filter.date = {
        ...(filters.fromDate && { from: filters.fromDate }),
        ...(filters.toDate && { to: filters.toDate }),
      };
    }

    if (role === "admin" && filters.userId) {
      payload.filter.user_id = filters.userId;
    }

    const res = await appAxios.get(getInvoicesUrl, {
      params: {},
    });
    if (res.status == 200 && res.data) {
      return res.data;
    }
  } catch (err: any) {
    toast.error(err?.message || "Error fetching invoices");
  }
};
