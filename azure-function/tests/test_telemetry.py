"""
Unit Tests for Telemetry Parser and Model Validation.
Run using pytest: pytest tests/
"""

import os
import sys
import unittest

# Add parent directory to sys.path for local module resolution
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from shared.telemetry_parser import parse_telemetry, TelemetryModel, format_iso_timestamp


class TestTelemetryParser(unittest.TestCase):

    def test_parse_wrapped_event_telemetry(self):
        """Tests parsing wrapped IoT Hub telemetry message event format."""
        raw_event = {
            "event": {
                "origin": "m5stick-01",
                "module": "",
                "interface": "",
                "component": "",
                "payload": {
                    "deviceId": "m5stick-01",
                    "temperature": 23.66,
                    "humidity": 63.72,
                    "pressure": 0.0,
                    "timestamp": 1785912932
                }
            }
        }

        success, model, error_msg = parse_telemetry(raw_event)

        self.assertTrue(success)
        self.assertIsNotNone(model)
        self.assertIsNone(error_msg)
        self.assertEqual(model.deviceId, "m5stick-01")
        self.assertEqual(model.temperature, 23.66)
        self.assertEqual(model.humidity, 63.72)
        self.assertEqual(model.pressure, 0.0)
        self.assertEqual(model.status, "Online")

    def test_parse_direct_telemetry_json(self):
        """Tests parsing direct JSON string telemetry payload."""
        json_str = '{"deviceId":"m5stick-01","temperature":25.4,"humidity":58.1,"pressure":1012.5,"timestamp":1785912932}'

        success, model, error_msg = parse_telemetry(json_str)

        self.assertTrue(success)
        self.assertIsNotNone(model)
        self.assertEqual(model.deviceId, "m5stick-01")
        self.assertEqual(model.temperature, 25.4)
        self.assertEqual(model.humidity, 58.1)
        self.assertEqual(model.pressure, 1012.5)

    def test_to_patch_payload(self):
        """Tests generation of RFC 6902 JSON Patch payload for Azure Digital Twins."""
        model = TelemetryModel(
            deviceId="m5stick-01",
            temperature=23.66,
            humidity=63.72,
            pressure=0.0,
            status="Online",
            timestamp="2026-08-05T10:30:00Z"
        )

        patch = model.to_patch_payload()

        self.assertIsInstance(patch, list)
        self.assertEqual(len(patch), 5)
        self.assertEqual(patch[0], {"op": "add", "path": "/temperature", "value": 23.66})
        self.assertEqual(patch[1], {"op": "add", "path": "/humidity", "value": 63.72})
        self.assertEqual(patch[2], {"op": "add", "path": "/pressure", "value": 0.0})
        self.assertEqual(patch[3], {"op": "add", "path": "/status", "value": "Online"})
        self.assertEqual(patch[4], {"op": "add", "path": "/lastUpdated", "value": "2026-08-05T10:30:00Z"})

    def test_to_signalr_payload(self):
        """Tests SignalR broadcast payload formatting."""
        model = TelemetryModel(
            deviceId="m5stick-01",
            temperature=23.66,
            humidity=63.72,
            pressure=1013.25,
            status="Online",
            timestamp="2026-08-05T10:30:00Z"
        )

        signalr_dict = model.to_signalr_payload()

        self.assertEqual(signalr_dict["deviceId"], "m5stick-01")
        self.assertEqual(signalr_dict["temperature"], 23.66)
        self.assertEqual(signalr_dict["humidity"], 63.72)
        self.assertEqual(signalr_dict["pressure"], 1013.25)
        self.assertEqual(signalr_dict["status"], "Online")
        self.assertEqual(signalr_dict["timestamp"], "2026-08-05T10:30:00Z")

    def test_invalid_json_handling(self):
        """Tests handling of corrupted JSON input."""
        success, model, error_msg = parse_telemetry("INVALID_JSON_STRING")
        self.assertFalse(success)
        self.assertIsNone(model)
        self.assertIsNotNone(error_msg)


if __name__ == "__main__":
    unittest.main()
