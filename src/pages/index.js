import React from "react";
import PortalGrid from "../components/PortalGrid"; // Adjust the path based on your file structure
import Seo from "../components/seo"; // Ensure this path is correct

const IndexPage = () => (
  <main>
    <Seo title="Launch Portals" description="Launch Portals is a dynamic web application designed for developers, marketers, and project managers to showcase and monitor their digital projects." />
    <PortalGrid />
  </main>
);

export default IndexPage;
