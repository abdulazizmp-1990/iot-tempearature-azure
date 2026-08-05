# ⚓ Azure IoT Environment Monitoring & Digital Twins System

An enterprise-grade, end-to-end IoT monitoring solution designed for vessel and industrial environmental control. 

This repository connects physical **M5StickC Plus (ESP32)** hardware with an **M5Stack ENV III Sensor** to **Azure IoT Hub**, processes telemetry via a **Python Azure Functions** backend, synchronizes real-time state with **Azure Digital Twins**, and broadcasts live metrics to an **Enterprise React 19 3D Dashboard**.

---

## 🏗️ Architecture & Data Flow

```text
+-------------------------------------------------------------------------+
|                              HARDWARE LAYER                             |
|  M5StickC Plus (ESP32) + M5Stack ENV III Unit (SHT30 + QMP6988)        |
+------------------------------------+------------------------------------+
                                     │ HTTPS REST / TLS (SAS Token)
                                     ▼
+-------------------------------------------------------------------------+
|                             AZURE CLOUD LAYER                           |
|  Azure IoT Hub (iot-ship-twin.azure-devices.net)                        |
+------------------------------------+------------------------------------+
                                     │ Event Hub Endpoint
                                     ▼
+-------------------------------------------------------------------------+
|                             BACKEND LAYER                               |
|  Azure Functions Python v2 (IoTHubTelemetryProcessor)                   |
|  ├── Updates Azure Digital Twins (dtmi:ship:Sensor;1)                    |
|  └── Dispatches Live SignalR Telemetry Events                           |
+------------------------------------+------------------------------------+
                                     │ WebSockets / REST API
                                     ▼
+-------------------------------------------------------------------------+
|                             FRONTEND LAYER                              |
|  React 19 + Vite + TypeScript + Material UI + Three.js 3D Dashboard     |
+-------------------------------------------------------------------------+
```

---

## 📂 Repository Structure

```text
iot-tempearature-azure/
├── m5stick_env3_azure/       # C++ Arduino Firmware for M5StickC Plus & ENV III Unit
│   └── m5stick_env3_azure.ino # Standalone I2C drivers (SHT30/QMP6988), WiFi, SAS Auth & HTTPS
├── azure-function/           # Production Python Azure Functions (v2 Programming Model)
│   ├── function_app.py       # Event Hub Trigger & HTTP APIs (/api/health, /api/telemetry)
│   ├── requirements.txt      # Azure SDK dependencies
│   ├── shared/               # Telemetry parser, RFC 6902 JSON patch & SignalR manager
│   └── tests/                # Pytest / Unittest automated test suite
├── react-dashboard/          # Enterprise React 19 Web Application
│   ├── src/components/3d/    # Three.js 3D Spatial Digital Twin vessel model
│   ├── src/components/charts/# Recharts live telemetry analytics with time-range selector
│   ├── src/components/tables/# Material UI X DataGrid for registered IoT devices
│   └── src/store/            # Zustand global state manager
├── sensor-model.json         # DTDL v2 Digital Twin Interface Model (dtmi:ship:Sensor;1)
├── docs/                     # Architecture documentation & system specifications
└── README.md                 # System overview and quickstart guide
```

---

## 📡 DTDL v2 Digital Twin Model (`sensor-model.json`)

The Digital Twin instance `m5stick-01` adheres to interface **`dtmi:ship:Sensor;1`**:

```json
{
  "@id": "dtmi:ship:Sensor;1",
  "@type": "Interface",
  "@context": "dtmi:dtdl:context;2",
  "displayName": "Sensor",
  "contents": [
    { "@type": "Property", "name": "temperature", "schema": "double" },
    { "@type": "Property", "name": "humidity", "schema": "double" },
    { "@type": "Property", "name": "pressure", "schema": "double" },
    { "@type": "Property", "name": "status", "schema": "string" },
    { "@type": "Property", "name": "lastUpdated", "schema": "string" }
  ]
}
```

---

## 🚀 Quick Start Guide

### 1. Hardware Setup (M5StickC Plus + ENV III)
- Connect M5Stack ENV III Unit to Grove Port A (`SDA = GPIO 32`, `SCL = GPIO 33`).
- Open `m5stick_env3_azure/m5stick_env3_azure.ino` in Arduino IDE.
- Select board **M5StickC-Plus** and library **M5Unified**.
- Upload sketch to ESP32.

### 2. Backend Setup (Azure Functions Python)
```bash
cd azure-function

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run unit tests
python3 -m unittest discover -s tests

# Start Azurite emulator & Functions Host
npx azurite &
func start --port 7072
```

### 3. Frontend Setup (React 19 Dashboard)
```bash
cd react-dashboard

# Install dependencies
npm install

# Start Vite Development Server
npm run dev
```

Open **[http://localhost:3001/](http://localhost:3001/)** in your browser to view the live dashboard!

---

## 🧪 Verification & Health Check

### Test Azure Function Health Endpoint:
```bash
curl -s http://localhost:7072/api/health
```

### Test Telemetry Ingestion Endpoint:
```bash
curl -s -X POST http://localhost:7072/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "event": {
      "origin": "m5stick-01",
      "payload": {
        "deviceId": "m5stick-01",
        "temperature": 23.25,
        "humidity": 65.81,
        "pressure": 1013.25,
        "timestamp": 1785933999
      }
    }
  }'
```

---

## 🔐 Azure Security & Authentication
- Direct HTTPS SAS Token generation (`mbedtls` SHA256 HMAC & Base64) on ESP32 hardware.
- `DefaultAzureCredential` support for Azure Managed Identity when deployed to production.
- Zero hardcoded secrets in source control (git-ignored `local.settings.json`).

---

## 📄 License
Created for IoT Environment Monitoring & Azure Digital Twin Applications.
