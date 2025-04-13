import { useEffect } from "react";
import { getPools } from "../../../APIs/userPoolsAPIs";

export const UserPools = () => {
  return (
    <div>
      <h1 className="text-black">User pools</h1>
      <button className="btn btn-primary">create</button>
    </div>
  );
};
