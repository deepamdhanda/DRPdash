import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { drpCrmBaseUrl } from "../../axios/urls";

const brandColors = {
  navy: "#000434",
  orange: "#F5891E",
  white: "#FFFFFF",
};

interface ShippingRate {
  partner: string;
  rate: number;
  estimatedDays?: string;
  service?: string;
}

const ShippingCalculator: React.FC = () => {
  const [pickupPincode, setPickupPincode] = useState<string>("");
  const [deliveryPincode, setDeliveryPincode] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isCOD, setIsCOD] = useState<boolean>(false);
  const [length, setLength] = useState<string>("");
  const [breadth, setBreadth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [chargeableWeight, setChargeableWeight] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);

  // Auto-calculate chargeable weight
  useEffect(() => {
    const l = parseFloat(length) || 0;
    const b = parseFloat(breadth) || 0;
    const h = parseFloat(height) || 0;
    const w = parseFloat(weight) || 0;

    const volumetricWeight = (l * b * h) / 5000;
    const calculatedWeight = Math.max(volumetricWeight, w);
    setChargeableWeight(calculatedWeight);
  }, [length, breadth, height, weight]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShippingRates([]);

    // Validation
    if (!pickupPincode || pickupPincode.length !== 6) {
      toast.error("Please enter a valid 6-digit pickup pincode");
      return;
    }
    if (!deliveryPincode || deliveryPincode.length !== 6) {
      toast.error("Please enter a valid 6-digit delivery pincode");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (chargeableWeight <= 0) {
      toast.error("Please enter valid dimensions or weight");
      return;
    }

    setLoading(true);

    try {
      // Replace with your actual API endpoint
      const response = await fetch(
        `${drpCrmBaseUrl}/user/courier/check-delivery`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            pickup_pincode: pickupPincode,
            delivery_pincode: deliveryPincode,
            amount: parseFloat(amount),
            is_cod: isCOD,
            length: parseFloat(length),
            breadth: parseFloat(breadth),
            height: parseFloat(height),
            weight: parseFloat(weight),
            chargeable_weight: chargeableWeight,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch shipping rates");
      }

      const data = await response.json();
      console.log(data.data);
      // Adjust this based on your actual API response structure
      const couriers = data?.data || [];

      const shippingRates1 = couriers.map((courier: any) => {
        const name = courier.courier_name.toLowerCase();

        let service: ShippingRate["service"] = "Standard";
        if (name.includes("air")) service = "Air";
        else if (name.includes("surface")) service = "Surface";

        return {
          partner: courier.courier_name,
          rate: Number(courier.total_amount), // final payable amount
          estimatedDays: courier.estimated_delivery_days
            ? `${courier.estimated_delivery_days} days`
            : "N/A",
          service,
        };
      });
      console.log(shippingRates1);
      setShippingRates(shippingRates1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          borderRadius: "10px",
          backgroundColor: brandColors.white,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: brandColors.navy,
            color: brandColors.white,
            fontWeight: "700",
            fontSize: "1.5rem",
            textAlign: "center",
            borderRadius: "10px 10px 0 0",
            padding: "1rem",
            position: "relative",
          }}
        >
          OU AI Powered - Shipping Charge Calculator
          <span
            style={{
              position: "absolute",
              right: "20px",
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: brandColors.white,
              color: brandColors.navy,
              padding: "4px 12px",
              borderRadius: "4px",
              fontSize: "0.875rem",
              fontWeight: "600",
            }}
          >
            v1.0
          </span>
        </div>

        <div style={{ padding: "2rem" }}>
          <div onSubmit={handleSubmit}>
            {/* Location Details */}
            <h5
              style={{
                marginBottom: "1rem",
                borderBottom: `2px solid ${brandColors.orange}`,
                paddingBottom: "5px",
                color: brandColors.navy,
              }}
            >
              Location Details
            </h5>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                  }}
                >
                  <span
                    style={{
                      textDecoration: "underline dotted",
                      cursor: "help",
                    }}
                    title="6-digit pincode where shipment will be picked up"
                  >
                    Pickup Pincode
                  </span>
                </label>
                <input
                  type="text"
                  value={pickupPincode}
                  onChange={(e) =>
                    setPickupPincode(
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  placeholder="Enter 6-digit pincode"
                  maxLength={6}
                  required
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "1rem",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                  }}
                >
                  <span
                    style={{
                      textDecoration: "underline dotted",
                      cursor: "help",
                    }}
                    title="6-digit pincode where shipment will be delivered"
                  >
                    Delivery Pincode
                  </span>
                </label>
                <input
                  type="text"
                  value={deliveryPincode}
                  onChange={(e) =>
                    setDeliveryPincode(
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  placeholder="Enter 6-digit pincode"
                  maxLength={6}
                  required
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "1rem",
                  }}
                />
              </div>
            </div>

            {/* Order Details */}
            <h5
              style={{
                marginBottom: "1rem",
                borderBottom: `2px solid ${brandColors.orange}`,
                paddingBottom: "5px",
                color: brandColors.navy,
              }}
            >
              Order Details
            </h5>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                  }}
                >
                  <span
                    style={{
                      textDecoration: "underline dotted",
                      cursor: "help",
                    }}
                    title="Total order value in rupees"
                  >
                    Amount (₹)
                  </span>
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                  required
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "1rem",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                  }}
                >
                  Payment Method
                </label>
                <div style={{ paddingTop: "0.5rem" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isCOD}
                      onChange={(e) => setIsCOD(e.target.checked)}
                      style={{ marginRight: "0.5rem", cursor: "pointer" }}
                    />
                    <span title="Check if this is a COD order">
                      Cash on Delivery (COD)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Package Details */}
            <h5
              style={{
                marginBottom: "1rem",
                borderBottom: `2px solid ${brandColors.orange}`,
                paddingBottom: "5px",
                color: brandColors.navy,
              }}
            >
              Package Details
            </h5>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                  }}
                >
                  <span
                    style={{
                      textDecoration: "underline dotted",
                      cursor: "help",
                    }}
                    title="Package length in centimeters"
                  >
                    Length (cm)
                  </span>
                </label>
                <input
                  type="number"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  min="0"
                  step="0.1"
                  placeholder="cm"
                  required
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "1rem",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                  }}
                >
                  <span
                    style={{
                      textDecoration: "underline dotted",
                      cursor: "help",
                    }}
                    title="Package breadth in centimeters"
                  >
                    Breadth (cm)
                  </span>
                </label>
                <input
                  type="number"
                  value={breadth}
                  onChange={(e) => setBreadth(e.target.value)}
                  min="0"
                  step="0.1"
                  placeholder="cm"
                  required
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "1rem",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                  }}
                >
                  <span
                    style={{
                      textDecoration: "underline dotted",
                      cursor: "help",
                    }}
                    title="Package height in centimeters"
                  >
                    Height (cm)
                  </span>
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  min="0"
                  step="0.1"
                  placeholder="cm"
                  required
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "1rem",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                  }}
                >
                  <span
                    style={{
                      textDecoration: "underline dotted",
                      cursor: "help",
                    }}
                    title="Actual package weight in kilograms"
                  >
                    Weight (kg)
                  </span>
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="kg"
                  required
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "1rem",
                  }}
                />
              </div>
            </div>

            {/* Chargeable Weight Display */}
            <div
              style={{
                backgroundColor: brandColors.orange,
                color: brandColors.white,
                padding: "1rem",
                borderRadius: "4px",
                marginBottom: "2rem",
              }}
            >
              <strong>Chargeable Weight:</strong> {chargeableWeight.toFixed(2)}{" "}
              kg
              <br />
              <small>
                Calculated as max(Volumetric Weight, Actual Weight) where
                Volumetric Weight = L × B × H ÷ 5000
              </small>
            </div>

            <div style={{ textAlign: "center" }}>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  backgroundColor: brandColors.navy,
                  color: brandColors.white,
                  border: "none",
                  padding: "12px 40px",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  borderRadius: "4px",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Fetching Rates..." : "Calculate Shipping Charges"}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && !loading && shippingRates.length === 0 && (
            <div
              style={{
                backgroundColor: "#f8d7da",
                color: "#721c24",
                padding: "1rem",
                borderRadius: "4px",
                marginTop: "1.5rem",
                border: "1px solid #f5c6cb",
              }}
            >
              {error}
            </div>
          )}

          {/* Results Table */}
          {shippingRates.length > 0 && (
            <div style={{ marginTop: "2.5rem" }}>
              <h5
                style={{
                  marginBottom: "1rem",
                  borderBottom: `2px solid ${brandColors.orange}`,
                  paddingBottom: "5px",
                  color: brandColors.navy,
                }}
              >
                Available Shipping Partners
              </h5>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    backgroundColor: brandColors.white,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: brandColors.navy,
                        color: brandColors.white,
                      }}
                    >
                      <th
                        style={{
                          padding: "0.75rem",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Shipping Partner
                      </th>
                      <th
                        style={{
                          padding: "0.75rem",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Service Type
                      </th>
                      <th
                        style={{
                          padding: "0.75rem",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Estimated Delivery
                      </th>
                      <th
                        style={{
                          padding: "0.75rem",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Shipping Rate (₹)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shippingRates.map((rate, index) => (
                      <tr
                        key={index}
                        style={{
                          backgroundColor:
                            index % 2 === 0 ? "#f9f9f9" : brandColors.white,
                        }}
                      >
                        <td
                          style={{
                            padding: "0.75rem",
                            fontWeight: "600",
                            border: "1px solid #ddd",
                          }}
                        >
                          {rate.partner}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem",
                            border: "1px solid #ddd",
                          }}
                        >
                          {rate.service || "Standard"}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem",
                            border: "1px solid #ddd",
                          }}
                        >
                          {rate.estimatedDays || "N/A"}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem",
                            fontWeight: "700",
                            color: brandColors.orange,
                            border: "1px solid #ddd",
                          }}
                        >
                          ₹{rate.rate.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div
                style={{
                  textAlign: "center",
                  marginTop: "1rem",
                  color: "#666",
                  fontSize: "0.875rem",
                }}
              >
                * Rates are subject to change based on actual package dimensions
                and courier partner policies
              </div>
            </div>
          )}

          <footer
            style={{
              textAlign: "center",
              marginTop: "2rem",
              color: brandColors.orange,
              fontWeight: "700",
            }}
          >
            OU AI Powered &copy; 2025
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ShippingCalculator;
