import { useEffect, useState } from "react";
import {
  Button,
  Form,
  Card,
  InputGroup,
  Spinner,
  Badge,
} from "react-bootstrap";
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

  // Changed: Amount is now dynamic, not fixed
  const [amount, setAmount] = useState<number | "">("");

  const [coupon, setCoupon] = useState<string>("");

  // Changed: Logic switched from 'discount' to 'bonus' based on 2nd component
  const [bonus, setBonus] = useState<number>(0);

  const [isValidating, setIsValidating] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const navigate = useNavigate();

  // 1. Fetch pools on mount
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

  // 2. Validate Coupon (Logic Updated to Bonus)
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

      // Assuming API returns 'discount' key, but we treat it as bonus based on your Wallets component
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

  // 3. Process Payment
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
      // Logic: User pays the entered amount. The coupon is sent to backend to apply bonus credit.
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

  // Helper to handle amount change and reset coupon if amount changes
  const handleAmountChange = (val: string) => {
    setAmount(Number(val));
    if (bonus > 0) {
      setBonus(0); // Reset bonus if amount changes as % might differ
      // Optional: toast.info("Amount changed, please re-apply coupon");
    }
  };

  const numericAmount = Number(amount) || 0;
  const totalCredit = numericAmount + bonus;

  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <Card
        className="shadow-lg border-0 overflow-hidden"
        style={{ maxWidth: "550px", width: "100%", borderRadius: "15px" }}
      >
        {/* Modern Header */}
        <div
          className="bg-primary p-4 text-white text-center"
          style={{
            background: "linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)",
          }}
        >
          <h4 className="mb-0 fw-bold">Add Money to Wallet</h4>
          <small className="opacity-75">Secure & Instant Recharge</small>
        </div>

        <Card.Body className="p-4 bg-white">
          {/* Row 1: Wallet Pool Selection */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold small text-uppercase text-muted ls-1">
              Select Wallet
            </Form.Label>
            <Form.Select
              value={selectedPool}
              onChange={(e) => setSelectedPool(e.target.value)}
              disabled={loadingPools || isPaying}
              className="py-2"
              style={{ border: "2px solid #e9ecef" }}
            >
              {loadingPools ? (
                <option>Loading pools...</option>
              ) : (
                pools.map((pool: any) => (
                  <option key={pool._id} value={pool._id}>
                    {pool.name} (Cur. Bal: ₹
                    {pool?.wallet_balance?.toFixed(2) || 0})
                  </option>
                ))
              )}
            </Form.Select>
          </Form.Group>

          {/* Row 2: Recharge Amount (Dynamic) */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold small text-uppercase text-muted ls-1">
              Enter Amount
            </Form.Label>
            <InputGroup className="mb-2">
              <InputGroup.Text className="bg-light border-end-0 fw-bold text-muted">
                ₹
              </InputGroup.Text>
              <Form.Control
                type="number"
                placeholder="e.g. 5000"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="py-2 border-start-0 fw-bold text-dark fs-5"
                style={{ border: "2px solid #e9ecef" }}
                disabled={isPaying}
              />
            </InputGroup>
            {/* Quick Select Chips (Optional UI enhancement) */}
            <div className="d-flex gap-2 mt-2">
              {[1000, 2000, 5000].map((val) => (
                <Badge
                  key={val}
                  bg="light"
                  text="dark"
                  className="border px-3 py-2 cursor-pointer user-select-none"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleAmountChange(val.toString())}
                >
                  ₹{val}
                </Badge>
              ))}
            </div>
          </Form.Group>

          {/* Row 3: Coupon Section */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold small text-uppercase text-muted ls-1">
              Promo Code
            </Form.Label>
            <InputGroup>
              <Form.Control
                placeholder="Enter Coupon Code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                disabled={isValidating || isPaying || bonus > 0}
                className="text-uppercase"
                style={{ border: "2px solid #e9ecef" }}
              />
              <Button
                variant={bonus > 0 ? "success" : "outline-primary"}
                onClick={handleApplyCoupon}
                disabled={
                  !coupon || !amount || isValidating || isPaying || bonus > 0
                }
              >
                {isValidating ? (
                  <Spinner size="sm" animation="border" />
                ) : bonus > 0 ? (
                  <i className="bi bi-check-lg"></i>
                ) : (
                  "Apply"
                )}
              </Button>
            </InputGroup>
            {bonus > 0 && (
              <div className="mt-2 small text-success fw-bold fade-in">
                <i className="bi bi-stars me-1"></i> Coupon applied! ₹{bonus}{" "}
                bonus added.
              </div>
            )}
          </Form.Group>

          <hr className="my-4 border-light" />

          {/* Row 4: Summary Breakdown */}
          <div className="bg-light p-3 rounded-3 mb-4">
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Recharge Amount</span>
              <span className="fw-medium">₹{numericAmount.toFixed(2)}</span>
            </div>

            {bonus > 0 && (
              <div className="d-flex justify-content-between mb-2 text-success">
                <span>
                  <i className="bi bi-gift-fill me-1"></i> Bonus Credit
                </span>
                <span className="fw-bold">+ ₹{bonus.toFixed(2)}</span>
              </div>
            )}

            <div className="border-top my-2"></div>

            <div className="d-flex justify-content-between align-items-center">
              <span className="fw-bold text-dark">Total Wallet Credit</span>
              <span className="fw-bold text-primary fs-4">
                ₹{totalCredit.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Pay Button */}
          <Button
            variant="success"
            size="lg"
            className="w-100 text-white fw-bold py-3 shadow-sm"
            onClick={handlePayment}
            disabled={loadingPools || isPaying || !selectedPool || !amount}
            style={{
              background: isPaying ? "#6c757d" : "#198754",
              border: "none",
              transition: "all 0.2s",
            }}
          >
            {isPaying ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Processing Payment...
              </>
            ) : (
              `Pay ₹${numericAmount} Now`
            )}
          </Button>

          <div className="text-center mt-3">
            <small className="text-muted" style={{ fontSize: "0.75rem" }}>
              <i className="bi bi-lock-fill me-1"></i>
              Payments are secured by Razorpay
            </small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default GetStartedRecharge;
