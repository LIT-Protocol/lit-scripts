import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import styled from "styled-components";

// Styled components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.h1`
  text-align: center;
`;

const Tabs = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const Tab = styled.button`
  padding: 10px 20px;
  background: ${(props) => (props.active ? "#007bff" : "#f8f9fa")};
  color: ${(props) => (props.active ? "white" : "black")};
  border: none;
  cursor: pointer;
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  cursor: pointer;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 10px;
  background: #f8f9fa;
`;

const Td = styled.td`
  padding: 10px;
  border-top: 1px solid #dee2e6;
`;

// Main component
function PaymentDelegationDashboard() {
  const [activeTab, setActiveTab] = useState("payer");
  const [userAddress, setUserAddress] = useState("");
  const [requestsPerPeriod, setRequestsPerPeriod] = useState("");
  const [period, setPeriod] = useState("");
  const [authorizedUsers, setAuthorizedUsers] = useState([]);
  const [authorizedPayers, setAuthorizedPayers] = useState([]);

  // Mock functions for blockchain interactions
  const delegatePayments = () => {
    console.log(`Delegating payments to ${userAddress}`);
    // Add user to authorizedUsers
    setAuthorizedUsers([
      ...authorizedUsers,
      { address: userAddress, restrictions: "None" },
    ]);
  };

  const setRestrictions = () => {
    console.log(
      `Setting restrictions: ${requestsPerPeriod} requests per ${period} seconds`
    );
  };

  const undelegate = (address) => {
    console.log(`Undelegating payments for ${address}`);
    // Remove user from authorizedUsers
    setAuthorizedUsers(
      authorizedUsers.filter((user) => user.address !== address)
    );
  };

  return (
    <Container>
      <Header>Payment Delegation Dashboard</Header>
      <Tabs>
        <Tab
          active={activeTab === "payer"}
          onClick={() => setActiveTab("payer")}
        >
          Payer View
        </Tab>
        <Tab active={activeTab === "user"} onClick={() => setActiveTab("user")}>
          User View
        </Tab>
      </Tabs>

      {activeTab === "payer" ? (
        <>
          <Section>
            <h2>Delegate Payments</h2>
            <Input
              type="text"
              placeholder="Enter User Address"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
            />
            <Button onClick={delegatePayments}>Delegate Payments</Button>
          </Section>

          <Section>
            <h2>Set Restrictions</h2>
            <Input
              type="number"
              placeholder="Requests Per Period"
              value={requestsPerPeriod}
              onChange={(e) => setRequestsPerPeriod(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Period (in seconds)"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            />
            <Button onClick={setRestrictions}>Set Restrictions</Button>
          </Section>

          <Section>
            <h2>Authorized Users</h2>
            <Table>
              <thead>
                <tr>
                  <Th>User Address</Th>
                  <Th>Restrictions</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {authorizedUsers.map((user, index) => (
                  <tr key={index}>
                    <Td>{user.address}</Td>
                    <Td>{user.restrictions}</Td>
                    <Td>
                      <Button onClick={() => undelegate(user.address)}>
                        Undelegate
                      </Button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Section>
        </>
      ) : (
        <Section>
          <h2>Authorized Payers</h2>
          <Table>
            <thead>
              <tr>
                <Th>Payer Address</Th>
                <Th>Restrictions</Th>
              </tr>
            </thead>
            <tbody>
              {authorizedPayers.map((payer, index) => (
                <tr key={index}>
                  <Td>{payer.address}</Td>
                  <Td>{payer.restrictions}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Section>
      )}
    </Container>
  );
}

export default PaymentDelegationDashboard;
