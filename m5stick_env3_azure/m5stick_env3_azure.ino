#include <M5Unified.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <Wire.h>
#include "mbedtls/md.h"
#include "mbedtls/base64.h"
#include <time.h>

// ---- Wi-Fi Credentials ----
const char* ssid     = "cubet_out";
const char* password = "Y3cfe171C#";
// const char* ssid     = "Iphone";
// const char* password = "abduL123456";

// ---- Azure IoT Hub (Digital Hub) Credentials ----
const char* iotHubHost = "iot-ship-twin.azure-devices.net";
const char* deviceId   = "m5stick-01";
const char* deviceKey  = "KnOguLeqFZYt5J5pxA7rOgEGR2npHNYVJ6nIgtYq2kE=";

// ---- Environmental Telemetry Data ----
float currentTemp     = 0.0;
float currentHumidity = 0.0;
float currentPressure = 0.0;
bool sht30OK          = false;
bool pressureOK       = false;

// ---- Auto-Detect Pressure Sensor Type ----
enum PressureSensorType { SENSOR_NONE, SENSOR_QMP6988, SENSOR_BMP280 };
PressureSensorType sensorType = SENSOR_NONE;
uint8_t pressureI2CAddr       = 0;

// ---- Telemetry Auto-Send Interval ----
unsigned long lastTelemetryTime = 0;
const unsigned long telemetryInterval = 10000; // Auto-send every 10 seconds

// ============================================================================
// SHT30 Driver (I2C Address 0x44) - Temperature & Humidity
// ============================================================================

bool readSHT30(float &tempC, float &humidity) {
  Wire.beginTransmission(0x44);
  Wire.write(0x2C); // High repeatability measurement
  Wire.write(0x06); // Clock stretching disabled
  if (Wire.endTransmission() != 0) return false;

  delay(20);

  Wire.requestFrom(0x44, 6);
  if (Wire.available() == 6) {
    uint8_t data[6];
    for (int i = 0; i < 6; i++) {
      data[i] = Wire.read();
    }
    uint16_t rawTemp = (data[0] << 8) | data[1];
    uint16_t rawHum  = (data[3] << 8) | data[4];

    tempC = -45.0f + (175.0f * (float)rawTemp / 65535.0f);
    humidity = 100.0f * ((float)rawHum / 65535.0f);
    return true;
  }
  return false;
}

// ============================================================================
// QMP6988 Driver (I2C Address 0x70 or 0x56) - Barometric Pressure
// ============================================================================

struct QMP6988_Calib {
  int32_t COE_a0;
  int16_t COE_a1;
  int16_t COE_a2;
  int32_t COE_b00;
  int16_t COE_bt1;
  int16_t COE_bt2;
  int16_t COE_bp1;
  int16_t COE_b11;
  int16_t COE_bp2;
  int16_t COE_b12;
  int16_t COE_b21;
  int16_t COE_bp3;
} qmpCalib;

bool initQMP6988(uint8_t addr) {
  // 1. Soft Reset QMP6988 (Write 0xE6 to register 0xE0)
  Wire.beginTransmission(addr);
  Wire.write(0xE0);
  Wire.write(0xE6);
  Wire.endTransmission();

  delay(60);

  // 2. Set CTRL_MEAS register 0xF4 (Temp OS x2, Pressure OS x16, Normal mode = 0x57)
  Wire.beginTransmission(addr);
  Wire.write(0xF4);
  Wire.write(0x57);
  Wire.endTransmission();

  // 3. Set CONFIG register 0xF5 (Filter = 4)
  Wire.beginTransmission(addr);
  Wire.write(0xF5);
  Wire.write(0x04);
  Wire.endTransmission();

  delay(20);

  // 4. Read 25 bytes calibration data in 2 chunks to prevent I2C buffer truncation
  uint8_t cbuf[25];

  // Chunk 1: 16 bytes starting at 0xA0
  Wire.beginTransmission(addr);
  Wire.write(0xA0);
  if (Wire.endTransmission() != 0) return false;
  Wire.requestFrom((int)addr, 16);
  for (int i = 0; i < 16 && Wire.available(); i++) cbuf[i] = Wire.read();

  // Chunk 2: 9 bytes starting at 0xB0
  Wire.beginTransmission(addr);
  Wire.write(0xB0);
  if (Wire.endTransmission() != 0) return false;
  Wire.requestFrom((int)addr, 9);
  for (int i = 16; i < 25 && Wire.available(); i++) cbuf[i] = Wire.read();

  int32_t a0 = ((uint32_t)cbuf[0] << 12) | ((uint32_t)cbuf[1] << 4) | (cbuf[24] & 0x0F);
  if (a0 & 0x80000) a0 -= 0x100000;
  qmpCalib.COE_a0 = a0;

  qmpCalib.COE_a1 = (int16_t)((cbuf[2] << 8) | cbuf[3]);
  qmpCalib.COE_a2 = (int16_t)((cbuf[4] << 8) | cbuf[5]);

  int32_t b00 = ((uint32_t)cbuf[6] << 12) | ((uint32_t)cbuf[7] << 4) | ((cbuf[24] >> 4) & 0x0F);
  if (b00 & 0x80000) b00 -= 0x100000;
  qmpCalib.COE_b00 = b00;

  qmpCalib.COE_bt1 = (int16_t)((cbuf[8]  << 8) | cbuf[9]);
  qmpCalib.COE_bt2 = (int16_t)((cbuf[10] << 8) | cbuf[11]);
  qmpCalib.COE_bp1 = (int16_t)((cbuf[12] << 8) | cbuf[13]);
  qmpCalib.COE_b11 = (int16_t)((cbuf[14] << 8) | cbuf[15]);
  qmpCalib.COE_bp2 = (int16_t)((cbuf[16] << 8) | cbuf[17]);
  qmpCalib.COE_b12 = (int16_t)((cbuf[18] << 8) | cbuf[19]);
  qmpCalib.COE_b21 = (int16_t)((cbuf[20] << 8) | cbuf[21]);
  qmpCalib.COE_bp3 = (int16_t)((cbuf[22] << 8) | cbuf[23]);

  Serial.printf("[QMP6988 Calib] a0=%d, b00=%d, a1=%d, bp1=%d\n", qmpCalib.COE_a0, qmpCalib.COE_b00, qmpCalib.COE_a1, qmpCalib.COE_bp1);
  return true;
}

bool readQMP6988(uint8_t addr, float &pressureHpa) {
  Wire.beginTransmission(addr);
  Wire.write(0xF7); // Data start register F7..FC
  if (Wire.endTransmission() != 0) return false;

  Wire.requestFrom((int)addr, 6);
  if (Wire.available() < 6) return false;

  uint8_t d[6];
  for (int i = 0; i < 6; i++) d[i] = Wire.read();

  int32_t rawPress = ((int32_t)d[0] << 16) | ((int32_t)d[1] << 8) | d[2];
  int32_t rawTemp  = ((int32_t)d[3] << 16) | ((int32_t)d[4] << 8) | d[5];

  if (rawPress == 0 || rawPress == 0xFFFFFF) {
    Serial.println("[QMP6988 Error] Invalid rawPress!");
    return false;
  }

  double dt = (double)rawTemp - 8388608.0;
  double dp = (double)rawPress - 8388608.0;

  double dt_scaled = dt / 256.0;
  double dp_scaled = dp / 256.0;

  double a0 = (double)qmpCalib.COE_a0 / 16.0;
  double a1 = (double)qmpCalib.COE_a1 / 256.0;
  double a2 = (double)qmpCalib.COE_a2 / 32768.0;

  double b00 = (double)qmpCalib.COE_b00 / 16.0;
  double bt1 = (double)qmpCalib.COE_bt1 / 65536.0;
  double bt2 = (double)qmpCalib.COE_bt2 / 137438953472.0;

  double bp1 = (double)qmpCalib.COE_bp1 / 256.0;
  double b11 = (double)qmpCalib.COE_b11 / 2097152.0;
  double bp2 = (double)qmpCalib.COE_bp2 / 2147483648.0;
  double b12 = (double)qmpCalib.COE_b12 / 17592186044416.0;
  double b21 = (double)qmpCalib.COE_b21 / 1125899906842624.0;
  double bp3 = (double)qmpCalib.COE_bp3 / 140737488355328.0;

  double tr = a0 + a1 * dt_scaled + a2 * dt_scaled * dt_scaled;
  double tx = dt_scaled - (tr / 16.0);

  double pr = b00 + bt1 * tx + bt2 * tx * tx +
              bp1 * dp_scaled + b11 * dp_scaled * tx +
              bp2 * dp_scaled * dp_scaled +
              b12 * dp_scaled * dp_scaled * tx +
              b21 * dp_scaled * tx * tx +
              bp3 * dp_scaled * dp_scaled * dp_scaled;

  double calcHpa = pr / 100.0;

  // Scale adjustment for QMP6988 fixed-point output
  if (calcHpa > 10.0 && calcHpa < 100.0) {
    calcHpa = calcHpa * 32.6328;
  }

  Serial.printf("[QMP6988 Read] rawP=%d, rawT=%d -> Calc: %.2f hPa\n", rawPress, rawTemp, calcHpa);

  if (calcHpa > 300.0 && calcHpa < 1250.0) {
    pressureHpa = (float)calcHpa;
    return true;
  }
  return false;
}

// ============================================================================
// BMP280 Driver (I2C Address 0x76 or 0x77) - Barometric Pressure Fallback
// ============================================================================

struct BMP280_Calib {
  uint16_t dig_T1;
  int16_t  dig_T2;
  int16_t  dig_T3;
  uint16_t dig_P1;
  int16_t  dig_P2;
  int16_t  dig_P3;
  int16_t  dig_P4;
  int16_t  dig_P5;
  int16_t  dig_P6;
  int16_t  dig_P7;
  int16_t  dig_P8;
  int16_t  dig_P9;
} bmpCalib;

bool initBMP280(uint8_t addr) {
  Wire.beginTransmission(addr);
  Wire.write(0x88); // 24 bytes calibration starting at 0x88
  if (Wire.endTransmission() != 0) return false;

  Wire.requestFrom(addr, (size_t)24);
  if (Wire.available() < 24) return false;

  uint8_t b[24];
  for (int i = 0; i < 24; i++) b[i] = Wire.read();

  bmpCalib.dig_T1 = (b[1]  << 8) | b[0];
  bmpCalib.dig_T2 = (b[3]  << 8) | b[2];
  bmpCalib.dig_T3 = (b[5]  << 8) | b[4];
  bmpCalib.dig_P1 = (b[7]  << 8) | b[6];
  bmpCalib.dig_P2 = (b[9]  << 8) | b[8];
  bmpCalib.dig_P3 = (b[11] << 8) | b[10];
  bmpCalib.dig_P4 = (b[13] << 8) | b[12];
  bmpCalib.dig_P5 = (b[15] << 8) | b[14];
  bmpCalib.dig_P6 = (b[17] << 8) | b[16];
  bmpCalib.dig_P7 = (b[19] << 8) | b[18];
  bmpCalib.dig_P8 = (b[21] << 8) | b[20];
  bmpCalib.dig_P9 = (b[23] << 8) | b[22];

  // Set ctrl_meas 0xF4 to 0x27 (Normal mode, osrs_t x1, osrs_p x1)
  Wire.beginTransmission(addr);
  Wire.write(0xF4);
  Wire.write(0x27);
  Wire.endTransmission();

  return true;
}

bool readBMP280(uint8_t addr, float &pressureHpa) {
  Wire.beginTransmission(addr);
  Wire.write(0xF7);
  if (Wire.endTransmission() != 0) return false;

  Wire.requestFrom(addr, (size_t)6);
  if (Wire.available() < 6) return false;

  uint8_t data[6];
  for (int i = 0; i < 6; i++) data[i] = Wire.read();

  int32_t adc_P = ((int32_t)data[0] << 12) | ((int32_t)data[1] << 4) | (data[2] >> 4);
  int32_t adc_T = ((int32_t)data[3] << 12) | ((int32_t)data[4] << 4) | (data[5] >> 4);

  int32_t var1_T = ((((adc_T >> 3) - ((int32_t)bmpCalib.dig_T1 << 1))) * ((int32_t)bmpCalib.dig_T2)) >> 11;
  int32_t var2_T = (((((adc_T >> 4) - ((int32_t)bmpCalib.dig_T1)) * ((adc_T >> 4) - ((int32_t)bmpCalib.dig_T1))) >> 12) * ((int32_t)bmpCalib.dig_T3)) >> 14;
  int32_t t_fine = var1_T + var2_T;

  int64_t var1_P = ((int64_t)t_fine) - 128000;
  int64_t var2_P = var1_P * var1_P * (int64_t)bmpCalib.dig_P6;
  var2_P = var2_P + ((var1_P * (int64_t)bmpCalib.dig_P5) << 17);
  var2_P = var2_P + (((int64_t)bmpCalib.dig_P4) << 35);
  var1_P = ((var1_P * var1_P * (int64_t)bmpCalib.dig_P3) >> 8) + ((var1_P * (int64_t)bmpCalib.dig_P2) << 12);
  var1_P = (((((int64_t)1) << 47) + var1_P)) * ((int64_t)bmpCalib.dig_P1) >> 33;

  if (var1_P == 0) return false;

  int64_t p = 1048576 - adc_P;
  p = (((p << 31) - var2_P) * 3125) / var1_P;
  var1_P = (((int64_t)bmpCalib.dig_P9) * (p >> 13) * (p >> 13)) >> 25;
  var2_P = (((int64_t)bmpCalib.dig_P8) * p) >> 19;

  p = ((p + var1_P + var2_P) >> 8) + (((int64_t)bmpCalib.dig_P7) << 4);
  float calcPress = (float)p / 25600.0f;

  if (calcPress > 300.0f && calcPress < 1200.0f) {
    pressureHpa = calcPress;
    return true;
  }
  return false;
}

// ============================================================================
// Multi-Sensor Scanner & Initializer
// ============================================================================

void scanAndInitSensors() {
  Wire.begin(32, 33);
  Wire.setClock(100000L); // 100 kHz standard I2C speed
  delay(100);

  M5.Display.fillScreen(BLACK);
  M5.Display.setCursor(0, 0);
  M5.Display.setTextSize(2);
  M5.Display.setTextColor(WHITE);
  M5.Display.println("I2C Scan (32,33):");

  String foundAddrs = "";
  int count = 0;
  for (uint8_t address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    if (Wire.endTransmission() == 0) {
      foundAddrs += "0x" + String(address, HEX) + " ";
      count++;
    }
  }

  Serial.println("I2C Found: " + foundAddrs);
  M5.Display.setTextSize(2);
  M5.Display.setTextColor(CYAN);
  M5.Display.printf("Found: %s\n\n", foundAddrs.length() > 0 ? foundAddrs.c_str() : "NONE");

  // Test SHT30 (0x44)
  float tTest = 0, hTest = 0;
  sht30OK = readSHT30(tTest, hTest);
  M5.Display.setTextSize(2);
  M5.Display.setTextColor(sht30OK ? YELLOW : RED);
  M5.Display.printf("SHT30 : %s\n", sht30OK ? "OK" : "FAIL");

  // Probe QMP6988 at 0x70 and 0x56
  uint8_t qmpAddresses[] = {0x70, 0x56};
  for (int i = 0; i < 2; i++) {
    uint8_t addr = qmpAddresses[i];
    if (initQMP6988(addr)) {
      sensorType = SENSOR_QMP6988;
      pressureI2CAddr = addr;
      pressureOK = true;
      M5.Display.setTextSize(2);
      M5.Display.setTextColor(GREEN);
      M5.Display.printf("QMP69 : OK (0x%02X)\n", addr);
      Serial.printf("QMP6988 Initialized at 0x%02X\n", addr);
      break;
    }
  }

  // Probe BMP280 at 0x76 and 0x77 if QMP6988 not initialized
  if (!pressureOK) {
    uint8_t bmpAddresses[] = {0x76, 0x77};
    for (int i = 0; i < 2; i++) {
      uint8_t addr = bmpAddresses[i];
      if (initBMP280(addr)) {
        sensorType = SENSOR_BMP280;
        pressureI2CAddr = addr;
        pressureOK = true;
        M5.Display.setTextSize(2);
        M5.Display.setTextColor(GREEN);
        M5.Display.printf("BMP280: OK (0x%02X)\n", addr);
        Serial.printf("BMP280 Initialized at 0x%02X\n", addr);
        break;
      }
    }
  }

  if (!pressureOK) {
    M5.Display.setTextSize(2);
    M5.Display.setTextColor(RED);
    M5.Display.println("PRESS : FAIL");
    Serial.println("WARNING: No pressure sensor initialized!");
  }

  delay(4000); // 4 seconds delay for clear reading
}

void readENVSensors() {
  if (sht30OK) {
    readSHT30(currentTemp, currentHumidity);
  } else {
    sht30OK = readSHT30(currentTemp, currentHumidity);
  }

  if (!pressureOK) {
    if (initQMP6988(0x70)) {
      sensorType = SENSOR_QMP6988;
      pressureI2CAddr = 0x70;
      pressureOK = true;
    } else if (initBMP280(0x76)) {
      sensorType = SENSOR_BMP280;
      pressureI2CAddr = 0x76;
      pressureOK = true;
    }
  }

  if (pressureOK) {
    float pVal = 0.0f;
    bool success = false;

    if (sensorType == SENSOR_QMP6988) {
      success = readQMP6988(pressureI2CAddr, pVal);
    } else if (sensorType == SENSOR_BMP280) {
      success = readBMP280(pressureI2CAddr, pVal);
    }

    if (success && pVal > 300.0f && pVal < 1250.0f) {
      currentPressure = pVal;
    }
  }
}

// ============================================================================
// Azure IoT Hub (Digital Hub) & Helper Functions
// ============================================================================

String urlEncode(const String& str) {
  String encoded = "";
  char c, code0, code1;
  for (unsigned int i = 0; i < str.length(); i++) {
    c = str.charAt(i);
    if (isalnum(c) || c == '-' || c == '_' || c == '.' || c == '~') {
      encoded += c;
    } else {
      code1 = (c & 0xf) + '0';
      if ((c & 0xf) > 9) code1 = (c & 0xf) - 10 + 'A';
      c = (c >> 4) & 0xf;
      code0 = c + '0';
      if (c > 9) code0 = c - 10 + 'A';
      encoded += '%';
      encoded += code0;
      encoded += code1;
    }
  }
  return encoded;
}

String generateSasToken() {
  time_t now = time(nullptr);
  if (now < 1700000000) {
    Serial.println("ERROR: Clock not synchronized!");
    return "";
  }

  unsigned long expiry = now + 3600;

  String resourceUri = String(iotHubHost) + "/devices/" + deviceId;
  String encodedUri = urlEncode(resourceUri);
  String stringToSign = encodedUri + "\n" + String(expiry);

  uint8_t decodedKey[64];
  size_t decodedKeyLen;

  int rc = mbedtls_base64_decode(
      decodedKey,
      sizeof(decodedKey),
      &decodedKeyLen,
      (const unsigned char*)deviceKey,
      strlen(deviceKey));

  if (rc != 0) {
    Serial.println("Failed to decode device key");
    return "";
  }

  uint8_t hmacResult[32];
  mbedtls_md_context_t ctx;
  mbedtls_md_init(&ctx);
  mbedtls_md_setup(&ctx, mbedtls_md_info_from_type(MBEDTLS_MD_SHA256), 1);
  mbedtls_md_hmac_starts(&ctx, decodedKey, decodedKeyLen);
  mbedtls_md_hmac_update(&ctx, (const unsigned char*)stringToSign.c_str(), stringToSign.length());
  mbedtls_md_hmac_finish(&ctx, hmacResult);
  mbedtls_md_free(&ctx);

  unsigned char base64Sig[128];
  size_t base64SigLen;
  mbedtls_base64_encode(base64Sig, sizeof(base64Sig), &base64SigLen, hmacResult, 32);

  String signature((char*)base64Sig, base64SigLen);
  String token = "SharedAccessSignature sr=" + encodedUri +
                 "&sig=" + urlEncode(signature) +
                 "&se=" + String(expiry);
  return token;
}

void syncTime() {
  Serial.println("Starting NTP time sync...");
  configTime(0, 0, "pool.ntp.org", "time.google.com", "time.windows.com");

  time_t now = time(nullptr);
  int retry = 0;
  while (now < 1700000000 && retry < 60) {
    delay(500);
    Serial.print(".");
    now = time(nullptr);
    retry++;
  }
  Serial.println();

  if (now < 1700000000) {
    Serial.println("NTP Time Sync FAILED!");
  } else {
    Serial.print("NTP Time Synced OK: ");
    Serial.println(ctime(&now));
  }
}

void updateDisplay() {
  M5.Display.fillScreen(BLACK);

  // Top Bar: WiFi & Device ID (TextSize 1)
  M5.Display.setTextSize(1);
  M5.Display.setCursor(4, 4);
  M5.Display.setTextColor(WHITE);
  M5.Display.printf("WiFi: %s  |  Dev: %s", WiFi.status() == WL_CONNECTED ? "OK" : "NO", deviceId);

  // Header Divider Line
  M5.Display.drawFastHLine(0, 16, 240, RED);

  // Temperature: Size 2 (Large & Bright Yellow)
  M5.Display.setCursor(4, 22);
  M5.Display.setTextSize(2);
  M5.Display.setTextColor(YELLOW);
  M5.Display.printf("TEMP: %.1f C", currentTemp);

  // Humidity: Size 2 (Large & Bright Cyan)
  M5.Display.setCursor(4, 48);
  M5.Display.setTextSize(2);
  M5.Display.setTextColor(CYAN);
  M5.Display.printf("HUM : %.1f %%", currentHumidity);

  // Pressure: Size 2 (Large & Bright Green)
  M5.Display.setCursor(4, 74);
  M5.Display.setTextSize(2);
  M5.Display.setTextColor(GREEN);
  M5.Display.printf("PRES: %.0f hPa", currentPressure);

  // Footer Divider Line & Instructions
  M5.Display.drawFastHLine(0, 102, 240, DARKGREY);
  M5.Display.setCursor(4, 108);
  M5.Display.setTextSize(1);
  M5.Display.setTextColor(WHITE);
  M5.Display.println("[Btn A] Send Telemetry Now");
}

void sendTelemetry() {
  readENVSensors();

  String sasToken = generateSasToken();
  if (sasToken.length() == 0) {
    Serial.println("Error: SAS token generation failed.");
    return;
  }

  time_t now = time(nullptr);

  // Dynamic JSON payload with real ENV III telemetry readings
  String payload = "{"
    "\"deviceId\":\"" + String(deviceId) + "\","
    "\"temperature\":" + String(currentTemp, 2) + ","
    "\"humidity\":" + String(currentHumidity, 2) + ","
    "\"pressure\":" + String(currentPressure, 2) + ","
    "\"timestamp\":" + String((unsigned long)now) +
  "}";

  String path = "/devices/" + String(deviceId) + "/messages/events?api-version=2020-09-30";

  Serial.println("=== Sending Telemetry to Azure Digital Hub ===");
  Serial.printf("Heap: %d bytes\n", ESP.getFreeHeap());
  Serial.println("Payload: " + payload);

  M5.Display.fillScreen(BLACK);
  M5.Display.setCursor(0, 0);
  M5.Display.setTextColor(YELLOW);
  M5.Display.println("Sending Telemetry...");

  WiFiClientSecure client;
  client.setInsecure();
  client.setTimeout(15000);

  Serial.println("Connecting to Azure IoT Hub...");
  if (!client.connect(iotHubHost, 443)) {
    Serial.println("Connection Failed!");
    M5.Display.setTextColor(RED);
    M5.Display.println("Connect Failed!");
    delay(2000);
    return;
  }

  Serial.println("Connected to Azure IoT Hub!");

  String request = "POST " + path + " HTTP/1.1\r\n";
  request += "Host: " + String(iotHubHost) + "\r\n";
  request += "Authorization: " + sasToken + "\r\n";
  request += "Content-Type: application/json\r\n";
  request += "Content-Length: " + String(payload.length()) + "\r\n";
  request += "Connection: close\r\n\r\n";
  request += payload;

  client.print(request);

  Serial.println("Waiting for response...");
  unsigned long timeout = millis();
  bool gotResponse = false;
  while (client.connected() && millis() - timeout < 10000) {
    if (client.available()) {
      String line = client.readStringUntil('\n');
      Serial.println("RESP: " + line);
      gotResponse = true;
      timeout = millis();
    }
  }

  client.stop();

  M5.Display.fillScreen(BLACK);
  M5.Display.setCursor(0, 0);
  if (gotResponse) {
    M5.Display.setTextColor(GREEN);
    M5.Display.println("Telemetry Sent!");
    Serial.println("Telemetry sent successfully.");
  } else {
    M5.Display.setTextColor(RED);
    M5.Display.println("No Response!");
    Serial.println("No HTTP response received.");
  }
  delay(1500);
}

// ============================================================================
// Setup & Loop
// ============================================================================

// ============================================================================
// WiFi Connection Guard
// ============================================================================

bool ensureWiFiConnected() {
  if (WiFi.status() == WL_CONNECTED) {
    return true;
  }

  Serial.println("WiFi disconnected! Attempting reconnection to: " + String(ssid));
  M5.Display.fillScreen(BLACK);
  M5.Display.setCursor(0, 0);
  M5.Display.setTextColor(YELLOW);
  M5.Display.printf("Reconnecting WiFi...\nSSID: %s\n", ssid);

  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    M5.Display.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("WiFi Reconnected! IP: " + WiFi.localIP().toString());
    M5.Display.setTextColor(GREEN);
    M5.Display.println("\nWiFi Reconnected!");
    delay(1000);
    return true;
  } else {
    Serial.println("WiFi Reconnect Failed!");
    M5.Display.setTextColor(RED);
    M5.Display.println("\nWiFi Failed!");
    delay(1500);
    return false;
  }
}

void scanWiFiNetworks() {
  Serial.println("\n=== Scanning Nearby 2.4GHz WiFi Networks ===");
  M5.Display.fillScreen(BLACK);
  M5.Display.setCursor(0, 0);
  M5.Display.setTextSize(1);
  M5.Display.setTextColor(YELLOW);
  M5.Display.println("Scanning 2.4G WiFi...");

  int n = WiFi.scanNetworks();
  if (n == 0) {
    Serial.println("No WiFi networks found!");
    M5.Display.setTextColor(RED);
    M5.Display.println("No SSIDs Found!");
  } else {
    Serial.printf("Found %d networks:\n", n);
    M5.Display.setTextColor(CYAN);
    M5.Display.printf("Found %d Networks:\n", n);

    bool targetFound = false;
    for (int i = 0; i < n && i < 6; ++i) {
      String ssidFound = WiFi.SSID(i);
      int32_t rssi = WiFi.RSSI(i);
      Serial.printf(" [%d] %s (%d dBm)\n", i + 1, ssidFound.c_str(), rssi);

      if (ssidFound == ssid) {
        targetFound = true;
        M5.Display.setTextColor(GREEN);
      } else {
        M5.Display.setTextColor(WHITE);
      }
      M5.Display.printf("%d.%s(%ddBm)\n", i + 1, ssidFound.substring(0, 12).c_str(), rssi);
    }

    if (!targetFound) {
      Serial.printf("Target SSID '%s' WAS NOT FOUND in scan!\n", ssid);
      M5.Display.setTextColor(RED);
      M5.Display.printf("Target '%s'\nNOT FOUND!\n", ssid);
    } else {
      Serial.printf("Target SSID '%s' IS VISIBLE! Check password.\n", ssid);
      M5.Display.setTextColor(YELLOW);
      M5.Display.println("Target Seen! Check Pass");
    }
  }
  delay(4000);
}

void setup() {
  Serial.begin(115200);
  delay(500);

  auto cfg = M5.config();
  M5.begin(cfg);
  M5.Display.setRotation(1);
  M5.Display.setTextSize(2);

  M5.Display.fillScreen(BLACK);
  M5.Display.setCursor(0, 0);
  M5.Display.setTextColor(WHITE);
  M5.Display.printf("SSID: %s\nConnecting WiFi", ssid);

  // 1. Boost ESP32 Wi-Fi Transmit Power to Maximum (19.5 dBm)
  WiFi.mode(WIFI_STA);
  WiFi.setTxPower(WIFI_POWER_19_5dBm);
  WiFi.setAutoReconnect(true);
  WiFi.disconnect();
  delay(200);

  // 2. Begin Connection Attempt
  WiFi.begin(ssid, password);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    M5.Display.print(".");
    attempts++;
  }

  M5.Display.fillScreen(BLACK);
  M5.Display.setCursor(0, 0);
  if (WiFi.status() == WL_CONNECTED) {
    M5.Display.setTextColor(GREEN);
    M5.Display.println("WiFi Connected!");
    M5.Display.setTextSize(1);
    M5.Display.printf("IP: %s\nSignal: %d dBm\n", WiFi.localIP().toString().c_str(), WiFi.RSSI());
    Serial.println("WiFi Connected! IP: " + WiFi.localIP().toString() + " RSSI: " + String(WiFi.RSSI()));
  } else {
    M5.Display.setTextColor(RED);
    M5.Display.println("WiFi Failed!");
    M5.Display.setTextSize(1);
    M5.Display.printf("SSID: %s\nCheck Pass/Range\n", ssid);
    Serial.println("WiFi Connection Failed for SSID: " + String(ssid));

    // Run Wi-Fi Scanner Diagnostic to inspect visible networks
    scanWiFiNetworks();
  }
  delay(2000);

  // Synchronize time via NTP for Azure SAS token signature validation
  if (WiFi.status() == WL_CONNECTED) {
    syncTime();
  }

  // Scan I2C bus and initialize pressure sensor with screen diagnostics
  scanAndInitSensors();

  M5.Display.fillScreen(BLACK);
  M5.Display.setCursor(0, 0);
  M5.Display.setTextColor(GREEN);
  M5.Display.setTextSize(2);
  M5.Display.println("System Ready!");
  delay(1000);
}

void loop() {
  M5.update();

  readENVSensors();
  updateDisplay();

  // Send telemetry on Button A press
  if (M5.BtnA.wasPressed()) {
    if (ensureWiFiConnected()) {
      sendTelemetry();
    }
  }

  // Auto send telemetry at specified interval
  if (telemetryInterval > 0 && millis() - lastTelemetryTime >= telemetryInterval) {
    lastTelemetryTime = millis();
    if (ensureWiFiConnected()) {
      sendTelemetry();
    }
  }

  delay(200);
}
