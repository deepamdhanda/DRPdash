import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Col, Form, Row } from "react-bootstrap";
import Chart from "react-apexcharts";
import { getOrdersSummary } from "../../APIs/user/dashboard";
import { getAllChannelAccounts } from "../../APIs/user/channelAccount";
import { ChannelAccount } from "./ChannelAccounts";
import DatePicker from "react-datepicker";
import { ProductSKU } from "./ProductSKUs";
import { getAllProductSKUs } from "../../APIs/user/productSKU";
import { useUserStore } from "../../store/useUserStore";

export const Dashboard: React.FC = () => {
  const { username } = useUserStore();

  // Filters and data states
  const [channelAccounts, setChannelAccounts] = useState<ChannelAccount[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [productSKUs, setProductSKUs] = useState<ProductSKU[]>([]);
  const [productSKUId, setProductSKUId] = useState<string>();
  const [dateWiseSummary, setDateWiseSummary] = useState<any[]>([]);
  const [stateWiseSummary, setStateWiseSummary] = useState<any[]>([]);

  useEffect(() => {
    innitialFetch();
  }, []);

  const innitialFetch = async () => {
    const productSKUData = await getAllProductSKUs();
    const channelAccountsData = await getAllChannelAccounts();
    setProductSKUs(productSKUData.data);
    setChannelAccounts(channelAccountsData.data);
  };

  const fetchSummary = async () => {
    try {
      let data: any = {};
      if (selectedChannel) data.channel_account_id = selectedChannel;
      if (startDate) data.startDate = startDate;
      endDate
        ? (data.endDate = endDate)
        : (data.endDate = new Date().toISOString().slice(0, 10));

      const res: any = await getOrdersSummary(data);
      if (res) {
        setDateWiseSummary(res.data.dateLevel);
        setStateWiseSummary(res.data.state);
      }
    } catch (error) {
      console.error("Failed to fetch order dateWiseSummary", error);
    }
  };

  // Fetch initial dateWiseSummary on mount and whenever filters change
  useEffect(() => {
    fetchSummary();
  }, [selectedChannel, startDate, endDate]);

  // Prepare chart data
  const allStatuses = Array.from(
    new Set(
      dateWiseSummary.flatMap((d) => d.statuses.map((s: any) => s.status))
    )
  );
  const statusColors: Record<string, string> = {
    Delivered: "#28a745", // green
    RTO: "#dc3545", // red
    Transit: "#007bff", // blue
    Pickup: "#fd7e14", // orange
    New: "#6c757d", // gray
    Cancelled: "#a71d2a", // dark red
    Other: "#6c757d", // fallback gray
  };

  const chartSeries = allStatuses.map((status) => ({
    name: status,
    data: dateWiseSummary.map((day: any) => {
      const statusData = day.statuses.find((s: any) => s.status === status);
      return statusData ? statusData.count : 0;
    }),
    color: statusColors[status],
  }));

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: true },
    },
    xaxis: {
      categories: dateWiseSummary.map((day: any) => day.date),
      title: { text: "Date" },
    },
    yaxis: {
      title: { text: "Orders Count" },
    },
    colors: ["#F5891E", "#000434", "#A1A1A1", "#34A853", "#EA4335"],
    legend: {
      position: "top",
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
  };
  const allStateStatuses = Array.from(
    new Set(
      stateWiseSummary.flatMap((s: any) =>
        s.statuses.map((status: any) => status.status)
      )
    )
  );

  const stateChartSeries = allStateStatuses.map((status) => ({
    name: status,
    data: stateWiseSummary.map((state: any) => {
      const found = state.statuses.find((s: any) => s.status === status);
      return found ? found.count : 0;
    }),
    color: statusColors[status] || statusColors["Other"],
  }));

  const stateChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: true },
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    xaxis: {
      categories: stateWiseSummary.map((state: any) => {
        console.log(state.state);
        return state.state || "Other";
      }),
      title: { text: "Orders Count" },
    },
    yaxis: {
      title: { text: "State" },
    },
    colors: Object.values(statusColors),
    legend: {
      position: "top",
    },
    tooltip: {
      shared: true,
      intersect: false,
    },
  };

  const doughnutStatuses = stateWiseSummary.flatMap((state) =>
    state.statuses.map((s: any) => s.status)
  );
  const uniqueStatuses = Array.from(new Set(doughnutStatuses));

  // Aggregate counts across all states (or dates)
  const statusChartSeries = uniqueStatuses.map((status) => {
    return stateWiseSummary.reduce((sum, state) => {
      const s = state.statuses.find((st: any) => st.status === status);
      return sum + (s ? s.count : 0);
    }, 0);
  });
  const colors = uniqueStatuses.map(
    (status) => statusColors[status] || "#6c757d"
  );
  const labels = uniqueStatuses;

  const statusChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "donut",
    },
    labels: labels,
    legend: {
      position: "bottom",
    },
    dataLabels: {
      formatter: function (val: number) {
        return `${val.toFixed(1)}%`;
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} orders`,
      },
    },
    colors: colors,
  };

  return (
    <div
      style={{ padding: "2rem", margin: "0 auto", backgroundColor: "#FFFFFF" }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <h2 style={{ color: "#000434", marginBottom: "0.25rem" }}>
          Welcome back, {username} 👋
        </h2>
        <p style={{ fontSize: "16px", color: "#555" }}>
          Your control panel for managing orders, inventory, finances, and
          fulfillment.
        </p>
        <section style={{ marginTop: "2.5rem" }}>
          <h3 style={{ color: "#F5891E", marginBottom: "1rem" }}>
            📊 Business Overview
          </h3>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            {["Total Orders", "Wallet Balance", "Pending NDRs"].map((label) => (
              <div key={label} style={cardStyle}>
                <h4
                  style={{
                    fontSize: "16px",
                    marginBottom: "0.5rem",
                    color: "#000434",
                  }}
                >
                  {label}
                </h4>
                <p
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#F5891E",
                  }}
                >
                  --
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Card
        style={{
          marginTop: "3rem",
          padding: "2rem",
          borderRadius: "1rem",
          background: "linear-gradient(to bottom right, #FFFFFF, #F8F8F8)",
          boxShadow: "0 4px 12px rgba(0, 4, 52, 0.08)",
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <h3
            style={{
              color: "#000434",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span role="img" aria-label="filter">
              🎛️
            </span>{" "}
            Filter & View Summary
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <Form.Group>
              <Form.Label>Channel Accounts</Form.Label>
              <Form.Select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
              >
                <option value="">All Channel Accounts</option>
                {channelAccounts.map((ch) => (
                  <option key={ch._id} value={ch._id}>
                    {ch.channel_account_name} ({ch.pool_id?.name})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Product SKU</Form.Label>
              <Form.Select
                value={productSKUId}
                onChange={(e) => setProductSKUId(e.target.value)}
              >
                <option value="">All Product SKUs</option>
                {productSKUs.map((sku) => (
                  <option key={sku._id} value={sku._id}>
                    {sku.product_sku_id} - {sku.product_sku_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Select Date</Form.Label>
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                maxDate={new Date()}
                monthsShown={2}
                onChange={(dates: any) => {
                  const [start, end] = dates;
                  setStartDate(start);
                  setEndDate(end);
                }}
                isClearable
                className="form-control"
                placeholderText="Select date range"
              />
            </Form.Group>
          </div>
        </div>
        <Row>
          {dateWiseSummary.length > 0 && (
            <Col md={6}>
              <div style={{ marginTop: "2rem" }}>
                <h3 style={{ color: "#F5891E", marginBottom: "1rem" }}>
                  📈 Order Status Summary
                </h3>
                <Chart
                  options={chartOptions}
                  series={chartSeries}
                  type="bar"
                  height={400}
                />
              </div>
            </Col>
          )}
          {stateWiseSummary.length > 0 && (
            <Col md={6}>
              <div style={{ padding: "3rem" }}>
                <h3 style={{ color: "#F5891E", marginBottom: "1rem" }}>
                  🗺️ Order Status Distribution
                </h3>
                <Chart
                  options={statusChartOptions}
                  series={statusChartSeries}
                  type="donut"
                  height={400}
                />
              </div>
            </Col>
          )}
          {stateWiseSummary.length > 0 && (
            <Col md={12}>
              <div style={{ padding: "3rem" }}>
                <h3 style={{ color: "#F5891E", marginBottom: "1rem" }}>
                  🗺️ State-wise Order Status Summary
                </h3>
                <Chart
                  options={stateChartOptions}
                  series={stateChartSeries}
                  type="bar"
                  height={500}
                />
              </div>
            </Col>
          )}
        </Row>
      </Card>

      <Card style={{ marginTop: "3rem", padding: "30px" }}>
        <h3 style={{ color: "#F5891E", marginBottom: "1rem" }}>
          🚀 Getting Started Guide
        </h3>
        <ol
          style={{
            paddingLeft: "1.25rem",
            fontSize: "16px",
            lineHeight: "1.9",
            color: "#000434",
          }}
        >
          <li>
            <Link to="/dashboard/pools" style={linkStyle}>
              <strong>Create a Pool</strong>
            </Link>{" "}
            – Define dispatch hubs to manage order flow and allocation.
          </li>
          <li>
            <Link to="/dashboard/channel_accounts" style={linkStyle}>
              <strong>Add Channel Accounts</strong>
            </Link>{" "}
            – Connect marketplaces like Amazon, Flipkart, etc.
          </li>
          <li>
            <Link to="/dashboard/Warehouses" style={linkStyle}>
              <strong>Set Up Warehouses</strong>
            </Link>{" "}
            – Register storage locations for inventory tracking.
          </li>
          <li>
            <Link to="/dashboard/ProductPacks" style={linkStyle}>
              <strong>Configure Packages</strong>
            </Link>{" "}
            – Setup packaging info for accurate courier selection.
          </li>
          <li>
            <Link to="/dashboard/Products" style={linkStyle}>
              <strong>Create Products</strong>
            </Link>{" "}
            – Add your catalog with detailed product info.
          </li>
          <li>
            <Link to="/dashboard/ProductSKU" style={linkStyle}>
              <strong>Define Product SKUs</strong>
            </Link>{" "}
            – Assign unique SKUs for each variant.
          </li>
          <li>
            <Link to="/dashboard/ChannelSKU" style={linkStyle}>
              <strong>Link SKUs to Channels</strong>
            </Link>{" "}
            – Map internal SKUs to external listings.
          </li>
          <li>
            <Link to="/dashboard/orders" style={linkStyle}>
              <strong>Monitor Incoming Orders</strong>
            </Link>{" "}
            – View real-time orders across platforms.
          </li>
          <li>
            <Link to="/dashboard/Wallet" style={linkStyle}>
              <strong>Recharge Your Wallet</strong>
            </Link>{" "}
            – Maintain balance for seamless courier bookings.
          </li>
          <li>
            <Link to="/dashboard/orders" style={linkStyle}>
              <strong>Enhance Orders with AI</strong>
            </Link>{" "}
            – Enrich order details using AI-driven content.
          </li>
          <li>
            <Link to="/dashboard/orders" style={linkStyle}>
              <strong>Track Deliveries</strong>
            </Link>{" "}
            – Monitor fulfillment progress end-to-end.
          </li>
          <li>
            <Link to="/dashboard/NDR" style={linkStyle}>
              <strong>Manage NDR Effortlessly</strong>
            </Link>{" "}
            – Handle non-delivery cases quickly and clearly.
          </li>
        </ol>
      </Card>
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  flex: "1 1 200px",
  padding: "1rem",
  borderRadius: "10px",
  backgroundColor: "#FFFFFF",
  border: "1px solid #F5891E",
  boxShadow: "0 1px 4px rgba(0, 4, 52, 0.1)",
};

const linkStyle: React.CSSProperties = {
  color: "#000434",
  textDecoration: "underline",
};

export default Dashboard;
