import React from "react";
import queryString from "query-string";
import { Card, Tab, Nav, Row, Col } from "react-bootstrap";
import { useHistory, useLocation } from "react-router-dom";
import { SettingsAboutPanel } from "./SettingsAboutPanel";
import { SettingsConfigurationPanel } from "./SettingsConfigurationPanel";
import { SettingsInterfacePanel } from "./SettingsInterfacePanel";
import { SettingsLogsPanel } from "./SettingsLogsPanel";
import { SettingsTasksPanel } from "./SettingsTasksPanel/SettingsTasksPanel";

export const Settings: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const defaultTab = queryString.parse(location.search).tab ?? "configuration";

  const onSelect = (val: string) => history.push(`?tab=${val}`);

  return (
    <Card id="details-container">
      <Tab.Container
        defaultActiveKey={defaultTab}
        id="configuration-tabs"
        onSelect={onSelect}
      >
        <Row>
          <Col sm={2}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="configuration">Configuration</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="interface">Interface</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="tasks">Tasks</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="logs">Logs</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="about">About</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
          <Col sm={10}>
            <Tab.Content>
              <Tab.Pane eventKey="configuration">
                <SettingsConfigurationPanel />
              </Tab.Pane>
              <Tab.Pane eventKey="interface">
                <SettingsInterfacePanel />
              </Tab.Pane>
              <Tab.Pane eventKey="tasks">
                <SettingsTasksPanel />
              </Tab.Pane>
              <Tab.Pane eventKey="logs">
                <SettingsLogsPanel />
              </Tab.Pane>
              <Tab.Pane eventKey="about">
                <SettingsAboutPanel />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Card>
  );
};
