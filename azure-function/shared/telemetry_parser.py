"""
Telemetry Parser Module.
Parses, validates, and normalizes raw JSON IoT Hub telemetry messages into typed data structures.
"""

import json
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

try:
    from pydantic import BaseModel, Field
    HAS_PYDANTIC = True
except ImportError:
    HAS_PYDANTIC = False

    class BaseModel:
        pass

    def Field(default=None, default_factory=None, description=""):
        if default_factory:
            return field(default_factory=default_factory)
        return field(default=default)

from shared.logger import setup_logger

logger = setup_logger("TelemetryParser")


@dataclass
class TelemetryModel:
    """
    Validated Telemetry Data Model matching DTDL Interface (dtmi:ship:Sensor;1).
    """

    deviceId: str = "m5stick-01"
    temperature: float = 0.0
    humidity: float = 0.0
    pressure: float = 0.0
    status: str = "Online"
    timestamp: str = ""

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    def to_patch_payload(self) -> list[Dict[str, Any]]:
        """
        Generates a JSON Patch array for updating Azure Digital Twins properties.

        Returns:
            List of JSON Patch operation dictionaries compliant with RFC 6902.
        """
        return [
            {"op": "add", "path": "/temperature", "value": round(self.temperature, 2)},
            {"op": "add", "path": "/humidity", "value": round(self.humidity, 2)},
            {"op": "add", "path": "/pressure", "value": round(self.pressure, 2)},
            {"op": "add", "path": "/status", "value": self.status},
            {"op": "add", "path": "/lastUpdated", "value": self.timestamp},
        ]

    def to_signalr_payload(self) -> Dict[str, Any]:
        """
        Formats telemetry payload for SignalR broadcast to React dashboard.

        Returns:
            Dictionary payload for SignalR messaging.
        """
        return {
            "deviceId": self.deviceId,
            "temperature": round(self.temperature, 2),
            "humidity": round(self.humidity, 2),
            "pressure": round(self.pressure, 2),
            "status": self.status,
            "timestamp": self.timestamp,
        }


def format_iso_timestamp(ts: Optional[Any]) -> str:
  """Converts Unix epoch timestamp or raw string to ISO 8601 UTC timestamp string."""
  if ts is None:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

  try:
    if isinstance(ts, (int, float)):
      # Handle Unix timestamp integer or float
      dt = datetime.fromtimestamp(ts, tz=timezone.utc)
      return dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    elif isinstance(ts, str):
      if ts.isdigit():
        dt = datetime.fromtimestamp(float(ts), tz=timezone.utc)
        return dt.strftime("%Y-%m-%dT%H:%M:%SZ")
      # Assume string is already formatted or ISO 8601
      return ts
  except Exception as err:
    logger.warning(
        f"Failed to parse timestamp '{ts}', falling back to current time: {err}"
    )

  return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def parse_telemetry(
    raw_data: Any, system_properties: Optional[Dict[str, Any]] = None
) -> Tuple[bool, Optional[TelemetryModel], Optional[str]]:
  """Parses raw IoT message string/dict into a validated TelemetryModel instance.

  Handles both wrapped event telemetry:
  {
    "event": {
      "origin": "m5stick-01",
      "payload": { "deviceId": "m5stick-01", "temperature": 23.66, ... }
    }
  }
  and direct JSON payloads:
  {
    "deviceId": "m5stick-01",
    "temperature": 23.66,
    "humidity": 63.72,
    "pressure": 0.0,
    "timestamp": 1785912932
  }

  Args:
      raw_data: Raw JSON string or dictionary received from Event Hub / IoT
        Hub.
      system_properties: Optional Event Hub / IoT Hub system properties
        dictionary.

  Returns:
      Tuple of (success: bool, model: Optional[TelemetryModel], error_msg:
      Optional[str])
  """
  try:
    if isinstance(raw_data, (bytes, bytearray)):
      raw_data = raw_data.decode("utf-8")

    if isinstance(raw_data, str):
      payload_dict = json.loads(raw_data)
    elif isinstance(raw_data, dict):
      payload_dict = raw_data
    else:
      return (
          False,
          None,
          f"Unsupported raw data type: {type(raw_data).__name__}",
      )

    # Unwrap event container if present
    if "event" in payload_dict and isinstance(payload_dict["event"], dict):
      event_data = payload_dict["event"]
      origin_device = event_data.get("origin")
      inner_payload = event_data.get("payload", {})

      if isinstance(inner_payload, dict):
        telemetry_dict = inner_payload
      else:
        telemetry_dict = {}

      if "deviceId" not in telemetry_dict and origin_device:
        telemetry_dict["deviceId"] = origin_device
    else:
      telemetry_dict = payload_dict

    # Determine device ID fallback
    device_id = telemetry_dict.get("deviceId")
    if not device_id and system_properties:
      device_id = system_properties.get("iothub-connection-device-id")
    if not device_id:
      device_id = "m5stick-01"

    # Parse numeric fields safely
    temp = float(telemetry_dict.get("temperature", 0.0))
    humi = float(telemetry_dict.get("humidity", 0.0))
    pres = float(telemetry_dict.get("pressure", 0.0))
    status_str = str(telemetry_dict.get("status", "Online"))
    iso_time = format_iso_timestamp(telemetry_dict.get("timestamp"))

    model = TelemetryModel(
        deviceId=device_id,
        temperature=temp,
        humidity=humi,
        pressure=pres,
        status=status_str,
        timestamp=iso_time,
    )

    logger.info(
        f"Parsed telemetry successfully for device '{model.deviceId}': Temp={model.temperature}°C, Humi={model.humidity}%, Pres={model.pressure}hPa"
    )
    return True, model, None

  except json.JSONDecodeError as e:
    err_msg = f"Invalid JSON telemetry payload: {str(e)}"
    logger.error(err_msg)
    return False, None, err_msg
  except Exception as e:
    err_msg = f"Unexpected error during telemetry parsing: {str(e)}"
    logger.error(err_msg)
    return False, None, err_msg
