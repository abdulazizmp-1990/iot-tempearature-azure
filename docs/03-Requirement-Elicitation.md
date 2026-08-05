# Requirement Elicitation

| Document Information | |
|----------------------|------------------------------------------------|
| Project Name | Azure IoT Environment Monitoring System |
| Document Version | 1.0 |
| Status | Draft |
| Prepared By | Abdul Aziz |
| Date | 31 July 2026 |

---

# 1. Purpose

The purpose of this document is to identify, collect, validate, and document the business and technical requirements for the Azure IoT Environment Monitoring System.

Requirement elicitation ensures that stakeholder needs are fully understood before system design and development begin.

This document serves as the foundation for the Software Requirements Specification (SRS) and all subsequent design and implementation activities.

---

# 2. Objectives

The objectives of requirement elicitation are to:

- Understand the business problem.
- Identify user needs.
- Define project scope.
- Capture functional and non-functional requirements.
- Identify assumptions and constraints.
- Reduce ambiguity before development.
- Establish a shared understanding among stakeholders.

---

# 3. Requirement Elicitation Approach

The following techniques will be used to gather requirements.

| Technique | Purpose |
|-----------|---------|
| Stakeholder Interviews | Understand business needs |
| Workshops | Gather collaborative feedback |
| Observation | Study existing monitoring process |
| Document Analysis | Review current procedures |
| Brainstorming | Generate solution ideas |
| Prototype Review | Validate user expectations |

---

# 4. Business Problem Statement

Organizations require continuous monitoring of environmental conditions to ensure operational safety and equipment reliability.

Manual monitoring methods cannot provide:

- Real-time visibility
- Historical analytics
- Immediate alert notifications
- Centralized monitoring
- Remote access

The proposed system addresses these limitations using Azure IoT services and Digital Twins.

---

# 5. Existing Process Analysis

## Current Process

Environmental values are checked manually or through standalone devices.

Problems include:

- No centralized dashboard
- Manual recording
- No historical database
- No alert automation
- Delayed response
- Difficult maintenance

---

## Pain Points

| Issue | Business Impact |
|--------|-----------------|
| Manual monitoring | Increased operational effort |
| Delayed issue detection | Equipment damage |
| No historical records | Difficult trend analysis |
| No remote monitoring | Limited visibility |
| No automated alerts | Increased downtime |

---

# 6. Stakeholder Interview Questions

## Project Sponsor

- Why is this project needed?
- What business value is expected?
- What is the expected project timeline?
- What defines project success?

---

## Facility Manager

- Which environmental parameters are critical?
- How often should values be updated?
- Which alert thresholds are important?
- Which reports are required?

---

## IT Administrator

- How will devices be managed?
- What authentication method should be used?
- What security requirements exist?
- How should cloud resources be maintained?

---

## Maintenance Engineer

- What information is needed during maintenance?
- How should alerts be prioritized?
- What maintenance reports are useful?

---

## End Users

- What information should appear on the dashboard?
- Which charts are most useful?
- Which notifications are required?
- How should historical data be searched?

---

# 7. Functional Requirements Identified

The system shall:

FR-001
Collect temperature data.

FR-002
Collect humidity data.

FR-003
Collect atmospheric pressure.

FR-004
Collect battery level.

FR-005
Collect Wi-Fi signal strength.

FR-006
Transmit telemetry securely to Azure IoT Hub.

FR-007
Store telemetry.

FR-008
Update Azure Digital Twins.

FR-009
Display live sensor values.

FR-010
Generate threshold-based alerts.

FR-011
Provide historical charts.

FR-012
Register multiple IoT devices.

FR-013
Configure alert thresholds.

FR-014
Monitor device connectivity.

FR-015
Maintain audit logs.

---

# 8. Non-Functional Requirements Identified

## Performance

- Dashboard response time less than 2 seconds.
- Telemetry processing within 5 seconds.

---

## Reliability

- Automatic device reconnection.
- Fault-tolerant cloud services.
- Continuous telemetry collection.

---

## Security

- Device authentication.
- Encrypted communication.
- Secure API access.
- Role-based authorization.

---

## Scalability

- Support multiple devices.
- Support multiple locations.
- Expandable cloud architecture.

---

## Maintainability

- Modular architecture.
- Well-documented APIs.
- Automated deployment.

---

# 9. Assumptions

The following assumptions have been made:

- Internet connectivity is available.
- Azure subscription is active.
- IoT devices remain powered.
- Users have access to modern browsers.
- Sensors are calibrated.

---

# 10. Constraints

| Constraint | Description |
|------------|-------------|
| Hardware | ESP32 memory limitations |
| Budget | Azure Free Tier preferred during development |
| Connectivity | Wi-Fi required |
| Development Time | Limited project duration |
| Power | Battery capacity limitations |

---

# 11. Business Rules

BR-001

Temperature must be sampled at configurable intervals.

BR-002

Each IoT device shall have a unique identifier.

BR-003

Telemetry shall include timestamp information.

BR-004

Alerts shall be generated when thresholds are exceeded.

BR-005

Only authenticated devices may submit telemetry.

BR-006

Historical data shall be retained according to the configured retention policy.

---

# 12. Requirement Prioritization

| Requirement | Priority |
|-------------|----------|
| Live Monitoring | High |
| Azure IoT Integration | High |
| Digital Twin | High |
| Historical Data | High |
| Alert Management | High |
| Device Management | Medium |
| Reporting | Medium |
| User Management | Medium |
| Analytics | Low |
| AI Prediction | Future |

---

# 13. Requirement Traceability

| Requirement ID | Source | Stakeholder |
|----------------|--------|-------------|
| FR-001 | Interview | Facility Manager |
| FR-006 | Technical Review | IT Administrator |
| FR-008 | Technical Workshop | Solution Architect |
| FR-010 | User Interview | Maintenance Engineer |
| FR-011 | Business Meeting | Management |

---

# 14. Open Questions

The following items require clarification before implementation:

- What is the acceptable telemetry interval?
- How long should historical data be retained?
- What alert thresholds should be configurable?
- Should email notifications be included in Phase 1?
- Should multiple buildings be supported initially?
- What authentication mechanism will be used for users?

---

# 15. Requirement Validation Checklist

| Validation Item | Status |
|-----------------|--------|
| Business objectives understood | Pending |
| Stakeholders identified | Complete |
| Functional requirements captured | Complete |
| Non-functional requirements captured | Complete |
| Constraints documented | Complete |
| Risks identified | Pending |
| Scope confirmed | Pending |

---

# 16. Deliverables

The outputs of this phase include:

- Requirement Elicitation Document
- Stakeholder Interview Notes
- Initial Functional Requirement List
- Initial Non-Functional Requirement List
- Business Rules
- Requirement Traceability Matrix
- Open Issues List

---

# 17. Approval

| Role | Name | Status |
|------|------|--------|
| Project Sponsor | | Pending |
| Business Analyst | | Pending |
| Solution Architect | | Pending |
| Technical Lead | | Pending |

---

# 18. Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | 31-Jul-2026 | Abdul Aziz | Initial Requirement Elicitation Document |
