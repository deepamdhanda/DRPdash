import { toast } from "react-toastify";
import { appAxios } from "../axios/appAxios";
import { couriers_url } from "../URLs/dash";
type Courier = any;

interface CommonWarehouse {
  warehouse_id: string;
  warehouse_name: string;
  stock: number;
  [key: string]: any;
}

export const getAllCouriers = async () => {
  try {
    const response = await appAxios.get(couriers_url, {
      withCredentials: true,
    });
    return response.data as Courier[];
  } catch (error: any) {
    toast.error("Failed to fetch couriers.");
    throw error;
  }
};


export const getCommonWarehouses = (order: any): CommonWarehouse[] => {
  if (!order.product_details?.length) return [];

  const productCount = order.product_details.length;
  const warehouseStockMap: Map<string, number[]> = new Map();
  const warehouseDataMap: Map<string, any> = new Map();

  for (const product of order.product_details) {
    for (const entry of product.warehouses) {
      const warehouseId = entry.warehouse.warehouse_id;

      // Initialize maps if not present
      if (!warehouseStockMap.has(warehouseId)) {
        warehouseStockMap.set(warehouseId, []);
        warehouseDataMap.set(warehouseId, entry.warehouse);
      }

      warehouseStockMap.get(warehouseId)!.push(entry.stock);
    }
  }

  const result: CommonWarehouse[] = [];

  for (const [warehouseId, stocks] of warehouseStockMap.entries()) {
    // Only include warehouses that have all products
    if (stocks.length === productCount && !stocks.includes(0)) {
      const minStock = Math.min(...stocks);
      result.push({
        ...warehouseDataMap.get(warehouseId),
        stock: minStock,
      });
    }
  }

  return result;
};


export const checkShipmentServiceavailablity = async (order: any, warehouse: any = null) => {
  try {

    const weight = (order.product_details.reduce((total: number, product: any) =>
      total + (product.product_weight || 0) * (product.quantity || 0), 0)) || 100;

    let commonWarehouses = warehouse;
    if (commonWarehouses === null) {
      commonWarehouses = getCommonWarehouses(order)
    }
    // Handle delivery details from order shipping info
    const delivery_address = (`${order.shipping_address}, ${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}`) || 'Unknown';
    const delivery_postcode = order.shipping_pincode || '000000';

    const type = 'delivery'; // Assuming default shipment type
    const cod = order.payment_method?.toLowerCase().includes('cod') ? 1 : 0;

    // Defaults or derived from product SKU or packing config (mocked here)
    const length = order.pack_deatils.length; // Set from product packaging if known
    const breadth = order.pack_deatils.breadth;
    const height = order.pack_deatils.height;
    const declared_value = order.total_amount || 0;
    const order_id = order._id;
    const response = await appAxios.post(
      `${couriers_url}/checkServiceability`,
      {
        order_id,
        weight,
        commonWarehouses,
        delivery_address,
        delivery_postcode,
        type,
        cod,
        length,
        breadth,
        height,
        declared_value,

      }
    );
    return response.data;
  }
  catch (error: any) {
    toast.error("Failed to check shipment service availability. Error: " + error);
    throw error;
  }
}

export const bookCourier = async (orderId: any, courierId: any, warehouseId: any) => {
  try {
    const response = await appAxios.post(
      `${couriers_url}/book`,
      {
        orderId, courierId, warehouseId
      }
    );
    return response.data;
  }
  catch (error: any) {
    toast.error("Failed to check shipment service availability. Error: " + error);
    throw error;
  }
}

export const createCourier = async (data: any) => {
  try {
    // console.log(data)
    // return 0;
    const response = await appAxios.post(couriers_url, data);
    toast.success("Courier created successfully!");
    return response.data;
  } catch (error: any) {
    toast.error("Failed to create courier.");
    throw error;
  }
};

export const updateCourier = async (id: string, data: any) => {
  try {
    const response = await appAxios.patch(`${couriers_url}/${id}`, data);
    toast.success("Courier updated successfully!");
    return response.data;
  } catch (error: any) {
    toast.error("Failed to update courier.");
    throw error;
  }
};

export const deleteCourier = async (id: string) => {
  try {
    await appAxios.delete(`${couriers_url}/${id}`);
    toast.success("Courier deleted successfully!");
  } catch (error: any) {
    toast.error("Failed to delete courier.");
    throw error;
  }
};
