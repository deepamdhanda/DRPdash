import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Form,
  Card,
  Badge,
  Table,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import DataTable from "react-data-table-component";
import {
  getAllFinances,
  createFinance,
  updateFinance,
} from "../../APIs/user/finance";
import { getAllProducts } from "../../APIs/user/product";
import { Product } from "./Products";

export interface User {
  _id: string;
  product_name: string;
}

export interface ProductData {
  product_id: string;
  quantity: number;
  price: number;
}

export interface Finance {
  _id: string;
  type: "debit" | "credit";
  name: string;
  product_data: ProductData[];
  transportation_charge: number;
  discount: number;
  tax: 0 | 5 | 12 | 18 | 28;
  miscellaneous: {
    expense: number;
    remarks: string;
  };
  final_amount: number;
  created_by: User;
  createdAt?: string;
  updatedAt?: string;
}

interface FinanceFormData {
  type: "debit" | "credit";
  name: string;
  product_data: ProductData[];
  transportation_charge: number;
  discount: number;
  tax: 0 | 5 | 12 | 18 | 28;
  miscellaneous: {
    expense: number;
    remarks: string;
  };
}

const Finances: React.FC = () => {
  const [finances, setFinances] = useState<Finance[]>([]);
  const [totalFinances, setTotalFinances] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingFinance, setEditingFinance] = useState<Finance | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [formData, setFormData] = useState<FinanceFormData>({
    type: "debit",
    name: "",
    product_data: [],
    transportation_charge: 0,
    discount: 0,
    tax: 0,
    miscellaneous: {
      expense: 0,
      remarks: "",
    },
  });

  const [selectedProduct, setSelectedProduct] = useState("");
  const [productQuantity, setProductQuantity] = useState("1");
  const [productPrice, setProductPrice] = useState("");

  useEffect(() => {
    fetchFinances();
    fetchProducts();
  }, [currentPage, perPage]);

  const fetchFinances = async () => {
    try {
      setLoading(true);
      const response = await getAllFinances();
      setFinances(response.data);
      setTotalFinances(response.total || response.data.length);
    } catch (error) {
      console.error("Error fetching finances", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await getAllProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingFinance(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: "debit",
      name: "",
      product_data: [],
      transportation_charge: 0,
      discount: 0,
      tax: 0,
      miscellaneous: {
        expense: 0,
        remarks: "",
      },
    });
    setSelectedProduct("");
    setProductQuantity("1");
    setProductPrice("");
  };

  const handleShow = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (finance: Finance) => {
    setEditingFinance(finance);
    setFormData({
      type: finance.type,
      name: finance.name,
      product_data: finance.product_data,
      transportation_charge: finance.transportation_charge,
      discount: finance.discount,
      tax: finance.tax,
      miscellaneous: finance.miscellaneous,
    });
    setShowModal(true);
  };

  // const handleNumberInput = (value: string): number => {
  //   const num = parseFloat(value);
  //   return isNaN(num) || num < 0 ? 0 : num;
  // };

  const handleAddProduct = () => {
    if (!selectedProduct || !productQuantity || !productPrice) {
      alert("Please select a product and enter valid quantity and price");
      return;
    }

    const quantity = parseInt(productQuantity);
    const price = parseFloat(productPrice);

    if (quantity <= 0 || price < 0) {
      alert("Please enter valid quantity and price");
      return;
    }

    const newProduct: ProductData = {
      product_id: selectedProduct,
      quantity: quantity,
      price: price,
    };

    setFormData({
      ...formData,
      product_data: [...formData.product_data, newProduct],
    });

    setSelectedProduct("");
    setProductQuantity("1");
    setProductPrice("");
  };

  const handleRemoveProduct = (index: number) => {
    const updatedProducts = formData.product_data.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      product_data: updatedProducts,
    });
  };

  const calculateSubtotal = () => {
    return formData.product_data.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const calculateFinalAmount = () => {
    const subtotal = calculateSubtotal();
    const afterDiscount = subtotal - formData.discount;
    const taxAmount = (afterDiscount * formData.tax) / 100;
    const total =
      afterDiscount +
      taxAmount +
      formData.transportation_charge +
      formData.miscellaneous.expense;
    return Math.max(0, total);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.product_data.length === 0) {
      alert("Please add at least one product");
      return;
    }

    const finalAmount = calculateFinalAmount();

    const submitData = {
      ...formData,
      final_amount: finalAmount,
    };

    try {
      if (editingFinance) {
        await updateFinance(editingFinance._id, submitData);
      } else {
        await createFinance(submitData);
      }
      fetchFinances();
      handleClose();
    } catch (error) {
      console.error("Error saving finance", error);
      alert("Error saving finance. Please try again.");
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find((p) => p._id === productId);
    return product ? product.product_name : "Unknown Product";
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId);
  };

  const getProductTotal = () => {
    if (!productQuantity || !productPrice) return 0;
    const qty = parseInt(productQuantity) || 0;
    const price = parseFloat(productPrice) || 0;
    return qty * price;
  };

  const columns = [
    {
      name: "Type",
      selector: (row: Finance) => row.type,
      cell: (row: Finance) => (
        <Badge bg={row.type === "debit" ? "danger" : "success"}>
          {row.type.toUpperCase()}
        </Badge>
      ),
      sortable: true,
      width: "100px",
    },
    {
      name: "Name",
      selector: (row: Finance) => row.name,
      sortable: true,
      wrap: true,
    },
    {
      name: "Products",
      cell: (row: Finance) => (
        <Badge bg="info" pill>
          {row.product_data?.length || 0}
        </Badge>
      ),
      width: "100px",
    },
    {
      name: "Final Amount",
      selector: (row: Finance) => row.final_amount,
      cell: (row: Finance) => (
        <strong className="text-primary">₹{row.final_amount.toFixed(2)}</strong>
      ),
      sortable: true,
      width: "150px",
    },
    {
      name: "Created By",
      selector: (row: Finance) => row.created_by?.product_name || "—",
      wrap: true,
    },
    {
      name: "Created On",
      selector: (row: Finance) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: Finance) => (
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => handleEdit(row)}
        >
          Edit
        </Button>
      ),
      width: "100px",
    },
  ];

  return (
    <div className="container-fluid mt-4 px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Finance Management</h2>
        <Button variant="primary" onClick={handleShow} size="lg">
          <i className="bi bi-plus-circle me-2"></i>
          New Finance
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <DataTable
            title="All Finance Records"
            data={finances}
            columns={columns as any}
            highlightOnHover
            pagination
            paginationServer
            paginationTotalRows={totalFinances}
            onChangePage={(page) => setCurrentPage(page)}
            onChangeRowsPerPage={(newPerPage, page) => {
              setPerPage(newPerPage);
              setCurrentPage(page);
            }}
            paginationRowsPerPageOptions={[10, 20, 50, 100]}
            responsive
            striped
            persistTableHead
            progressPending={loading}
          />
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleClose} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingFinance ? "Edit Finance Record" : "Create New Finance"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <Card className="mb-3 ">
              <Card.Header className="text-white">
                <h5 className="mb-0">Basic Information</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Transaction Type <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        size="lg"
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            type: e.target.value as "debit" | "credit",
                          })
                        }
                        required
                      >
                        <option value="debit">Debit (Expense)</option>
                        <option value="credit">Credit (Income)</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Finance Name <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        size="lg"
                        placeholder="Enter finance name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Product Selection */}
            <Card className="mb-3">
              <Card.Header className="text-white">
                <h5 className="mb-0">Product Selection</h5>
              </Card.Header>
              <Card.Body>
                <Row className="align-items-end">
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Select Product</Form.Label>
                      <Form.Select
                        size="lg"
                        value={selectedProduct}
                        onChange={(e) => handleProductSelect(e.target.value)}
                      >
                        <option value="">-- Choose Product --</option>
                        {products.map((product) => (
                          <option key={product._id} value={product._id}>
                            {product.product_name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Quantity</Form.Label>
                      <Form.Control
                        type="text"
                        size="lg"
                        placeholder="Enter quantity"
                        value={productQuantity}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || /^\d+$/.test(value)) {
                            setProductQuantity(value);
                          }
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price per Unit (₹)</Form.Label>
                      <Form.Control
                        type="text"
                        size="lg"
                        placeholder="Enter price"
                        value={productPrice}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || /^\d*\.?\d*$/.test(value)) {
                            setProductPrice(value);
                          }
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group className="mb-3">
                      <Button
                        variant="success"
                        size="lg"
                        className="w-100"
                        onClick={handleAddProduct}
                      >
                        <i className="bi bi-plus-lg"></i> Add
                      </Button>
                    </Form.Group>
                  </Col>
                </Row>

                {productQuantity && productPrice && (
                  <div className="alert alert-info mb-3">
                    <strong>Product Total:</strong> ₹
                    {getProductTotal().toFixed(2)}
                  </div>
                )}

                {formData.product_data.length > 0 && (
                  <div className="table-responsive">
                    <Table striped bordered hover>
                      <thead className="table-dark">
                        <tr>
                          <th>#</th>
                          <th>Product Name</th>
                          <th className="text-center">Quantity</th>
                          <th className="text-end">Price (₹)</th>
                          <th className="text-end">Total (₹)</th>
                          <th className="text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.product_data.map((item, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                              <strong>{getProductName(item.product_id)}</strong>
                            </td>
                            <td className="text-center">{item.quantity}</td>
                            <td className="text-end">
                              ₹{item.price.toFixed(2)}
                            </td>
                            <td className="text-end">
                              <strong className="text-primary">
                                ₹{(item.quantity * item.price).toFixed(2)}
                              </strong>
                            </td>
                            <td className="text-center">
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleRemoveProduct(index)}
                              >
                                <i className="bi bi-trash"></i> Remove
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Additional Charges */}
            <Card className="mb-3">
              <Card.Header className="">
                <h5 className="mb-0">Additional Charges & Deductions</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Discount (₹)</Form.Label>
                      <InputGroup size="lg">
                        <InputGroup.Text>₹</InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="0.00"
                          value={formData.discount || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || /^\d*\.?\d*$/.test(value)) {
                              setFormData({
                                ...formData,
                                discount: value === "" ? 0 : parseFloat(value),
                              });
                            }
                          }}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Tax (%)</Form.Label>
                      <Form.Select
                        size="lg"
                        value={formData.tax}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tax: parseInt(e.target.value) as
                              | 0
                              | 5
                              | 12
                              | 18
                              | 28,
                          })
                        }
                      >
                        <option value={0}>0% (No Tax)</option>
                        <option value={5}>5% GST</option>
                        <option value={12}>12% GST</option>
                        <option value={18}>18% GST</option>
                        <option value={28}>28% GST</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Transportation Charge (₹)</Form.Label>
                      <InputGroup size="lg">
                        <InputGroup.Text>₹</InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="0.00"
                          value={formData.transportation_charge || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || /^\d*\.?\d*$/.test(value)) {
                              setFormData({
                                ...formData,
                                transportation_charge:
                                  value === "" ? 0 : parseFloat(value),
                              });
                            }
                          }}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Miscellaneous Expense (₹)</Form.Label>
                      <InputGroup size="lg">
                        <InputGroup.Text>₹</InputGroup.Text>
                        <Form.Control
                          type="text"
                          placeholder="0.00"
                          value={formData.miscellaneous.expense || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || /^\d*\.?\d*$/.test(value)) {
                              setFormData({
                                ...formData,
                                miscellaneous: {
                                  ...formData.miscellaneous,
                                  expense: value === "" ? 0 : parseFloat(value),
                                },
                              });
                            }
                          }}
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Miscellaneous Remarks</Form.Label>
                      <Form.Control
                        type="text"
                        size="lg"
                        placeholder="Enter remarks for miscellaneous expense"
                        value={formData.miscellaneous.remarks}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            miscellaneous: {
                              ...formData.miscellaneous,
                              remarks: e.target.value,
                            },
                          })
                        }
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Summary */}
            <Card>
              <Card.Header className="text-white">
                <h5 className="mb-0">Payment Summary</h5>
              </Card.Header>
              <Card.Body>
                <Table borderless className="mb-0">
                  <tbody>
                    <tr>
                      <td className="text-end">
                        <strong>Subtotal:</strong>
                      </td>
                      <td className="text-end" width="200">
                        <h5 className="mb-0">
                          ₹{calculateSubtotal().toFixed(2)}
                        </h5>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-end">
                        <strong>Discount:</strong>
                      </td>
                      <td className="text-end text-danger">
                        <h5 className="mb-0">
                          -₹{formData.discount.toFixed(2)}
                        </h5>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-end">
                        <strong>Tax ({formData.tax}%):</strong>
                      </td>
                      <td className="text-end">
                        <h5 className="mb-0">
                          ₹
                          {(
                            ((calculateSubtotal() - formData.discount) *
                              formData.tax) /
                            100
                          ).toFixed(2)}
                        </h5>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-end">
                        <strong>Transportation:</strong>
                      </td>
                      <td className="text-end">
                        <h5 className="mb-0">
                          ₹{formData.transportation_charge.toFixed(2)}
                        </h5>
                      </td>
                    </tr>
                    <tr>
                      <td className="text-end">
                        <strong>Miscellaneous:</strong>
                      </td>
                      <td className="text-end">
                        <h5 className="mb-0">
                          ₹{formData.miscellaneous.expense.toFixed(2)}
                        </h5>
                      </td>
                    </tr>
                    <tr className="border-top border-2">
                      <td className="text-end">
                        <h4 className="mb-0">
                          <strong>Final Amount:</strong>
                        </h4>
                      </td>
                      <td className="text-end">
                        <h3 className="mb-0 text-success">
                          <strong>₹{calculateFinalAmount().toFixed(2)}</strong>
                        </h3>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" size="lg" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" size="lg" onClick={handleSubmit}>
            {editingFinance ? "Update Finance" : "Create Finance"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export { Finances };
