export interface WalletTransaction {
  _id: string;
  cr_dr: "CR" | "DR"; // credit or debit
  order_id: string;
  type: string; // e.g., "delivery"
  created_by: string;
  total_amount: number;
  freight_charge: number;
  cod_charges: number;
  commission: number;
  commission_type: "fixed" | "percentage" | string;
  commission_value: number;
  full_details: {
    charge_ROV: number;
    charge_REATTEMPT: number;
    charge_RTO: number;
    charge_MPS: number;
    charge_pickup: number;
    charge_CWH: number;
    tax_data: {
      swacch_bharat_tax: number;
      IGST: number;
      SGST: number;
      service_tax: number;
      krishi_kalyan_cess: number;
      CGST: number;
    };
    charge_DEMUR: number;
    charge_AWB: number;
    zone: string | null;
    wt_rule_id: string | null;
    charge_AIR: number;
    charge_FSC: number;
    charge_LABEL: number;
    charge_COD: number;
    status: string;
    charge_POD: number;
    charge_LM: number;
    charge_CCOD: number;
    gross_amount: number;
    charge_E2E: number;
    charge_DTO: number;
    charge_COVID: number;
    zonal_cl: string | null;
    charge_DL: number;
    total_amount: number;
    charge_DPH: number;
    charge_FOD: number;
    charge_DOCUMENT: number;
    charge_WOD: number;
    charge_INS: number;
    charge_FS: number;
    charge_CNC: number;
    charge_FOV: number;
    charge_QC: number;
    charged_weight: number;
  };
  charged_weight: number;
  zone: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}

export type Invoice = {
  _id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  grand_total: number;
  total_gst: number;
  total_without_gst: number;
  createdAt: string;
  company_name?: string;
  company_address?: string;
  items?: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  transactions?: WalletTransaction[];
  user?: {
    email: string;
    name: string;
  };
};
