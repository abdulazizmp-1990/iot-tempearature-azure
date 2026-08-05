"""
SignalR / Live Telemetry Messaging Module.
Sends real-time telemetry updates to React frontend dashboards using Azure SignalR Service / WebPubSub.
"""

import json
import os
from typing import Any, Dict, Optional
import requests
from shared.logger import setup_logger

logger = setup_logger("SignalRManager")


class SignalRManager:
    """
    Manages broadcasting live telemetry events to frontend clients via Azure SignalR Service REST API.
    """

    def __init__(self, connection_string: Optional[str] = None, hub_name: Optional[str] = None):
        """
        Initializes SignalR manager with connection details.

        Args:
            connection_string: SignalR Service connection string.
            hub_name: SignalR Hub name (defaults to 'telemetryHub').
        """
        self.connection_string = connection_string or os.getenv("SIGNALR_CONNECTION_STRING", "")
        self.hub_name = hub_name or os.getenv("SIGNALR_HUB_NAME", "telemetryHub")
        self.endpoint: Optional[str] = None
        self.access_key: Optional[str] = None

        if self.connection_string:
            self._parse_connection_string()

    def _parse_connection_string(self) -> None:
        """Parses Azure SignalR connection string into Endpoint and AccessKey."""
        try:
            parts = dict(item.split("=", 1) for item in self.connection_string.split(";") if "=" in item)
            self.endpoint = parts.get("Endpoint", "").rstrip("/")
            self.access_key = parts.get("AccessKey", "")
            if self.endpoint:
                logger.info(f"SignalR Manager configured for endpoint '{self.endpoint}', hub '{self.hub_name}'")
        except Exception as err:
            logger.warning(f"Could not parse SIGNALR_CONNECTION_STRING: {str(err)}")

    def send_telemetry_update(self, telemetry_data: Dict[str, Any], target_event: str = "newTelemetry") -> bool:
        """
        Broadcasts telemetry update message to connected React frontend dashboards.

        Args:
            telemetry_data: Dictionary containing formatted telemetry values.
            target_event: Event/method name listened by frontend SignalR client (default 'newTelemetry').

        Returns:
            True if message was dispatched, False otherwise.
        """
        if not self.endpoint or not self.access_key:
            logger.warning("SignalR endpoint or key is missing. Logging telemetry broadcast locally:")
            logger.info(f"[SignalR Broadcast simulation -> '{target_event}']: {json.dumps(telemetry_data)}")
            return True

        url = f"{self.endpoint}/api/v1/hubs/{self.hub_name}"

        # SignalR REST API Payload format: {"Target": target_event, "Arguments": [telemetry_data]}
        payload = {
            "Target": target_event,
            "Arguments": [telemetry_data]
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.access_key}"
        }

        try:
            response = requests.post(url, headers=headers, json=payload, timeout=5)
            if response.status_code in (200, 202):
                logger.info(f"Broadcasted SignalR message for device '{telemetry_data.get('deviceId')}' to target '{target_event}'")
                return True
            else:
                logger.warning(f"SignalR API returned status {response.status_code}: {response.text}")
                return False
        except Exception as err:
            logger.error(f"Error sending SignalR message: {str(err)}")
            return False
