# End-User Manual & Guide (`users.md`)

| Document Information | |
|----------------------|------------------------------------------------|
| **Project Name**     | Azure IoT Environment Monitoring System        |
| **Document Type**    | End-User Documentation & Operating Manual      |
| **Document Version** | 1.0                                            |
| **Target Audience**  | End Users (Facility Managers, Operators, Maintenance Engineers, Admins, Viewers) |
| **Status**           | Approved                                       |
| **Date**             | August 2026                                    |

---

## 1. Executive Summary & Purpose

Welcome to the **Azure IoT Environment Monitoring System** End-User Guide. This document provides end users with all necessary instructions to operate, monitor, navigate, and troubleshoot the web-based environment monitoring portal.

The system continuously tracks critical environmental metrics—including **Temperature (°C/°F)**, **Relative Humidity (%)**, **Atmospheric Pressure (hPa)**, and **IoT Device Health (Battery & Signal Strength)**—across monitored spaces such as server rooms, laboratories, warehouses, data centers, and office facilities.

By leveraging real-time cloud telemetry and **Azure Digital Twins**, end users can gain immediate spatial insights, receive critical environmental threshold notifications, perform trend analysis, and generate compliance reports.

---

## 2. End-User Personas & Target Roles

The system caters to five distinct end-user roles based on daily operational needs:

```
                  ┌─────────────────────────────────────────┐
                  │    Azure IoT Environment System Users   │
                  └────────────────────┬────────────────────┘
                                       │
     ┌──────────────────┬──────────────┼──────────────┬──────────────────┐
     ▼                  ▼              ▼              ▼                  ▼
┌──────────────┐ ┌──────────────┐ ┌───────────┐ ┌────────────┐ ┌──────────────────┐
│   Facility   │ │  Monitoring  │ │Maintenance│ │   System   │ │  Guest Viewer /  │
│   Manager    │ │   Operator   │ │ Engineer  │ │ Admin      │ │  Auditor         │
└──────────────┘ └──────────────┘ └───────────┘ └────────────┘ └──────────────────┘
```

### 2.1 Facility Manager
* **Goal**: Ensure overall facility compliance, maintain optimal environmental conditions, prevent asset downtime, and review analytical reports.
* **Key Tasks**: Setting alert thresholds, generating monthly compliance reports, reviewing environmental trends, managing room assignments.

### 2.2 Monitoring Operator
* **Goal**: Perform active, day-to-day oversight of environmental readings on the main dashboard and respond promptly to operational alerts.
* **Key Tasks**: Monitoring live telemetry cards, inspecting active alerts, acknowledging alarms, logging initial incident notes.

### 2.3 Maintenance Engineer
* **Goal**: Maintain physical sensor hardware, investigate environmental anomalies on-site, and manage device power/connectivity.
* **Key Tasks**: Checking device health metrics (battery %, Wi-Fi RSSI), locating physical sensors using Digital Twin views, replacing faulty units, verifying sensor calibrations.

### 2.4 System Administrator
* **Goal**: Manage system configuration, maintain security policies, provision user accounts, and oversee system integrations.
* **Key Tasks**: Provisioning user accounts, assigning roles/permissions, registering new IoT hardware/sensors, managing Azure Digital Twin schemas.

### 2.5 Guest Viewer / Auditor
* **Goal**: Read-only access for external auditors, management executives, or compliance officers.
* **Key Tasks**: Viewing live status dashboards, inspecting historical trends, downloading PDF/CSV audit reports.

---

## 3. Access Control & Permissions Matrix (RBAC)

Access to system modules and features is controlled via Role-Based Access Control (RBAC):

| Feature / Module | Facility Manager | Monitoring Operator | Maintenance Engineer | System Admin | Guest Viewer |
|------------------|:----------------:|:-------------------:|:--------------------:|:------------:|:------------:|
| **Live Dashboard** | Read / View | Read / View | Read / View | Full Access | Read / View |
| **Alert Monitoring** | Read & Manage | Read & Acknowledge | Read & Acknowledge | Full Access | Read Only |
| **Alert Threshold Config** | Read & Edit | Read Only | Read Only | Full Access | No Access |
| **Digital Twin View** | Read & View | Read & View | Read & View | Full Access | Read Only |
| **Digital Twin Property Edit** | Read & Edit | No Access | Read Only | Full Access | No Access |
| **Historical Data & Analytics** | Read & Export | Read & Export | Read & View | Full Access | Read & Export |
| **Device Diagnostics & Health** | Read Only | Read Only | Read & Maintain | Full Access | No Access |
| **User & Role Management** | No Access | No Access | No Access | Full Access | No Access |
| **System Settings** | Read Only | No Access | No Access | Full Access | No Access |

---

## 4. Getting Started & Logging In

### 4.1 System Requirements
* **Supported Browsers**: Google Chrome (v100+), Microsoft Edge (v100+), Mozilla Firefox (v100+), Apple Safari (v15+).
* **Display Resolution**: Optimized for Desktop (1920x1080), Tablet (1024x768), and Mobile (375x667+).
* **Internet Connection**: Minimum 2 Mbps stable broadband/cellular connection for real-time WebSockets streaming.

### 4.2 Logging In
1. Navigate to the system URL (e.g., `https://iot-monitor.yourcompany.com`).
2. Enter your assigned **Work Email** and **Password** (or select **Sign in with Azure AD / Single Sign-On**).
3. If Multi-Factor Authentication (MFA) is enabled, enter the verification code sent to your authenticator app or SMS.
4. Click **Log In**. Upon success, you will be redirected to the **Main Dashboard**.

```
+-------------------------------------------------------------+
|                      AZURE IOT MONITOR                      |
|                                                             |
|   Email Address:  [ user@company.com                      ] |
|   Password:       [ ****************                      ] |
|                                                             |
|   [ ] Remember Me                 [ Forgot Password? ]     |
|                                                             |
|   [       LOG IN       ]   or   [ Sign in with Azure AD ]  |
+-------------------------------------------------------------+
```

---

## 5. Main Dashboard & User Interface Navigation

The user interface is structured around a top utility header and a responsive left navigation panel:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ [≡] Azure IoT Environment Monitoring           [Live Status: OK]   🔔 Alerts (2)  👤 Profile│
├───────────────┬─────────────────────────────────────────────────────────────────────────┤
│ 📊 Dashboard  │  SUMMARY CARDS                                                          │
│ 📡 Live Stream│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│ 🏢 DigitalTwin│  │ Temperature  │  │   Humidity   │  │   Pressure   │  │Device Health │  │
│ 🚨 Alerts     │  │   22.4 °C    │  │    45.2 %    │  │  1013.2 hPa  │  │ 98% Online   │  │
│ 📈 Analytics  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
│ 📋 Reports    │                                                                         │
│ 🛠️ Devices    │  REAL-TIME TELEMETRY CHART                                              │
│ ⚙️ Settings   │  [ 📈 Temperature (°C) vs Time (Last 24 Hours)                      ]  │
└───────────────┴─────────────────────────────────────────────────────────────────────────┘
```

### 5.1 Dashboard Components
* **Header Bar**: Displays overall system health indicator (`Operational` / `Degraded` / `Critical`), quick notification bell for active alerts, user profile dropdown, and system time.
* **Navigation Drawer**: Quick access to all modules (*Dashboard, Live Telemetry, Digital Twin, Alerts, Historical Data, Reports, Device Management, Settings*).
* **Summary Metric Cards**: Color-coded indicators showing real-time averages across all registered sensors.
  * **Green (Normal)**: Metric within acceptable standard range.
  * **Yellow (Warning)**: Metric approaching warning boundary.
  * **Red (Critical)**: Metric exceeding critical safety threshold.
* **Live Telemetry Chart**: Interactive graph updated in real time via telemetry stream. Allows zoom, pan, and metric selection (Temperature, Humidity, Pressure).
* **Location / Spatial Overview**: Interactive map/floor plan illustrating device placements and real-time status highlights.

---

## 6. Detailed Module Guides for End Users

### 6.1 Real-Time Environmental Monitoring Module
1. Navigate to **Live Stream** or **Dashboard** from the side menu.
2. Select a target facility, floor, or room using the **Location Filter** dropdown.
3. Observe live gauge cards:
   * **Temperature**: Normal Range `18.0°C - 24.0°C` (Server Rooms: `18.0°C - 21.0°C`).
   * **Humidity**: Normal Range `40.0% - 60.0%` (Non-condensing).
   * **Atmospheric Pressure**: Standard Sea-Level Baseline `1013.25 hPa`.
4. Click on any sensor card to view detailed single-device telemetry, including min/max/average stats over the last 12 hours.

### 6.2 Alert Management & Escalation Workflow
When environmental parameters cross configured thresholds, the system automatically triggers alerts.

#### Alert Severity Levels
* ℹ️ **INFO**: Operational notifications (e.g., Firmware update available, device restarted).
* ⚠️ **WARNING**: Parameter nearing threshold (e.g., Server Room Temp reached `24.5°C`).
* 🚨 **CRITICAL**: Immediate danger to equipment/operations (e.g., Server Room Temp reached `28.0°C` or Sensor Disconnected).

```
  [ Trigger Event ] ──► [ Alert Created (Open) ] ──► [ Notification Sent (Email/SMS) ]
                                                                │
  [ Incident Resolved ] ◄── [ Investigation & Action ] ◄── [ Operator Acknowledges ]
```

#### Step-by-Step Alert Handling:
1. Click the **Alerts** tab or the 🔔 bell icon in the top header.
2. Filter active alerts by **Severity** (*Critical, Warning, Info*) or **Status** (*Open, Acknowledged, Resolved*).
3. Click on an alert row to expand its details (Trigger timestamp, sensor ID, location, measured value vs threshold).
4. Click **Acknowledge**: This informs team members that you are investigating the incident.
5. Once the physical environmental issue is corrected (e.g., HVAC restored or sensor repositioned), enter resolution notes and click **Mark as Resolved**.

### 6.3 Azure Digital Twin Spatial Explorer
The **Digital Twin** module provides a virtual 3D/hierarchy representation of physical assets and environments.

1. Select **Digital Twin** from the side menu.
2. Expand the spatial tree view on the left panel:
   ```
   🏢 Main Data Center Facility
    ├── 🚪 Floor 1 - Server Room A
    │    ├── 📍 Rack Unit 01 (M5StickC-ENV-01)
    │    └── 📍 Rack Unit 02 (M5StickC-ENV-02)
    └── 🚪 Floor 2 - Bio-Lab Environment
         └── 📍 Incubator Station 01 (M5StickC-ENV-03)
   ```
3. Click any node in the hierarchy to inspect live twin properties on the right side panel (*Target Temperature, Current Readings, Asset Owner, Maintenance Schedule*).
4. **Facility Managers / Admins**: Edit twin attributes (such as assigned target setpoints or location tags) directly by clicking **Edit Properties** and saving changes.

### 6.4 Historical Data Analytics & Report Exporting
End users frequently need to generate compliance reports for regulatory or operational audits.

#### Generating a Report:
1. Click **Reports** on the side navigation bar.
2. Select the **Report Type**:
   * *Daily Summary Report*
   * *Weekly Environmental Trend Analysis*
   * *Monthly Compliance & SLA Audit*
   * *Custom Date Range Telemetry Export*
3. Choose the **Target Locations / Sensors**.
4. Select desired data columns (*Temperature, Humidity, Pressure, Battery Level, Alert Counts*).
5. Click **Generate Report**.
6. Export the output by selecting your preferred format:
   * 📄 **PDF**: Printable formal report with summary graphs and executive summaries.
   * 📊 **CSV / Excel**: Raw time-series data for spreadsheet analysis or external BI tools.

### 6.5 Hardware & Device Health Monitoring (Field Engineers)
Maintenance engineers can monitor sensor health to prevent hardware downtime.

1. Go to **Devices** from the navigation drawer.
2. Review the device health grid:
   * **Device Status**: `Online` (Green) or `Offline` (Red).
   * **Battery Percentage**: `100% - 20%` (Healthy), `< 20%` (Requires Recharging/Replacement).
   * **Signal Strength (Wi-Fi RSSI)**:
     * `-30 dBm to -65 dBm`: Excellent signal.
     * `-66 dBm to -75 dBm`: Fair signal.
     * `-76 dBm or worse`: Poor connectivity (reposition device or access point).
   * **Last Ping / Communication**: Timestamp of last telemetry transmission.
3. Click **Diagnostic Test** to trigger a manual telemetry ping to verify sensor connectivity via Azure IoT Hub.

---

## 7. User Best Practices & Guidelines

To ensure smooth operations and high system reliability, end users should adhere to the following best practices:

* 🔒 **Security First**: Always log out when leaving shared monitoring workstations. Never share account credentials.
* ⏰ **Timely Acknowledgements**: Acknowledge **Critical Alerts** within 15 minutes of notification receipt to maintain SLA compliance.
* 📊 **Regular Audits**: Facility managers should export and review monthly reports to detect gradual performance degradation in HVAC or cooling equipment.
* 🔋 **Proactive Maintenance**: Replace or recharge sensor batteries when levels drop below 20% to avoid gaps in environmental logging.
* 📌 **Accurate Tagging**: Ensure new or relocated sensors are updated in the **Digital Twin Explorer** so spatial maps remain accurate.

---

## 8. Frequently Asked Questions (FAQ) & Troubleshooting

### Q1: Why is a device showing as "Offline" on my dashboard?
**Answer**: A device appears offline if no telemetry packet is received by Azure IoT Hub for more than 5 minutes.
* *Action*: Maintenance engineers should verify power/battery level, check local Wi-Fi connectivity, and confirm the device's physical status LED.

### Q2: How do I change the temperature display unit from Celsius (°C) to Fahrenheit (°F)?
**Answer**:
1. Click your **Profile Icon** in the top-right corner of the portal.
2. Select **User Preferences**.
3. Under *Temperature Unit*, select **Fahrenheit (°F)**.
4. Click **Save Settings**.

### Q3: I stopped receiving email notifications for Warning alerts. What should I check?
**Answer**:
1. Verify that your email address is correctly configured under **Profile > Notifications**.
2. Check your email client's *Junk/Spam* folder for messages from `alerts@iot-monitor.azure.com`.
3. Check with your System Administrator to verify whether your account's notification preferences were changed or muted.

### Q4: Can I export raw sensor telemetry data for the last 6 months?
**Answer**: Yes! Go to **Reports > Custom Export**, select a date range up to 1 year, choose your sensors, and click **Export as CSV / Excel**.

### Q5: How do I request access to additional room dashboards or admin features?
**Answer**: Contact your **System Administrator** or submit a ticket through the internal IT helpdesk requesting an RBAC role upgrade.

---

## 9. Technical Support & Emergency Escalation

If you encounter system issues or physical environmental emergencies, contact the appropriate team using the matrix below:

| Escalation Level | Contact Team | Scope / Responsibilities | Response SLA |
|------------------|--------------|--------------------------|--------------|
| **Tier 1 Support** | Helpdesk (`support@company.com`) | Login issues, basic portal usage, password resets | 4 Hours |
| **Tier 2 Operations** | Operations Team (`ops-iot@company.com`) | Unacknowledged critical alerts, dashboard data gaps | 30 Minutes |
| **Tier 3 Engineering** | IoT & Azure Engineers (`iot-eng@company.com`) | Sensor hardware failures, Azure cloud service outages | 15 Minutes |
| **Facility Emergency** | On-Call Facility Manager (Ext. 9911) | Physical HVAC failure, fire/water/high temp threat | Immediate |

---
*End of End-User Manual (`users.md`)*
