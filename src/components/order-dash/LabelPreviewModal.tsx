import { forwardRef, useImperativeHandle, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Barcode from "react-barcode";

export interface LabelPrinterRef {
  print: () => void;
}

interface LabelPrinterProps {
  labelData: any[] | null;
}

const ShippingLabel = ({ data }: { data: any }) => {
  return (
    <div
      style={{
        width: "100mm",
        height: "150mm",
        maxHeight: "150mm",
        overflow: "hidden",
        pageBreakInside: "avoid",
        fontFamily: "Arial, sans-serif",
        padding: "5px",
        fontSize: "10px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        backgroundColor: "white",
        color: "black",
      }}
    >
      <div className="header" style={{ textAlign: "center" }}>
        <h2 style={{ margin: "0 0 4px 0", fontWeight: "bold" }}>
          {data.courier_name}
        </h2>
        {/* Adjusted HR margins to save vertical space */}
        <hr style={{ margin: "4px 0" }} />
      </div>

      <div style={{ textAlign: "center" }}>
        <Barcode value={data.waybill} height={50} fontSize={14} margin={0} />
        <div
          className="row"
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            marginTop: "4px",
          }}
        >
          <div className="col">{data.date}</div>
          <div className="col">{data.sort_code}</div>
        </div>
      </div>

      <hr style={{ margin: "4px 0" }} />

      <div>
        <div style={{ textAlign: "center" }}>
          <b>
            <u>Shipping Address</u>
          </b>
        </div>
        <div
          className="orders-header d-flex align-items-center justify-content-between"
          style={{ gap: 8, margin: "4px 0" }}
        >
          <strong>{data.customer_name}</strong>
          <br />
          {data.customer_address}, {data.customer_address2} -{" "}
          {data.customer_pincode}
        </div>
        <div>Contact: {data.customer_phone || "-"}</div>
      </div>

      <hr style={{ margin: "4px 0" }} />

      <div
        className="row"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <div className="col">
          <div>eWaybill: {data.e_waybill}</div>
          <div>
            Payment Mode:{" "}
            <b>
              {data.payment_method?.toLowerCase().includes("cod")
                ? "COD"
                : "Prepaid"}
            </b>
          </div>
          <div>
            Amount: <b>{data.amount}</b>
          </div>
        </div>
        <div className="col">
          <div>Dimensions: {data.dimensions}</div>
          <div>Weight: {data.weight} gm</div>
        </div>
      </div>

      <hr style={{ margin: "4px 0" }} />

      <div style={{ flexGrow: 1, overflow: "hidden" }}>
        <table
          style={{
            width: "100%",
            verticalAlign: "top",
            borderColor: "#dee2e6",
            fontSize: 11, // Slightly reduced to ensure it fits
            borderCollapse: "collapse",
          }}
        >
          <thead
            style={{
              verticalAlign: "bottom",
              borderBottom: "1px solid black",
            }}
          >
            <tr>
              <td style={{ padding: "2px 0" }}>Product Name</td>
              <td style={{ padding: "2px 0", textAlign: "center" }}>Qty</td>
              <td style={{ padding: "2px 0", textAlign: "right" }}>Price</td>
            </tr>
          </thead>
          <tbody>
            {data.product_details.map((product: any, idx: number) => (
              <tr key={product.sku || idx}>
                <td style={{ padding: "2px 0" }}>
                  <span style={{ fontSize: "10px" }}>{product.name}</span>
                  <br />
                  <span style={{ fontSize: "8px" }}>SKU ID: {product.sku}</span>
                </td>
                <td style={{ padding: "2px 0", textAlign: "center" }}>
                  {product.units}
                </td>
                <td style={{ padding: "2px 0", textAlign: "right" }}>
                  ₹{product.selling_price.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr style={{ margin: "4px 0" }} />

      <div>
        <div style={{ textAlign: "center" }}>
          <div
            className="row justify-content-space-evenly"
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              marginBottom: "4px",
            }}
          >
            <span className="col-md-6">{data.date}</span>
            <span className="col-md-6">{data.route}</span>
          </div>
          <Barcode
            value={data.seller_order_id}
            height={40}
            fontSize={14}
            margin={0}
          />
        </div>
        <div style={{ textAlign: "center", marginTop: "4px" }}>
          <b>
            <u>Return Address</u>
          </b>
        </div>
        <div>
          <b>{data.seller_name}</b>
        </div>
        <div>
          {data.seller_address}, {data.seller_address2} - {data.seller_pincode}
        </div>
      </div>

      <div
        className="footer"
        style={{
          textAlign: "center",
          fontSize: "8px",
          color: "#555",
          marginTop: "auto",
        }}
      >
        <hr style={{ margin: "4px 0" }} />
        <div>
          All orders are shipped exclusively via OrderzUp. We do not hold any
          responsibility for the products or services—any return or exchange is
          strictly subject to the store’s own policy.
        </div>
      </div>
    </div>
  );
};

export const LabelPrinter = forwardRef<LabelPrinterRef, LabelPrinterProps>(
  ({ labelData }, ref) => {
    const componentRef = useRef(null);

    const handlePrint = useReactToPrint({
      contentRef: componentRef,
      documentTitle: "OrderzUp_Shipping_Labels",
    });

    // Expose the print function to the parent component
    useImperativeHandle(ref, () => ({
      print: () => {
        if (handlePrint) {
          handlePrint();
        }
      },
    }));

    return (
      <div style={{ display: "none" }}>
        <div ref={componentRef}>
          <style type="text/css" media="print">
            {`
              @page { 
                size: 100mm 150mm; 
                margin: 0; 
              }
              body { 
                margin: 0; 
                padding: 0; 
                background: white;
              }
            `}
          </style>
          {labelData?.map((data, index) => (
            <div
              key={index}
              style={{
                width: "100mm",
                height: "150mm",
                pageBreakAfter: "always",
                overflow: "hidden",
              }}
            >
              <ShippingLabel data={data} />
            </div>
          ))}
        </div>
      </div>
    );
  }
);
