# System Architecture Document (SAD)

| Document Information | |
|----------------------|------------------------------------------------|
| Project Name | Azure IoT Environment Monitoring System |
| Document Version | 1.0 |
| Document Type | System Architecture Document (SAD) |
| Status | Draft |
| Prepared By | Abdul Aziz |
| Date | 31 July 2026 |

---

# 1. Purpose

This document describes the high-level architecture of the Azure IoT Environment Monitoring System.

It defines the architectural components, communication flows, deployment model, integration points, and technology stack used to implement the requirements specified in the Software Requirements Specification (SRS).

---

# 2. Architecture Goals

The architecture is designed to achieve the following goals:

- Modular design
- Scalability
- High availability
- Secure communication
- Real-time telemetry processing
- Maintainability
- Cloud-native deployment
- Future AI integration

---

# 3. Architectural Principles

The solution follows these principles:

- Separation of Concerns
- Loose Coupling
- High Cohesion
- Event-Driven Processing
- API-First Design
- Security by Design
- Cloud-Native Architecture
- Infrastructure as Code (future)

---

# 4. High-Level Architecture

```
+-----------------------------------------------------------+
|                     React Dashboard                       |
|            Monitoring • Alerts • Reports                 |
+--------------------------▲--------------------------------+
                           │ REST API
                           │
+--------------------------┴--------------------------------+
|                 FastAPI Backend Services                  |
| Authentication • Device API • Reports • Queries          |
+--------------------------▲--------------------------------+
                           │
                           │
+--------------------------┴--------------------------------+
|                 PostgreSQL Database                       |
| Devices • Users • Alerts • Historical Data               |
+--------------------------▲--------------------------------+
                           │
                           │
+--------------------------┴--------------------------------+
|               Azure Digital Twins                        |
| Digital Asset Model • Relationships • State             |
+--------------------------▲--------------------------------+
                           │
+--------------------------┴--------------------------------+
|              Azure Functions (Event Processing)          |
| Validation • Business Logic • Twin Updates              |
+--------------------------▲--------------------------------+
                           │
+--------------------------┴--------------------------------+
|                  Azure IoT Hub                           |
| Device Authentication • Telemetry Routing               |
+--------------------------▲--------------------------------+
                           │ MQTT
+--------------------------┴--------------------------------+
|        M5StickC Plus2 + ENV III Sensor                   |
| Temperature • Humidity • Pressure                        |
+-----------------------------------------------------------+
```

---

# 5. Architectural Layers

## 5.1 Device Layer

Responsibilities:

- Read environmental sensors
- Validate readings
- Package telemetry
- Transmit telemetry securely
- Reconnect automatically after network interruptions

Primary Components:

- M5StickC Plus2
- ENV III Sensor

---

## 5.2 Communication Layer

Responsibilities:

- Secure device connectivity
- Device authentication
- Reliable telemetry ingestion
- Message routing

Primary Component:

- Azure IoT Hub

---

## 5.3 Processing Layer

Responsibilities:

- Validate telemetry
- Apply business rules
- Trigger alerts
- Update Digital Twin
- Store operational data

Primary Component:

- Azure Functions

---

## 5.4 Digital Twin Layer

Responsibilities:

- Maintain digital representation of monitored assets
- Synchronize device state
- Maintain asset relationships

Primary Component:

- Azure Digital Twins

---

## 5.5 Data Layer

Responsibilities:

- Persist application data
- Store users
- Store devices
- Store alerts
- Store historical telemetry

Primary Component:

- PostgreSQL

---

## 5.6 Application Layer

Responsibilities:

- Authentication
- Device management
- Reporting
- Alert queries
- Dashboard APIs

Primary Component:

- FastAPI

---

## 5.7 Presentation Layer

Responsibilities:

- Dashboard
- Charts
- Alert visualization
- Historical reports
- Device management interface

Primary Component:

- React

---

# 6. Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| M5StickC Plus2 | Collect environmental data |
| ENV III | Measure temperature, humidity, pressure |
| Azure IoT Hub | Secure telemetry ingestion |
| Azure Functions | Event processing and orchestration |
| Azure Digital Twins | Digital representation of assets |
| PostgreSQL | Persistent application storage |
| FastAPI | Backend business services |
| React | User interface |

---

# 7. Data Flow

1. Device reads environmental sensors.
2. Device packages telemetry.
3. Telemetry is securely transmitted to Azure IoT Hub.
4. Azure Functions validate incoming data.
5. Business rules are applied.
6. Digital Twin properties are updated.
7. Alerts are generated if thresholds are exceeded.
8. Data is stored in PostgreSQL.
9. FastAPI exposes data to clients.
10. React dashboard displays the latest information.

---

# 8. Deployment Architecture

| Layer | Deployment |
|--------|------------|
| Device | M5StickC Plus2 |
| Cloud Ingestion | Azure IoT Hub |
| Processing | Azure Functions |
| Digital Twin | Azure Digital Twins |
| Database | PostgreSQL |
| Backend | FastAPI |
| Frontend | React |

---

# 9. Security Architecture

Security measures include:

- Device authentication
- Encrypted communication
- User authentication
- Role-Based Access Control (RBAC)
- Secure API endpoints
- Audit logging
- Secret management through environment variables or Azure Key Vault (future)

---

# 10. Scalability

The architecture supports:

- Additional devices
- Additional monitored locations
- Additional sensor types
- Horizontal scaling of backend services
- Increased telemetry volume

---

# 11. Availability & Reliability

To improve reliability:

- Automatic device reconnection
- Retry policies for transient failures
- Telemetry validation
- Centralized logging
- Health monitoring
- Backup and recovery procedures

---

# 12. Integration Points

| Source | Destination | Purpose |
|--------|-------------|---------|
| Device | Azure IoT Hub | Telemetry |
| IoT Hub | Azure Functions | Event processing |
| Azure Functions | Azure Digital Twins | State synchronization |
| Azure Functions | PostgreSQL | Data persistence |
| FastAPI | PostgreSQL | Application queries |
| React | FastAPI | Dashboard data |

---

# 13. Technology Stack

| Layer | Technology |
|--------|------------|
| Firmware | Arduino C++ |
| Device | M5StickC Plus2 |
| Sensor | ENV III |
| Messaging | MQTT |
| Cloud | Microsoft Azure |
| IoT Platform | Azure IoT Hub |
| Event Processing | Azure Functions |
| Digital Twin | Azure Digital Twins |
| Backend | FastAPI |
| Database | PostgreSQL |
| Frontend | React |
| API | REST / JSON |
| Authentication | JWT |
| Version Control | Git & GitHub |
| Containerization | Docker |

---

# 14. Quality Attributes

| Attribute | Architectural Approach |
|-----------|------------------------|
| Performance | Event-driven processing |
| Security | Authenticated and encrypted communication |
| Scalability | Cloud-native services |
| Reliability | Retry logic and monitoring |
| Maintainability | Layered architecture |
| Extensibility | Modular components |
| Availability | Managed Azure services |

---

# 15. Architectural Constraints

- Internet connectivity required
- Azure service availability
- ESP32 hardware limitations
- Browser-based client
- Supported Wi-Fi networks

---

# 16. Future Enhancements

The architecture is designed to support:

- AI-based anomaly detection
- Predictive maintenance
- Multi-site deployments
- Mobile application
- Additional sensor types
- Three.js 3D visualization
- Integration with enterprise notification systems
- Time-series database for high-volume telemetry
- CI/CD pipelines

---

# 17. References

- 09-Software-Requirement-Specification.md
- 06-Research-and-Technology-Evaluation.md
- 07-Feasibility-Study.md
- 08-Risk-Assessment.md

---

# 18. Approval

| Role | Name | Status |
|------|------|--------|
| Solution Architect | | Pending |
| Technical Lead | | Pending |
| Project Manager | | Pending |

---

# 19. Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | 31-Jul-2026 | Abdul Aziz | Initial System Architecture Document |