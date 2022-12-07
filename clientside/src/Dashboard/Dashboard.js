import React, { useEffect } from "react";
import FeaturedInfo from "./FeaturedInfo/FeaturedInfo";
import { productivityData } from "./dummyData";
import "./dashboard.css";
import TopUsers from "./Charts/TopUsers";
import Transactions from "./FeaturedInfo/Transactions";
import Divider from "@mui/material/Divider";

const Dashboard = () => {
  return (
    <div className="home">
      <FeaturedInfo />
      <Divider />
      <Transactions />
      <Divider />
      <TopUsers data={productivityData} />
      <Divider />
    </div>
  );
};

export default Dashboard;
