export type TStore = {
  _id: string;
  name: string;
  admins: string[];
  status: "active" | "inactive" | string; // Adjust if there are more known statuses
  created_by: string;
  ownership: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
};
