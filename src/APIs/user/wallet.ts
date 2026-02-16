import { toast } from "react-toastify";
import { appAxios } from "../../axios/appAxios";
import { wallets_url, walletRecharge_url } from "../../URLs/user";
import { TWalletRecharge, Wallet } from "../../screens/user/Wallets";

// Declare Razorpay on the window object
declare global {
  interface Window {
    Razorpay: any;
  }
}
interface IWalletrechargeResponse {
  data: TWalletRecharge[];
  pagination: {
    limit: number;
    page: number;
    pages: number;
    total: number;
  };
}

export const getAllWallets = async (page: number = 1, limit: number = 100) => {
  try {
    const response = await appAxios.get(
      `${wallets_url}?page=${page}&limit=${limit}`,
      {
        withCredentials: true,
      }
    );
    return { data: response.data.data as Wallet[], total: response.data.total };
  } catch (error: any) {
    toast.error("Failed to fetch wallets.");
    throw error;
  }
};
export const getAllWalletsRecharges = async (
  page: number,
  limit: number,
  transactionId = "",
  poolId = "",
  startDate: Date | null = null,
  endDate: Date | null = null
) => {
  try {
    const response = await appAxios.get(walletRecharge_url, {
      params: {
        page,
        limit,
        wallet_rechargeId: transactionId,
        poolId,
        startDate,
        endDate,
      },
    });
    return response.data as IWalletrechargeResponse;
  } catch (error: any) {
    toast.error("Failed to fetch wallets.");
    throw error;
  }
};

export const verifyPayment = async (wallet_recharge_id: any, response: any) => {
  try {
    const response1 = await appAxios.put(
      walletRecharge_url + `/${wallet_recharge_id}`,
      response
    );
    console.log("Payment response:", response1.data);
    toast.success(response1.data);
    return true;
  } catch (error: any) {
    console.error("Error updating payment:", error);
    toast.error("Failed to update payment: " + error.message);
    throw error;
  }
};

export const makePayment = async (
  amount: any,
  pool: any,
  coupon: string
): Promise<boolean> => {
  try {
    amount = Math.round(amount * 100); // Convert to paise
    const currency = "INR";

    const response = await appAxios.post(walletRecharge_url, {
      amount,
      currency,
      pool_id: pool,
      coupon,
    });

    const { _id: wallet_recharge_id, razorpay_order_id: order_id } =
      response.data;

    return new Promise((resolve) => {
      const options = {
        key: "rzp_live_RYVEYLfEZUVkWA",
        currency,
        name: "OrderzUp",
        description: `Add ₹${amount / 100} to ${pool}`,
        image:
          "https://orderzup.com/wp-content/uploads/2025/05/logo-orderzup-real.png",
        order_id,
        handler: async (response: any) => {
          try {
            await verifyPayment(wallet_recharge_id, response);
            resolve(true); // ✅ Payment succeeded
          } catch (error) {
            toast.error("Payment verification failed.");
            resolve(false); // ❌ Verification failed
          }
        },
        prefill: {
          // name: "John Doe",
          // email: "john.doe@example.com",
          // contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment popup closed.");
            resolve(false); // ❌ User closed Razorpay
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    });
  } catch (error: any) {
    console.error(error);
    toast.error("Failed to make payment.");
    return false; // ❌ Initial request or setup failed
  }
};
export const transferPayment = async (
  amount: any,
  remittanceId: any
): Promise<any> => {
  try {
    const response = await appAxios.post(walletRecharge_url + "/transfer", {
      amount,
      remittance_id: remittanceId,
    });
    toast.success("Transfered Successfully.");
    return response;
  } catch (error: any) {
    console.error(error);
    toast.error("Failed to make payment." + error);
    return false; // ❌ Initial request or setup failed
  }
};

export const createWallet = async (data: any) => {
  try {
    // console.log(data)
    // return 0;
    const response = await appAxios.post(wallets_url, data);
    toast.success("Wallet created successfully!");
    return response.data;
  } catch (error: any) {
    toast.error("Failed to create wallet.");
    throw error;
  }
};

export const updateWallet = async (id: string, data: any) => {
  try {
    const response = await appAxios.patch(`${wallets_url}/${id}`, data);
    toast.success("Wallet updated successfully!");
    return response.data;
  } catch (error: any) {
    toast.error("Failed to update wallet.");
    throw error;
  }
};

export const deleteWallet = async (id: string) => {
  try {
    await appAxios.delete(`${wallets_url}/${id}`);
    toast.success("Wallet deleted successfully!");
  } catch (error: any) {
    toast.error("Failed to delete wallet.");
    throw error;
  }
};
