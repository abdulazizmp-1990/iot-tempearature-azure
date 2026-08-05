# API Specification Document

| Document Information | |
|----------------------|------------------------------------------------|
| Project Name | Azure IoT Environment Monitoring System |
| Document Version | 1.0 |
| Document Type | API Specification |
| API Standard | REST + OpenAPI 3.1 |
| Status | Draft |
| Prepared By | Abdul Aziz |
| Date | 31 July 2026 |

---

# 1. Purpose

This document defines the REST APIs exposed by the Azure IoT Environment Monitoring System.

The API provides secure access to:

- User authentication
- Device management
- Telemetry
- Alerts
- Digital Twin data
- Dashboard data
- Reports
- Administration

---

# 2. API Design Principles

The APIs follow these principles:

- RESTful resource design
- Stateless communication
- JSON request/response
- Versioned endpoints
- HTTPS only
- Consistent error handling
- Pagination for collections
- Idempotent operations where applicable

---

# 3. Base URL

Development

```
http://localhost:8000/api/v1
```

Production

```
https://api.environment-monitoring.example.com/api/v1
```

---

# 4. Authentication

Authentication Method

- JWT Bearer Token

Authorization Header

```
Authorization: Bearer <JWT_TOKEN>
```

Protected endpoints require a valid token.

---

# 5. Common Response Format

Successful Response

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

Error Response

```json
{
  "success": false,
  "error": {
    "code": "DEVICE_NOT_FOUND",
    "message": "The requested device was not found."
  }
}
```

---

# 6. HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |

---

# 7. Authentication APIs

## Login

POST

```
/auth/login
```

Request

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

Response

```json
{
  "token": "JWT_TOKEN",
  "expires_in": 3600
}
```

---

## Logout

POST

```
/auth/logout
```

---

## Refresh Token

POST

```
/auth/refresh
```

---

## Current User

GET

```
/auth/me
```

---

# 8. Device APIs

## List Devices

GET

```
/devices
```

Supports

- Pagination
- Filtering
- Sorting

---

## Get Device

GET

```
/devices/{deviceId}
```

---

## Register Device

POST

```
/devices
```

Request

```json
{
  "deviceId": "ENV-001",
  "deviceName": "Server Room Sensor",
  "locationId": "uuid"
}
```

---

## Update Device

PUT

```
/devices/{deviceId}
```

---

## Delete Device

DELETE

```
/devices/{deviceId}
```

---

# 9. Device Configuration APIs

## Get Configuration

GET

```
/devices/{deviceId}/configuration
```

---

## Update Configuration

PUT

```
/devices/{deviceId}/configuration
```

Example

```json
{
  "samplingInterval": 10,
  "temperatureThreshold": 30,
  "humidityThreshold": 70
}
```

---

# 10. Telemetry APIs

## Latest Telemetry

GET

```
/telemetry/latest
```

---

## Device Telemetry

GET

```
/devices/{deviceId}/telemetry
```

Query Parameters

- from
- to
- page
- limit

---

## Historical Telemetry

GET

```
/telemetry/history
```

Supports

- Device
- Date Range
- Temperature Range
- Humidity Range

---

# 11. Alert APIs

## Active Alerts

GET

```
/alerts
```

---

## Alert Details

GET

```
/alerts/{alertId}
```

---

## Acknowledge Alert

POST

```
/alerts/{alertId}/acknowledge
```

---

## Alert History

GET

```
/alerts/history
```

---

# 12. Dashboard APIs

## Dashboard Summary

GET

```
/dashboard/summary
```

Returns

- Device Count
- Online Devices
- Active Alerts
- Latest Readings

---

## Dashboard Charts

GET

```
/dashboard/charts
```

---

# 13. Digital Twin APIs

## Twin State

GET

```
/digital-twins/{deviceId}
```

Returns

- Twin Properties
- Current Status
- Relationships

---

## Update Twin

PUT

```
/digital-twins/{deviceId}
```

> Normally invoked by backend services or Azure Functions rather than end users.

---

## Twin Relationships

GET

```
/digital-twins/{deviceId}/relationships
```

---

# 14. Reporting APIs

## Daily Report

GET

```
/reports/daily
```

---

## Weekly Report

GET

```
/reports/weekly
```

---

## Monthly Report

GET

```
/reports/monthly
```

---

## Export Report

GET

```
/reports/export
```

Supported Formats

- CSV
- Excel
- PDF

---

# 15. Administration APIs

## System Settings

GET

```
/admin/settings
```

PUT

```
/admin/settings
```

---

## Audit Logs

GET

```
/admin/audit-logs
```

---

## System Health

GET

```
/admin/health
```

Returns

- Database Status
- API Status
- Digital Twin Status
- IoT Connectivity

---

# 16. Request Validation

The API validates:

- Required fields
- Data types
- Length constraints
- UUID formats
- Date formats
- Numeric ranges

Invalid requests return HTTP 422.

---

# 17. Pagination

Collection endpoints support:

```
?page=1
&limit=25
```

Response

```json
{
  "page": 1,
  "limit": 25,
  "total": 420,
  "items": []
}
```

---

# 18. Filtering

Examples

```
GET /devices?status=online
```

```
GET /alerts?severity=critical
```

```
GET /telemetry/history?deviceId=ENV-001
```

---

# 19. Sorting

Example

```
GET /devices?sort=lastSeen&order=desc
```

---

# 20. API Security

Security controls include:

- JWT Authentication
- Role-Based Access Control (RBAC)
- HTTPS only
- Request validation
- Rate limiting (future)
- Audit logging
- Input sanitization

---

# 21. API Versioning

Current Version

```
/api/v1
```

Future versions

```
/api/v2
```

Backward compatibility should be maintained whenever possible.

---

# 22. Error Codes

| Code | Description |
|------|-------------|
| AUTH_REQUIRED | Authentication required |
| ACCESS_DENIED | Insufficient permissions |
| DEVICE_NOT_FOUND | Device does not exist |
| ALERT_NOT_FOUND | Alert does not exist |
| INVALID_PAYLOAD | Request validation failed |
| DUPLICATE_DEVICE | Device already exists |
| INTERNAL_ERROR | Unexpected server error |

---

# 23. API Flow

```
React Dashboard
        │
 HTTPS REST
        │
        ▼
FastAPI
        │
        ├── PostgreSQL
        ├── Azure Digital Twins
        └── Azure Functions (internal integration)
```

---

# 24. Future APIs

Future enhancements may include:

- WebSocket endpoint for live dashboard updates
- Server-Sent Events (SSE)
- GraphQL API
- Bulk device management
- AI prediction endpoints
- Mobile application APIs

---

# 25. References

- 09-Software-Requirement-Specification.md
- 10-System-Architecture.md
- 11-Digital-Twin-Design.md
- 12-Database-Design.md

---

# 26. Approval

| Role | Name | Status |
|------|------|--------|
| API Architect | | Pending |
| Solution Architect | | Pending |
| Technical Lead | | Pending |

---

# 27. Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | 31-Jul-2026 | Abdul Aziz | Initial API Specification |