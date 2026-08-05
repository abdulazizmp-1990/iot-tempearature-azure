#include <M5Unified.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include "mbedtls/md.h"
#include "mbedtls/base64.h"
#include <time.h>


// ---- WiFi ----
const char* ssid     = "cubet_out";
const char* password = "Y3cfe171C#";

// ---- Azure IoT Hub ----
const char* iotHubHost = "iot-ship-twin.azure-devices.net";
const char* deviceId   = "m5stick-01";
const char* deviceKey  = "KnOguLeqFZYt5J5pxA7rOgEGR2npHNYVJ6nIgtYq2kE=";

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

  Serial.print("Current Epoch = ");
  Serial.println(now);

  if (now < 1700000000) {
    Serial.println("ERROR: Clock not synchronized!");
    return "";
  }

  unsigned long expiry = now + 3600;

  Serial.print("Expiry = ");
  Serial.println(expiry);

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
  mbedtls_md_setup(&ctx,
                   mbedtls_md_info_from_type(MBEDTLS_MD_SHA256),
                   1);

  mbedtls_md_hmac_starts(&ctx, decodedKey, decodedKeyLen);
  mbedtls_md_hmac_update(
      &ctx,
      (const unsigned char*)stringToSign.c_str(),
      stringToSign.length());

  mbedtls_md_hmac_finish(&ctx, hmacResult);

  mbedtls_md_free(&ctx);

  unsigned char base64Sig[128];
  size_t base64SigLen;

  mbedtls_base64_encode(
      base64Sig,
      sizeof(base64Sig),
      &base64SigLen,
      hmacResult,
      32);

  String signature((char*)base64Sig, base64SigLen);

  String token =
      "SharedAccessSignature sr=" +
      encodedUri +
      "&sig=" +
      urlEncode(signature) +
      "&se=" +
      String(expiry);

  return token;
}

void syncTime() {

  Serial.println("Starting NTP...");

  configTime(
      0,
      0,
      "pool.ntp.org",
      "time.google.com",
      "time.windows.com");

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

    Serial.println("NTP FAILED");

  } else {

    Serial.print("NTP OK ");

    Serial.println(ctime(&now));

    Serial.print("Epoch = ");

    Serial.println(now);
  }
}

bool syncTimeViaHTTP() {
  M5.Display.println("Syncing time HTTP...");
  Serial.println("Syncing time via HTTP...");

  HTTPClient http;
  http.begin("http://worldtimeapi.org/api/timezone/Etc/UTC");
  http.setTimeout(5000);
  int httpCode = http.GET();

  if (httpCode == 200) {
    String payload = http.getString();
    int idx = payload.indexOf("\"unixtime\":");
    if (idx != -1) {
      String epochStr = payload.substring(idx + 11, payload.indexOf(",", idx));
      time_t epoch = (time_t)epochStr.toInt();
      
      struct timeval tv = { .tv_sec = epoch, .tv_usec = 0 };
      settimeofday(&tv, NULL);
      
      http.end();
      
      M5.Display.fillScreen(BLACK);
      M5.Display.setCursor(0, 0);
      M5.Display.println("Time synced!");
      Serial.println("Time synced! Epoch: " + String(time(nullptr)));
      return true;
    }
  }
  
  http.end();
  M5.Display.fillScreen(BLACK);
  M5.Display.setCursor(0, 0);
  M5.Display.println("Time sync FAILED");
  Serial.println("HTTP Time sync failed. Code: " + String(httpCode));
  return false;
}

void setup() {
  Serial.begin(115200);
  delay(500);

  auto cfg = M5.config();
  M5.begin(cfg);
  M5.Display.setTextSize(2);

  M5.Display.fillScreen(BLACK);
  M5.Display.setCursor(0, 0);
  M5.Display.println("Connecting WiFi...");
  WiFi.begin(ssid, password);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    M5.Display.print(".");
    attempts++;
  }

  M5.Display.fillScreen(BLACK);
  M5.Display.setCursor(0, 0);
  if (WiFi.status() == WL_CONNECTED) {
    M5.Display.println("WiFi OK!");
  } else {
    M5.Display.println("WiFi FAILED");
    return;
  }
  delay(1000);

  M5.Display.fillScreen(BLACK);
  M5.Display.setCursor(0, 0);
  syncTime();
  // syncTimeViaHTTP();
  delay(1000);

  M5.Display.fillScreen(BLACK);
  M5.Display.setCursor(0, 0);
  M5.Display.println("Press button to send");
}

void loop() {
  M5.update();
  if (M5.BtnA.wasPressed()) {
    sendTelemetry();
  }
}

void sendTelemetry() {
  String sasToken = generateSasToken();
  

  String payload = "{"
    "\"contactId\":\"TRK-0000\","
    "\"threatType\":\"Unknown Aircraft\","
    "\"threatLevel\":\"RED\","
    "\"distanceNm\":2,"
    "\"bearingDeg\":0,"
    "\"speedKnots\":0,"
    "\"status\":\"TRACKING\""
  "}";

  String path = "/devices/" + String(deviceId) + "/messages/events?api-version=2020-09-30";
 Serial.println("Current time:");
Serial.println(time(nullptr));
  Serial.println("=== Sending telemetry ===");
  Serial.printf("Heap: %d\n", ESP.getFreeHeap());
  Serial.println("SAS Token: " + sasToken);

  M5.Display.fillScreen(BLACK);
  M5.Display.setCursor(0, 0);
  M5.Display.println("Sending...");

  WiFiClientSecure client;
  client.setInsecure();
  client.setTimeout(15000);

  Serial.println("Connecting...");
  if (!client.connect(iotHubHost, 443)) {
    Serial.println("Connect failed!");
    M5.Display.println("Connect failed");
    return;
  }
  
  Serial.println("Connected!");

  String request = "POST " + path + " HTTP/1.1\r\n";
  request += "Host: " + String(iotHubHost) + "\r\n";
  request += "Authorization: " + sasToken + "\r\n";
  request += "Content-Type: application/json\r\n";
  request += "Content-Length: " + String(payload.length()) + "\r\n";
  request += "Connection: close\r\n\r\n";
  request += payload;

  Serial.println("--- Request ---");
  Serial.println(request);
  Serial.println("---------------");

  client.print(request);

  Serial.println("Waiting for response...");
  unsigned long timeout = millis();
  bool gotAnything = false;
  while (client.connected() && millis() - timeout < 10000) {
    if (client.available()) {
      String line = client.readStringUntil('\n');
      Serial.println("RESP: " + line);
      gotAnything = true;
      timeout = millis();
    }
  }

  if (!gotAnything) {
    Serial.println("No response received at all (timed out)");
  }

  Serial.println("=== Done ===");
  client.stop();

  M5.Display.fillScreen(BLACK);
  M5.Display.setCursor(0, 0);
  M5.Display.println("Check Serial Monitor");
}