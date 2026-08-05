# Azure Functions Python Backend - Azure Digital Twins & IoT Telemetry Pipeline

This directory contains the production-ready **Azure Functions (Python v2)** backend service for the **Azure IoT Environment Monitoring System**.

The service ingests telemetry sent from **M5Stick** IoT devices via **Azure IoT Hub**, updates the corresponding **Azure Digital Twin** model instance (`m5stick-01`), and broadcasts live updates to the **React** frontend dashboard via **Azure SignalR Service**.

---

## 🏗️ Architecture & Telemetry Flow

```text
+------------------------+
|   M5Stick IoT Device   | (ENV III Sensor: Temp, Humidity, Pressure)
+-----------+------------+
            │ HTTPS / MQTT Telemetry
            ▼
+------------------------+
|     Azure IoT Hub      | (iot-ship-twin.azure-devices.net)
+-----------+------------+
            │ Event Hub Compatible Endpoint
            ▼
+------------------------+
|     Azure Function     | (Python v2: IoTHubTelemetryProcessor)
+-----+--------------+---+
      │              │
      │ JSON Patch   │ SignalR Broadcast
      ▼              ▼
+-----------+  +-----------+
|   Azure   |  |   Azure   |
|  Digital  |  |  SignalR  |
|   Twins   |  |  Service  |
+-----------+  +-----+-----+
                     │ WebSockets
                     ▼
               +-----------+
               |   React   |
               | Dashboard |
               +-----------+
```

---

## 📁 Project Structure

```text
azure-function/
├── function_app.py           # Azure Functions v2 application routes & triggers
├── host.json                 # Extension bundle and log level settings
├── local.settings.json       # Local configuration & connection strings (gitignored)
├── requirements.txt          # Production Python dependencies
├── .funcignore               # Deployment exclusion filter
├── shared/                   # Modular helper library
│   ├── __init__.py           # Package exports
│   ├── logger.py             # Structured JSON logger
│   ├── telemetry_parser.py   # Telemetry parser, model validation & JSON Patch generator
│   ├── digital_twins.py      # Azure Digital Twins SDK client manager
│   └── signalr.py            # Azure SignalR REST API manager
├── tests/                    # Unit testing suite
│   ├── __init__.py
│   └── test_telemetry.py     # Pytest unit tests for telemetry parser & patches
└── .vscode/                  # VS Code launch and settings configuration
```

---

## ⚙️ Environment Variables Reference

| Variable Name | Description | Example / Value |
|---|---|---|
| `ADT_URL` | Azure Digital Twins instance URL | `https://adt-ship-twins-instance.api.wcus.digitaltwins.azure.net` |
| `EVENT_HUB_CONNECTION` | IoT Hub / Event Hub connection string | `Endpoint=sb://...;SharedAccessKeyName=service;SharedAccessKey=...` |
| `EVENT_HUB_NAME` | Event Hub / Telemetry Entity Name | `telemetry` or `messages/events` |
| `SIGNALR_CONNECTION_STRING` | Azure SignalR Service Connection String | `Endpoint=https://...;AccessKey=...;Version=1.0;` |
| `SIGNALR_HUB_NAME` | SignalR Hub Name | `telemetryHub` |
| `AZURE_CLIENT_ID` | (Optional for Local Auth) Service Principal App ID | `00000000-0000-0000-0000-000000000000` |
| `AZURE_CLIENT_SECRET` | (Optional for Local Auth) Service Principal Secret | `your-app-secret` |
| `AZURE_TENANT_ID` | (Optional for Local Auth) Azure Directory Tenant ID | `00000000-0000-0000-0000-000000000000` |

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- **Python 3.10** or **3.11** installed
- **Azure Functions Core Tools v4** (`npm install -g azure-functions-core-tools@4`)
- **Azure CLI** (`az login`)

### 2. Create Virtual Environment & Install Dependencies
```bash
cd azure-function
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Run Unit Tests
```bash
python -m unittest discover tests
# or
pytest tests/
```

### 4. Start Local Azure Functions Host
```bash
func start
```

---

## 🧪 Local Testing & Verification

### Test 1: Health Check Endpoint
```bash
curl -X GET http://localhost:7071/api/health
```

**Expected Response**:
```json
{
  "status": "Healthy",
  "service": "Azure IoT Digital Twin Backend Function",
  "digitalTwinEndpoint": "https://adt-ship-twins-instance.api.wcus.digitaltwins.azure.net",
  "digitalTwinConnected": true,
  "signalrConfigured": true
}
```

### Test 2: Ingest Test Telemetry (HTTP POST)
```bash
curl -X POST http://localhost:7071/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "event": {
      "origin": "m5stick-01",
      "payload": {
        "deviceId": "m5stick-01",
        "temperature": 23.66,
        "humidity": 63.72,
        "pressure": 1013.25,
        "timestamp": 1785912932
      }
    }
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Telemetry processed successfully",
  "deviceId": "m5stick-01",
  "digitalTwinUpdated": true,
  "signalrBroadcast": true,
  "data": {
    "deviceId": "m5stick-01",
    "temperature": 23.66,
    "humidity": 63.72,
    "pressure": 1013.25,
    "status": "Online",
    "timestamp": "2026-08-05T10:30:00Z"
  }
}
```

---

## 🔐 Azure Managed Identity & Authentication Best Practices

For security, **never store passwords or client secrets in app settings or source code**.

### 1. Enable System-Assigned Managed Identity on Azure Function App
```bash
az functionapp identity assign \
  --name func-environment-monitoring \
  --resource-group rg-iot-temperature-azure
```

### 2. Grant Azure Digital Twins Data Owner Role
Assign the **Azure Digital Twins Data Owner** role to the Function App's Principal ID:

```bash
# Get Principal ID of Function App
PRINCIPAL_ID=$(az functionapp identity show \
  --name func-environment-monitoring \
  --resource-group rg-iot-temperature-azure \
  --query principalId -o tsv)

# Assign Role
az role assignment create \
  --assignee $PRINCIPAL_ID \
  --role "Azure Digital Twins Data Owner" \
  --scope "/subscriptions/<YOUR_SUBSCRIPTION_ID>/resourceGroups/rg-iot-temperature-azure/providers/Microsoft.DigitalTwins/digitalTwinsInstances/adt-ship-twins-instance"
```

---

## ☁️ Deployment to Azure Functions

### 1. Create Azure Function App (Linux / Python)
```bash
# Create Storage Account
az storage account create \
  --name saenvironmentmonitoring \
  --location westus \
  --resource-group rg-iot-temperature-azure \
  --sku Standard_LRS

# Create Function App
az functionapp create \
  --name func-environment-monitoring \
  --storage-account saenvironmentmonitoring \
  --consumption-plan-location westus \
  --resource-group rg-iot-temperature-azure \
  --os-type Linux \
  --runtime python \
  --runtime-version 3.10 \
  --functions-version 4
```

### 2. Configure Application Settings in Azure
```bash
az functionapp config appsettings set \
  --name func-environment-monitoring \
  --resource-group rg-iot-temperature-azure \
  --settings \
    ADT_URL="https://adt-ship-twins-instance.api.wcus.digitaltwins.azure.net" \
    EVENT_HUB_CONNECTION="<YOUR_EVENT_HUB_CONNECTION_STRING>" \
    EVENT_HUB_NAME="telemetry" \
    SIGNALR_CONNECTION_STRING="<YOUR_SIGNALR_CONNECTION_STRING>" \
    SIGNALR_HUB_NAME="telemetryHub"
```

### 3. Publish Code to Azure Functions
```bash
func azure functionapp publish func-environment-monitoring
```
