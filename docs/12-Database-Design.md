# Database Design Document (DDD)

| Document Information | |
|----------------------|------------------------------------------------|
| Project Name | Azure IoT Environment Monitoring System |
| Document Version | 1.0 |
| Document Type | Database Design Document |
| Status | Draft |
| Prepared By | Abdul Aziz |
| Date | 31 July 2026 |

---

# 1. Purpose

This document defines the logical and physical database design for the Azure IoT Environment Monitoring System.

The database is responsible for storing application data, historical telemetry, alerts, users, audit logs, and system configuration.

Azure Digital Twins maintains the current operational state, while PostgreSQL stores persistent business data and historical records.

---

# 2. Objectives

The database shall:

- Store application data
- Store historical telemetry
- Maintain device information
- Manage users and roles
- Record alerts
- Maintain audit history
- Support reporting
- Support future scalability

---

# 3. Database Technology

| Item | Selection |
|------|-----------|
| Database | PostgreSQL |
| Version | PostgreSQL 16+ |
| Character Set | UTF-8 |
| Time Zone | UTC |
| ORM | SQLAlchemy (Future) |
| Migration Tool | Alembic (Future) |

---

# 4. Database Responsibilities

The database stores:

- Users
- Roles
- Devices
- Device Configuration
- Telemetry History
- Alerts
- Alert Acknowledgements
- Audit Logs
- System Settings

The database does **not** replace Azure Digital Twins.

---

# 5. High-Level Entity Relationship Diagram

```text
                +-------------+
                |    Users    |
                +-------------+
                       |
                       |
                +-------------+
                |    Roles    |
                +-------------+

                       |

+-------------+   +-------------+   +------------------+
|  Locations  |---|   Devices   |---| TelemetryHistory |
+-------------+   +-------------+   +------------------+
                       |
                       |
                +-------------+
                | DeviceConfig|
                +-------------+

                       |

                +-------------+
                |   Alerts    |
                +-------------+

                       |

                +----------------+
                | AlertHistory   |
                +----------------+

                       |

                +-------------+
                |  AuditLogs  |
                +-------------+
```

---

# 6. Entity Definitions

## Users

Purpose

Stores application users.

### Columns

| Column | Type |
|---------|------|
| id | UUID |
| full_name | VARCHAR(150) |
| email | VARCHAR(255) |
| password_hash | TEXT |
| role_id | UUID |
| status | BOOLEAN |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

## Roles

Purpose

Stores user roles.

Columns

- id
- role_name
- description

Examples

- Administrator
- Operator
- Viewer

---

## Locations

Purpose

Represents monitored physical locations.

Columns

- id
- location_name
- building
- floor
- room
- description

---

## Devices

Purpose

Stores registered monitoring devices.

### Columns

| Column | Type |
|---------|------|
| id | UUID |
| device_id | VARCHAR(100) |
| device_name | VARCHAR(150) |
| firmware_version | VARCHAR(50) |
| location_id | UUID |
| status | VARCHAR(20) |
| last_seen | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Device Configuration

Purpose

Stores configurable device settings.

Columns

- sampling_interval
- telemetry_interval
- temperature_threshold
- humidity_threshold
- pressure_threshold

---

## Telemetry History

Purpose

Stores all historical environmental readings.

### Columns

| Column | Type |
|---------|------|
| id | BIGSERIAL |
| device_id | UUID |
| temperature | NUMERIC(5,2) |
| humidity | NUMERIC(5,2) |
| pressure | NUMERIC(7,2) |
| recorded_at | TIMESTAMP |
| created_at | TIMESTAMP |

---

## Alerts

Purpose

Stores active alerts.

### Columns

| Column | Type |
|---------|------|
| id | UUID |
| device_id | UUID |
| alert_type | VARCHAR(50) |
| severity | VARCHAR(20) |
| message | TEXT |
| status | VARCHAR(20) |
| created_at | TIMESTAMP |
| acknowledged_by | UUID |
| acknowledged_at | TIMESTAMP |

---

## Alert History

Purpose

Stores resolved alerts for auditing and reporting.

Columns

- alert_id
- resolution
- resolved_by
- resolved_at

---

## Audit Logs

Purpose

Tracks important user and system actions.

### Columns

| Column | Type |
|---------|------|
| id | BIGSERIAL |
| user_id | UUID |
| action | VARCHAR(100) |
| entity | VARCHAR(100) |
| entity_id | UUID |
| ip_address | VARCHAR(45) |
| created_at | TIMESTAMP |

---

# 7. Relationships

| Parent | Child | Relationship |
|---------|-------|--------------|
| Roles | Users | One-to-Many |
| Locations | Devices | One-to-Many |
| Devices | Telemetry History | One-to-Many |
| Devices | Alerts | One-to-Many |
| Users | Audit Logs | One-to-Many |
| Users | Alerts | Acknowledged By |

---

# 8. Normalization

The schema follows Third Normal Form (3NF).

Benefits:

- Eliminates redundant data
- Maintains referential integrity
- Simplifies updates
- Improves consistency

---

# 9. Indexing Strategy

Recommended indexes:

| Table | Index |
|--------|-------|
| Devices | device_id |
| Devices | location_id |
| TelemetryHistory | device_id |
| TelemetryHistory | recorded_at |
| Alerts | status |
| Alerts | severity |
| Users | email |

Composite indexes:

- (device_id, recorded_at)
- (status, severity)

---

# 10. Data Retention

| Data | Retention |
|------|-----------|
| Telemetry | 2 Years |
| Alerts | 2 Years |
| Audit Logs | 1 Year |
| Users | Permanent |
| Device Configuration | Permanent |

Older telemetry may be archived based on business requirements.

---

# 11. Backup Strategy

- Daily incremental backup
- Weekly full backup
- Monthly archive snapshot

Backups should be encrypted and tested periodically through restore exercises.

---

# 12. Security

Security controls include:

- Encrypted connections (TLS)
- Strong password hashing
- Least-privilege database roles
- Parameterized queries
- Audit logging
- Backup encryption

---

# 13. Performance Considerations

- Indexed search columns
- Efficient joins
- Pagination for large result sets
- Connection pooling
- Query optimization
- Archival of old telemetry

---

# 14. Sample Query Scenarios

The database shall support:

- Latest telemetry for a device
- Telemetry between two dates
- Active alerts
- Devices by location
- Alert history by severity
- Dashboard summary
- Device uptime reports

---

# 15. Future Enhancements

Future improvements may include:

- Time-series database integration
- Table partitioning
- Read replicas
- Multi-region replication
- Data warehouse integration
- AI feature tables

---

# 16. Database Design Principles

The design follows:

- ACID compliance
- Referential integrity
- Third Normal Form (3NF)
- Modular schema
- Scalable indexing
- Secure-by-default configuration

---

# 17. References

- 09-Software-Requirement-Specification.md
- 10-System-Architecture.md
- 11-Digital-Twin-Design.md

---

# 18. Approval

| Role | Name | Status |
|------|------|--------|
| Database Architect | | Pending |
| Solution Architect | | Pending |
| Technical Lead | | Pending |

---

# 19. Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | 31-Jul-2026 | Abdul Aziz | Initial Database Design |