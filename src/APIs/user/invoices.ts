import { toast } from "react-toastify";
import { appAxios } from "../../axios/appAxios";
import { getInvoicesUrl, getInvoicesPoolsUrl } from "../../URLs/invoicesUrls";

export const fetchInvoices = async (filters: {
  fromDate: string;
  toDate: string;
  pool_id: string;
  page: number;
  limit: number;
}) => {
  try {
    const payload: any = {
      filter: {},
      page: filters.page,
      limit: filters.limit,
    };

    if (filters.pool_id) {
      payload.filter.pool_id = filters.pool_id;
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

export interface InvoicePool {
  _id: string;
  name: string;
  description: string;
}

// Function return type is Promise<InvoiceUser[]>
export const fetchInvoicePools = async (): Promise<InvoicePool[]> => {
  try {
    const apiRes = await appAxios.get<{ pools: InvoicePool[] }>(
      getInvoicesPoolsUrl
    );

    if (apiRes.data.pools) {
      return apiRes.data.pools;
    } else {
      return [];
    }
  } catch (error: any) {
    return [];
  }
};
