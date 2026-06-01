import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getAllPools } from "../../APIs/user/pool";
import { makePayment } from "../../APIs/user/wallet";
import { appAxios } from "../../axios/appAxios";
import { drpCrmBaseUrl } from "../../axios/urls";
import { useNavigate } from "react-router-dom";

const GetStartedRecharge = () => {
  const [pools, setPools] = useState<any[]>([]);
  const [selectedPool, setSelectedPool] = useState<string>("");
  const [loadingPools, setLoadingPools] = useState(true);
  const [amount, setAmount] = useState<number | "">("");
  const [coupon, setCoupon] = useState<string>("");
  const [bonus, setBonus] = useState<number>(0);
  const [isValidating, setIsValidating] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const response = await getAllPools();
        setPools(response.data);
        if (response.data?.length > 0) {
          setSelectedPool(response.data[0]._id);
        }
      } catch (error) {
        console.error("Error fetching pools", error);
        toast.error("Failed to load wallet pools");
      } finally {
        setLoadingPools(false);
      }
    };
    fetchPools();
  }, []);

  const handleApplyCoupon = async () => {
    if (!coupon || !amount) {
      toast.error("Please enter an amount and coupon code");
      return;
    }
    setIsValidating(true);
    setBonus(0);

    try {
      const { data } = await appAxios.post(`${drpCrmBaseUrl}/user/coupon`, {
        amount: Number(amount),
        coupon: coupon,
      });

      if (data.data.discount > 0) {
        setBonus(data.data.discount);
        toast.success(`Coupon applied! You get ₹${data.data.discount} extra.`);
      } else {
        toast.warning("Coupon valid but returned 0 bonus.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid Coupon Code");
      setBonus(0);
    } finally {
      setIsValidating(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPool) {
      toast.error("Please select a wallet pool.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setIsPaying(true);
    try {
      const res = await makePayment(Number(amount), selectedPool, coupon);
      if (res) {
        toast.success("Payment initiated successfully!");
        navigate("/user");
      }
    } catch (error: any) {
      console.error("Error during payment:", error);
      toast.error(error.response?.data?.message || "Payment failed");
    } finally {
      setIsPaying(false);
    }
  };

  const handleAmountChange = (val: string) => {
    setAmount(val === "" ? "" : Number(val));
    if (bonus > 0) {
      setBonus(0);
    }
  };

  const numericAmount = Number(amount) || 0;
  const totalCredit = numericAmount + bonus;

  return (
    <div className="w-full  mx-auto bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
      <div className="p-6 space-y-6">
        {/* Modern Dynamic Balance Card */}
        <div className="bg-linear-to-br from-orange-300 to-orange-400 rounded-xl p-5 text-white shadow-md relative overflow-hidden">
          <div className="text-xs text-neutral-100 font-medium tracking-wide uppercase">
            Estimated Total Allocation
          </div>
          <div className="text-3xl font-bold mt-1 tracking-tight">
            ₹{totalCredit.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-neutral-100 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Ready for instant platform remittance
          </div>
        </div>

        {/* Pool Selection Interface */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
            Select Wallet Pool Account
          </label>

          {loadingPools ? (
            <div className="h-12 bg-gray-50 border border-gray-100 rounded-xl animate-pulse flex items-center px-4">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          ) : pools.length === 0 ? (
            <div className="p-3 text-xs text-center text-amber-600 bg-amber-50 border border-amber-100 rounded-xl font-medium">
              No remittance pools configured. Please complete setup.
            </div>
          ) : (
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
              {pools.map((pool) => {
                const isSelected = selectedPool === pool._id;
                return (
                  <div
                    key={pool._id}
                    onClick={() => setSelectedPool(pool._id)}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all duration-150 ${
                      isSelected
                        ? "border-[#F5891E] bg-[#FFF7ED] shadow-sm"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          isSelected ? "border-[#F5891E]" : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-[#F5891E]" />
                        )}
                      </div>
                      <span
                        className={`text-sm font-semibold transition-colors ${
                          isSelected ? "text-[#F5891E]" : "text-gray-700"
                        }`}
                      >
                        {pool.name ||
                          pool.poolName ||
                          "Default Billing Account"}
                      </span>
                    </div>
                    <span className="text-[10px] bg-gray-100 text-gray-500 font-mono px-2 py-0.5 rounded-md">
                      ID: {pool._id?.slice(-6).toUpperCase() || "N/A"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Amount Input Wrapper */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
            Recharge Amount
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span className="text-gray-500 font-semibold text-base">₹</span>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="Enter custom amount"
              className="w-full pl-8 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-base font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F5891E]/20 focus:border-[#F5891E] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Quick Select Smart Pills */}
        <div className="grid grid-cols-4 gap-2">
          {[500, 1000, 2000, 5000].map((val) => {
            const isSelected = Number(amount) === val;
            return (
              <button
                key={val}
                type="button"
                onClick={() => handleAmountChange(val.toString())}
                className={`py-2.5 px-1 rounded-xl text-xs font-bold transition-all border text-center ${
                  isSelected
                    ? "border-[#F5891E] bg-[#FFF7ED] text-[#F5891E] shadow-sm shadow-orange-500/10"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                +₹{val}
              </button>
            );
          })}
        </div>

        {/* Promo Actions */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
            Offers & Promo Codes
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                placeholder="ENTER PROMO CODE"
                disabled={bonus > 0}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold tracking-wider placeholder:tracking-normal uppercase outline-none focus:ring-2 focus:ring-[#F5891E]/20 focus:border-[#F5891E] disabled:bg-gray-50 disabled:text-gray-400 transition-all"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={
                !coupon || !amount || isValidating || isPaying || bonus > 0
              }
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-sm ${
                bonus > 0
                  ? "bg-emerald-600 text-white cursor-default"
                  : "bg-[#000434] text-white hover:bg-opacity-90 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              }`}
            >
              {bonus > 0 ? "Applied" : "Apply"}
            </button>
          </div>

          {bonus > 0 && (
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 mt-1">
              <span className="flex items-center justify-center w-4 h-4 bg-emerald-100 rounded-full text-[10px]">
                ✓
              </span>
              Promo applied successfully! Extra credit added.
            </p>
          )}
        </div>

        {/* Itemized Invoice Ledger */}
        <div className="bg-gray-50/70 rounded-xl border border-gray-100 p-4 space-y-3">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Base Recharge</span>
            <span className="font-medium text-gray-900">
              ₹{numericAmount.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Promotional Bonus</span>
            <span className="font-semibold text-emerald-600">
              {bonus > 0 ? `+₹${bonus.toLocaleString("en-IN")}` : "₹0"}
            </span>
          </div>
          <div className="border-t border-dashed border-gray-200 my-1" />
          <div className="flex justify-between items-center text-sm">
            <span className="font-bold text-gray-800">Total Settlement</span>
            <span className="font-extrabold text-lg text-[#F5891E]">
              ₹{totalCredit.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Primary Checkout CTA */}
        <button
          onClick={handlePayment}
          disabled={loadingPools || isPaying || !selectedPool || !amount}
          className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide text-white transition-all shadow-md ${
            loadingPools || isPaying || !selectedPool || !amount
              ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              : "bg-[#F5891E] hover:bg-orange-600 active:transform active:scale-[0.99] shadow-orange-500/10"
          }`}
        >
          {isPaying
            ? "Securing Payment Session..."
            : `Proceed to Pay ₹${numericAmount.toLocaleString("en-IN")}`}
        </button>

        {/* Trust Indicator Footnote */}
        <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 font-medium">
          <svg
            className="w-3.5 h-3.5 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          Encrypted payments routed via Razorpay Gateway
        </div>
      </div>
    </div>
  );
};

export default GetStartedRecharge;
