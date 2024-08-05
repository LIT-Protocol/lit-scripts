// Filename: src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Tutorial from "./Tutorial";
import PaymentDelegationDashboard from "./PaymentDelegation";
import NodeBox from "./NodeBox";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/nodebox" element={<NodeBox />} />
        <Route
          path="/payment-delegation"
          element={<PaymentDelegationDashboard />}
        />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;
