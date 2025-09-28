import { toast } from "react-toastify";
import { appAxios } from "../../axios/appAxios";
import { getInvoicesUrl, getInvoicesUsersUrl } from "../../URLs/invoicesUrls";

export const fetchInvoices = async (filters: {
  fromDate: string;
  toDate: string;
  userId: string;
}) => {
  try {
    const payload: any = {
      filter: {},
    };

    if (filters.userId) {
      payload.filter.user_id = filters.userId;
    }
    if (filters.fromDate || filters.toDate) {
      payload.filter.date = {
        ...(filters.fromDate && { from: filters.fromDate }),
        ...(filters.toDate && { to: filters.toDate }),
      };
    }

    const res = await appAxios.get(getInvoicesUrl, {
      params: payload,
    });
    if (res.status == 200 && res.data) {
      return res.data;
    }
  } catch (err: any) {
    toast.error(err?.message || "Error fetching invoices");
  }
};

export interface InvoiceUser {
  _id: string;
  name: string;
  email: string;
}

// Function return type is Promise<InvoiceUser[]>
export const fetchInvoiceUsers = async (): Promise<InvoiceUser[]> => {
  try {
    const apiRes = await appAxios.get<{ users: InvoiceUser[] }>(
      getInvoicesUsersUrl
    );

    if (apiRes.data.users) {
      return apiRes.data.users;
    } else {
      return [];
    }
  } catch (error: any) {
    return [];
  }
};
