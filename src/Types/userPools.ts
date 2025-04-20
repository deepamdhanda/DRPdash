export type TStore = {
  _id: string;
  name: string;
  admins: TUser[];
  status: TStoreStatus; // Adjust if there are more known statuses
  created_by: string;
  ownership: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
};
export type TUser = {
  _id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string; // ISO timestamp
  role: EnumRole; // ObjectId of the role
};
export enum EnumRole {
  ADMIN = "admin",
  USER = "user",
}
export enum TStoreStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}
