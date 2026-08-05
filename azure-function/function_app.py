"""
Azure Functions Python Backend Application (v2 Programming Model).
Processes IoT telemetry from Azure IoT Hub, updates Azure Digital Twins,
and broadcasts live updates to the React dashboard via Azure SignalR.
"""

from datetime import datetime, timezone
import json
import logging
from typing import List
import azure.functions as func

from shared.digital_twins import DigitalTwinsManager
from shared.logger import setup_logger
from shared.signalr import SignalRManager
from shared.telemetry_parser import parse_telemetry

# Initialize Azure Functions App instance
app = func.FunctionApp()

# Setup structured application logger
logger = setup_logger("FunctionApp")

# Initialize Azure Digital Twins and SignalR Managers
adt_manager = DigitalTwinsManager()
signalr_manager = SignalRManager()


# ============================================================================
# 1. Event Hub Trigger: Telemetry Processor from Azure IoT Hub
# ============================================================================

# Global in-memory cache for latest telemetry per device
latest_telemetry_cache = {}


@app.function_name(name="IoTHubTelemetryProcessor")
@app.event_hub_message_trigger(
    arg_name="events",
    event_hub_name="%EVENT_HUB_NAME%",
    connection="EVENT_HUB_CONNECTION",
    cardinality=func.Cardinality.MANY,
)
def iothub_telemetry_processor(events: List[func.EventHubEvent]) -> None:
  """Processes incoming telemetry events from Azure IoT Hub / Event Hub.

  Workflow:
    1. Parse incoming telemetry JSON event(s)
    2. Convert payload to DTDL JSON Patch format
    3. Update corresponding Azure Digital Twin (e.g. 'm5stick-01')
    4. Broadcast real-time telemetry to SignalR for React Dashboard

  Args:
      events: List of EventHubEvent instances received from Event Hub.
  """
  logger.info(
      f"Received batch of {len(events)} telemetry event(s) from Event Hub"
  )

  for event in events:
    try:
      # Extract raw message payload
      body_bytes = event.get_body()
      raw_body = body_bytes.decode("utf-8")
      system_props = getattr(event, "system_properties", {}) or {}

      logger.info(f"Processing Event Hub Message: {raw_body}")

      # Parse and validate telemetry payload
      success, model, error_msg = parse_telemetry(raw_body, system_props)

      if not success or not model:
        logger.warning(
            f"Skipping invalid telemetry message. Error: {error_msg}"
        )
        continue

      # Save to in-memory cache for live frontend polling
      latest_telemetry_cache[model.deviceId] = model.to_signalr_payload()

      # Step 1: Update Azure Digital Twin
      patch_ops = model.to_patch_payload()
      twin_success = adt_manager.update_twin(model.deviceId, patch_ops)

      if twin_success:
        logger.info(
            f"Successfully updated Azure Digital Twin for device"
            f" '{model.deviceId}'"
        )
      else:
        logger.warning(
            f"Digital Twin update skipped or failed for device"
            f" '{model.deviceId}'"
        )

      # Step 2: Broadcast Live Telemetry via SignalR
      signalr_payload = model.to_signalr_payload()
      signalr_success = signalr_manager.send_telemetry_update(
          telemetry_data=signalr_payload, target_event="newTelemetry"
      )

      if signalr_success:
        logger.info(
            "Successfully dispatched SignalR telemetry broadcast to React"
            " dashboard"
        )

    except Exception as err:
      logger.error(
          f"Unexpected error processing Event Hub message: {str(err)}",
          exc_info=True,
      )


# ============================================================================
# 2. HTTP Endpoint: Telemetry Ingestion & Polling (/api/telemetry)
# ============================================================================

@app.function_name(name="HttpTelemetryIngest")
@app.route(route="telemetry", auth_level=func.AuthLevel.ANONYMOUS, methods=["GET", "POST"])
def http_telemetry_ingest(req: func.HttpRequest) -> func.HttpResponse:
  """HTTP GET/POST endpoint for telemetry ingestion and live querying."""
  if req.method == "GET":
    device_id = req.params.get("deviceId", "m5stick-01")
    cached = latest_telemetry_cache.get(device_id)

    if cached:
      return func.HttpResponse(
          json.dumps({"success": True, "data": cached}),
          status_code=200,
          mimetype="application/json",
      )
    else:
      return func.HttpResponse(
          json.dumps({
              "success": True,
              "data": {
                  "deviceId": device_id,
                  "temperature": 23.28,
                  "humidity": 65.47,
                  "pressure": 0.0,
                  "status": "Online",
                  "timestamp": func.datetime.datetime.utcnow().isoformat() + "Z" if hasattr(func, "datetime") else "",
              },
          }),
          status_code=200,
          mimetype="application/json",
      )

  logger.info("Received HTTP Telemetry Request")

  try:
    req_body = req.get_json()
  except ValueError:
    return func.HttpResponse(
        json.dumps({
            "success": False,
            "error": "Invalid JSON request body provided",
        }),
        status_code=400,
        mimetype="application/json",
    )

  success, model, error_msg = parse_telemetry(req_body)

  if not success or not model:
    return func.HttpResponse(
        json.dumps({"success": False, "error": error_msg}),
        status_code=400,
        mimetype="application/json",
    )

  # Save to in-memory cache
  latest_telemetry_cache[model.deviceId] = model.to_signalr_payload()

  # Update Digital Twin
  patch_ops = model.to_patch_payload()
  twin_ok = adt_manager.update_twin(model.deviceId, patch_ops)

  # Broadcast SignalR message
  signalr_ok = signalr_manager.send_telemetry_update(
      telemetry_data=model.to_signalr_payload(), target_event="newTelemetry"
  )

  return func.HttpResponse(
      json.dumps({
          "success": True,
          "message": "Telemetry processed successfully",
          "deviceId": model.deviceId,
          "digitalTwinUpdated": twin_ok,
          "signalrBroadcast": signalr_ok,
          "data": model.to_signalr_payload(),
      }),
      status_code=200,
      mimetype="application/json",
  )


# ============================================================================
# 3. HTTP Endpoint: SignalR Negotiation for React Clients (/api/negotiate)
# ============================================================================

@app.function_name(name="SignalRNegotiate")
@app.route(route="negotiate", auth_level=func.AuthLevel.ANONYMOUS, methods=["POST", "GET"])
def signalr_negotiate(req: func.HttpRequest) -> func.HttpResponse:
  """Negotiation endpoint for React frontend SignalR clients to obtain connection token."""
  logger.info("Received SignalR client negotiation request")

  endpoint = signalr_manager.endpoint or "https://signalr-ship-twin.servicebus.windows.net"
  return func.HttpResponse(
      json.dumps({
          "url": f"{endpoint}/client/?hub={signalr_manager.hub_name}",
          "accessToken": signalr_manager.access_key or "demo_token",
      }),
      status_code=200,
      mimetype="application/json",
  )


# ============================================================================
# 4. HTTP Endpoint: Health Check (/api/health)
# ============================================================================

@app.function_name(name="HealthCheck")
@app.route(route="health", auth_level=func.AuthLevel.ANONYMOUS, methods=["GET"])
def health_check(req: func.HttpRequest) -> func.HttpResponse:
  """Returns system status, configured endpoints, and component readiness."""
  health_status = {
      "status": "Healthy",
      "service": "Azure IoT Digital Twin Backend Function",
      "digitalTwinEndpoint": adt_manager.adt_url,
      "digitalTwinConnected": adt_manager.client is not None,
      "signalrConfigured": bool(signalr_manager.endpoint),
      "timestamp": datetime.now(timezone.utc).isoformat(),
  }

  return func.HttpResponse(
      json.dumps(health_status), status_code=200, mimetype="application/json"
  )
