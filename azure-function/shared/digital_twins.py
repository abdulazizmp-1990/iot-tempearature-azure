import os
from typing import Any, Dict, List, Optional
from shared.logger import setup_logger

try:
    from azure.digitaltwins.core import DigitalTwinsClient
    from azure.identity import DefaultAzureCredential
    from azure.core.exceptions import HttpResponseError, ResourceNotFoundError
    HAS_ADT_SDK = True
except ImportError:
    HAS_ADT_SDK = False
    DigitalTwinsClient = None
    DefaultAzureCredential = None

    class HttpResponseError(Exception):
        status_code = 500
        message = "Azure SDK not installed"

    class ResourceNotFoundError(Exception):
        pass

logger = setup_logger("DigitalTwinsManager")


class DigitalTwinsManager:
    """
    Manages authentication and property updates for Azure Digital Twins.
    """

    def __init__(self, adt_url: Optional[str] = None):
        """
        Initializes the Digital Twins client using DefaultAzureCredential.

        Args:
            adt_url: Target Azure Digital Twins instance URL.
                     Defaults to ADT_URL environment variable.
        """
        self.adt_url = adt_url or os.getenv("ADT_URL", "https://adt-ship-twins-instance.api.wcus.digitaltwins.azure.net")
        self.client: Optional[DigitalTwinsClient] = None

        if not self.adt_url:
            logger.error("ADT_URL environment variable is not configured!")
            return

        try:
            # DefaultAzureCredential supports Managed Identity in Azure,
            # and EnvironmentCredential (AZURE_CLIENT_ID, etc.) or Azure CLI locally.
            credential = DefaultAzureCredential()
            self.client = DigitalTwinsClient(self.adt_url, credential)
            logger.info(f"Initialized Azure Digital Twins client connected to '{self.adt_url}'")
        except Exception as err:
            logger.error(f"Failed to initialize DigitalTwinsClient: {str(err)}")
            self.client = None

    def update_twin(self, twin_id: str, patch_operations: List[Dict[str, Any]]) -> bool:
        """
        Applies a list of JSON Patch operations to a digital twin instance.

        Args:
            twin_id: Target digital twin identifier (e.g. 'm5stick-01').
            patch_operations: RFC 6902 compliant list of JSON patch operations.

        Returns:
            True if twin update succeeded, False otherwise.
        """
        if not self.client:
            logger.warning(
                f"DigitalTwinsClient is not initialized. Skipping twin update for '{twin_id}'."
            )
            return False

        try:
            logger.info(f"Updating Azure Digital Twin '{twin_id}' with patch: {patch_operations}")
            self.client.update_digital_twin(twin_id, patch_operations)
            logger.info(f"Successfully updated Azure Digital Twin '{twin_id}'")
            return True

        except ResourceNotFoundError:
            logger.error(
                f"Digital Twin with ID '{twin_id}' was not found in instance '{self.adt_url}'."
            )
            return False

        except HttpResponseError as http_err:
            logger.error(
                f"HTTP Error updating Digital Twin '{twin_id}': Status={http_err.status_code}, Message={http_err.message}"
            )
            return False

        except Exception as err:
            logger.error(f"Unexpected error updating Digital Twin '{twin_id}': {str(err)}")
            return False
