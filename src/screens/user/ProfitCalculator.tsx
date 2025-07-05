import React from "react";
import { Card } from "react-bootstrap";
import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';
import SelfShipCalculator from "../calculators/selfShip";
import DropShipCalculator from "../calculators/dropShip";

export interface ProfitCalculator {
  _id: string;
  name: string;
  length: number;
  breadth: number;
  height: number;
  weight: number;
  stock: number;
  packing_cost: number;
  volumetric_weight: number;
  status: "active" | "inactive" | "suspended";
  createdAt?: string;
  updatedAt?: string;
}

const ProfitCalculator: React.FC = () => {

  return (
    <div className="container mt-4 ms-2 me-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Profit Calculator</h4>
      </div>
      <Card>
        <Card.Body>
          <Tab.Container id="top-tabs-example" defaultActiveKey="SelfShip">
            {/* Navigation Tabs */}
            <Nav variant="tabs" justify className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="SelfShip">Self Ship</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="DropShip">Drop Ship</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="RoposoClout">Roposo Clout</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="AmazonEasyShip">Amazon Easy Ship</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="Meesho">Meesho</Nav.Link>
              </Nav.Item>
            </Nav>

            {/* Tab Content */}
            <Tab.Content>
              <Tab.Pane eventKey="SelfShip">
                <SelfShipCalculator />
              </Tab.Pane>
              <Tab.Pane eventKey="DropShip">
                <DropShipCalculator />
              </Tab.Pane>
              <Tab.Pane eventKey="RoposoClout">
                <h5>Roposo Clout Content</h5>
                <p>Calculator for Roposo Clout coming soon...</p>
              </Tab.Pane>
              <Tab.Pane eventKey="AmazonEasyShip">
                <h5>Amazon Easy Ship Content</h5>
                <p>Calculator for Amazon Easy Ship coming soon...</p>
              </Tab.Pane>
              <Tab.Pane eventKey="Meesho">
                <h5>Meesho Content</h5>
                <p>Calculator for Meesho coming soon...</p>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Card.Body>
      </Card>
    </div >
  );
};

export { ProfitCalculator };