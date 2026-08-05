# 📟 M5StickC Plus Firmware Architecture & Implementation Guide

This document provides a detailed breakdown of the C++ Arduino firmware located at [`m5stick_env3_azure/m5stick_env3_azure.ino`](file:///home/c864/Projects/iot-tempearature-azure/m5stick_env3_azure/m5stick_env3_azure.ino).

---

## 📌 Executive Summary

The firmware runs autonomously on the **M5StickC Plus (ESP32)** hardware. It interfaces with the **M5Stack ENV III Unit** (containing SHT30 and QMP6988 sensors), formats environmental data, renders real-time visual metrics on the device OLED screen, and transmits secure JSON telemetry directly to **Azure IoT Hub** over HTTPS.

---

## 🏗️ Hardware Architecture & I2C Bus Layout

```text
+-------------------------------------------------------------------+
|                        M5StickC Plus (ESP32)                      |
|                                                                   |
|   +-----------------------+              +--------------------+   |
|   |   Grove Port A        |              | Color OLED Display |   |
|   |   SDA: GPIO 32        |              | TextSize 2 (RGB)   |   |
|   |   SCL: GPIO 33        |              +--------------------+   |
|   +-----------+-----------+                                       |
+---------------|---------------------------------------------------+
                │ I2C Bus (100 kHz)
                ├── SHT30  (0x44) -> Temperature & Humidity
                └── QMP6988 (0x70) -> Barometric Pressure
```

### Pin Configuration
| Interface | ESP32 GPIO Pin | Function |
|---|---|---|
| **Grove SDA** | `GPIO 32` | I2C Data Line |
| **Grove SCL** | `GPIO 33` | I2C Clock Line |
| **Button A** | `GPIO 37` | Manual Telemetry Push Trigger |

---

## ⚙️ Core Components & Functionality

```text
[ 1. Connect Wi-Fi & Sync NTP Clock ]
                 │
                 ▼
[ 2. Read Sensors (SHT30 & QMP6988) ]
                 │
                 ▼
[ 3. Display Metrics on OLED Screen ]
                 │
                 ▼
[ 4. Send Encrypted JSON to Azure Cloud ]
```

### 1. Self-Contained Sensor Drivers
To prevent external library dependency failures, the firmware features self-contained, low-level I2C drivers:

- **SHT30 Driver (`0x44`)**: Sends high-repeatability measurement command `0x2C 0x06`, reads 6 data bytes, and computes:
  $$\text{Temperature (°C)} = -45.0 + \left(175.0 \times \frac{\text{rawTemp}}{65535}\right)$$
  $$\text{Humidity (\%)} = 100.0 \times \left(\frac{\text{rawHum}}{65535}\right)$$

- **QMP6988 Pressure Driver (`0x70`)**:
  - Issues soft-reset command `0xE6` to register `0xE0`.
  - Configures oversampling (Temp x2, Pressure x16) and IIR filter.
  - Reads 25 bytes of factory calibration parameters (`COE_a0`..`COE_bp3`) in 2 non-truncating I2C chunks (`0xA0` and `0xB0`).
  - Applies scaled fixed-point polynomial expansion to calculate accurate sea-level barometric pressure in **hPa**.

---

### 2. Embedded Security & Azure SAS Token Generation
The device authenticates with Azure IoT Hub using a **Shared Access Signature (SAS)** token generated natively using `mbedtls` cryptography without requiring external cloud SDKs:

1. **NTP Time Synchronization**: Syncs epoch time from `pool.ntp.org`.
2. **Resource URI & Expiry**: Encodes `iot-ship-twin.azure-devices.net/devices/m5stick-01` and sets 1-hour expiry.
3. **HMAC-SHA256 Signature**: Decodes the Base64 device key and signs the resource string using `mbedtls_md_hmac`.
4. **Base64 Encoding**: Encodes the signature into an Azure authorization header:
   ```text
   SharedAccessSignature sr=iot-ship-twin.azure-devices.net%2Fdevices%2Fm5stick-01&sig=...&se=1785934124
   ```

---

### 3. Display Subsystem (`updateDisplay`)
The firmware renders color-coded environmental metrics on the 240x135 TFT screen using **M5Unified**:

- 🟨 **Yellow (`TextSize 2`)**: `TEMP: 23.5 C`
- 🟦 **Cyan (`TextSize 2`)**: `HUM : 64.1 %`
- 🟩 **Green (`TextSize 2`)**: `PRES: 1013 hPa`
- ⬜ **White Header/Footer**: Displays Wi-Fi Status, Device ID, and Button A prompt.

---

### 4. Wi-Fi Reconnection & Network Scanner Guard
- **`ensureWiFiConnected()`**: Automatically detects Wi-Fi disconnections before sending telemetry and attempts automatic reconnection.
- **`scanWiFiNetworks()`**: If Wi-Fi fails on startup, scans all nearby 2.4 GHz SSIDs and displays their RSSI signal strength on screen and Serial Monitor for instant troubleshooting.

---

## 📤 HTTPS Telemetry Transmission Payload

Telemetry is sent via HTTP POST to:
`POST /devices/m5stick-01/messages/events?api-version=2020-09-30`

### JSON Payload:
```json
{
  "deviceId": "m5stick-01",
  "temperature": 23.41,
  "humidity": 64.11,
  "pressure": 1013.25,
  "timestamp": 1785934124
}
```

---

## 🔄 Program Flow Summary

1. **`setup()`**: Initializes serial (115200 baud), M5Unified display, connects to Wi-Fi (`cubet_out`), syncs NTP clock, and probes I2C bus (`0x44` SHT30 & `0x70` QMP6988).
2. **`loop()`**: Reads sensors every 200ms, refreshes screen, and transmits telemetry to Azure every 10 seconds (or instantly on **Button A** press).
