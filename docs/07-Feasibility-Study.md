# Feasibility Study

| Document Information | |
|----------------------|------------------------------------------------|
| Project Name | Azure IoT Environment Monitoring System |
| Document Version | 1.0 |
| Status | Draft |
| Prepared By | Abdul Aziz |
| Date | 31 July 2026 |

---

# 1. Purpose

The purpose of this feasibility study is to determine whether the Azure IoT Environment Monitoring System is technically, operationally, financially, legally, and organizationally feasible.

This document supports informed decision-making before entering the architecture, design, and implementation phases.

---

# 2. Project Overview

The proposed solution is a cloud-based IoT platform that continuously monitors environmental conditions using connected IoT devices.

The solution collects environmental telemetry from monitoring devices and provides:

- Real-time monitoring
- Historical analytics
- Alert management
- Device monitoring
- Digital Twin representation
- Centralized dashboard

---

# 3. Feasibility Assessment

The project has been evaluated using the following dimensions.

| Area | Status |
|-------|--------|
| Business Feasibility | Feasible |
| Technical Feasibility | Feasible |
| Operational Feasibility | Feasible |
| Economic Feasibility | Feasible |
| Schedule Feasibility | Feasible |
| Security Feasibility | Feasible |
| Resource Feasibility | Feasible |

---

# 4. Business Feasibility

## Objective

Determine whether the solution provides measurable business value.

### Business Needs

- Continuous monitoring
- Remote visibility
- Historical records
- Alert notifications
- Reduced operational risk

### Expected Benefits

- Reduced manual monitoring
- Faster incident response
- Improved equipment protection
- Better operational visibility
- Foundation for future predictive analytics

### Assessment

Business feasibility is considered **High**.

---

# 5. Technical Feasibility

## Objective

Determine whether the required technology is capable of implementing the proposed solution.

### Hardware

| Component | Status |
|------------|--------|
| M5StickC Plus2 | Supported |
| ENV III Sensor | Supported |

### Software

| Technology | Status |
|------------|--------|
| Arduino C++ | Suitable |
| Python (FastAPI) | Suitable |
| React | Suitable |

### Cloud Services

| Service | Status |
|----------|--------|
| Azure IoT Hub | Suitable |
| Azure Functions | Suitable |
| Azure Digital Twins | Suitable |

### Technical Challenges

- Wi-Fi stability
- Sensor calibration
- Secure device authentication
- Azure service configuration

### Mitigation

- Automatic reconnect logic
- Sensor validation
- Secure authentication mechanisms
- Infrastructure documentation

### Assessment

Technical feasibility is **High**.

---

# 6. Operational Feasibility

## Objective

Determine whether the system can operate effectively in the target environment.

### Operational Requirements

- Continuous monitoring
- Real-time alerts
- Easy administration
- Simple device management

### Operational Benefits

- Reduced manual effort
- Centralized monitoring
- Improved visibility
- Simplified maintenance

### User Readiness

Expected users include:

- Facility Managers
- IT Administrators
- Maintenance Engineers

Minimal training is expected.

### Assessment

Operational feasibility is **High**.

---

# 7. Economic Feasibility

## Objective

Evaluate expected costs and benefits.

### Development Costs

| Item | Estimated Cost |
|------|----------------|
| IoT Hardware | Already Available |
| Azure Free Tier | Development Phase |
| Software Tools | Open Source |
| Development IDE | Free |
| Source Control | Free |

### Operational Costs

| Item | Expected Cost |
|------|---------------|
| Azure Cloud | Usage-based |
| Database | Low |
| Storage | Low |
| Monitoring | Low |

### Expected Benefits

- Lower maintenance effort
- Reduced downtime
- Better operational insight
- Scalable architecture

### Assessment

Economic feasibility is **High** for the initial project scope.

---

# 8. Schedule Feasibility

## Objective

Determine whether the project can be delivered within the planned timeframe.

## Proposed Phases

| Phase | Duration |
|--------|----------|
| Requirement Analysis | 1 Week |
| Research & Planning | 1 Week |
| Architecture & Design | 1 Week |
| Development | 4 Weeks |
| Testing | 2 Weeks |
| Documentation | 1 Week |
| Deployment | 1 Week |

Estimated Total Duration

**11 Weeks**

### Assessment

Schedule feasibility is **Achievable**.

---

# 9. Resource Feasibility

## Hardware Resources

- M5StickC Plus2
- ENV III Sensor
- Development Laptop
- Wi-Fi Network

## Software Resources

- Visual Studio Code
- Git
- Docker
- Azure Subscription

## Human Resources

| Role | Availability |
|------|--------------|
| Business Analyst | Available |
| Solution Architect | Available |
| Developer | Available |
| Tester | Available |

> **Note:** In this learning project, one person may perform multiple roles.

### Assessment

Resource feasibility is **High**.

---

# 10. Security Feasibility

The proposed solution supports:

- Device authentication
- Secure communication
- User authentication
- Role-based authorization
- Audit logging
- Secure API access

No significant security blockers have been identified.

### Assessment

Security feasibility is **High**.

---

# 11. Technical Constraints

- ESP32 memory limitations
- Internet dependency
- Azure Free Tier limits
- Battery capacity
- Wi-Fi coverage

These constraints are acceptable for the current scope.

---

# 12. Assumptions

The feasibility assessment assumes:

- Stable Wi-Fi availability
- Active Azure subscription
- Operational IoT hardware
- Access to development tools
- Stakeholder approval

---

# 13. Risks Affecting Feasibility

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Internet outage | Medium | High | Retry logic |
| Sensor failure | Low | High | Device replacement |
| Azure configuration issues | Medium | Medium | Documentation and testing |
| Cost increase | Low | Medium | Monitor resource usage |
| Schedule delay | Medium | Medium | Incremental delivery |

---

# 14. Success Factors

The project is considered feasible if:

- Reliable telemetry is collected.
- Real-time monitoring functions correctly.
- Alerts are generated accurately.
- Historical data is available.
- Users can access the dashboard.
- Digital Twin reflects the monitored environment.

---

# 15. Recommendation

Based on the feasibility assessment:

| Area | Result |
|------|--------|
| Business | Approved |
| Technical | Approved |
| Operational | Approved |
| Economic | Approved |
| Security | Approved |
| Schedule | Approved |

Overall Recommendation

**Proceed with the Architecture and Design Phase.**

---

# 16. Conclusion

The Azure IoT Environment Monitoring System is considered technically and operationally feasible.

The selected technologies align with the project's objectives, available resources, and expected future expansion.

The expected benefits outweigh the anticipated implementation effort and operational costs.

The project is recommended to proceed to the Solution Architecture and Design phase.

---

# 17. Approval

| Role | Name | Status |
|------|------|--------|
| Project Sponsor | | Pending |
| Solution Architect | | Pending |
| Technical Lead | | Pending |
| Project Manager | | Pending |

---

# 18. Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | 31-Jul-2026 | Abdul Aziz | Initial Feasibility Study |