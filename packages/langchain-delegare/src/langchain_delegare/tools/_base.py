from typing import Any

from delegare import AsyncDelegare, Delegare
from langchain_core.tools import BaseTool

class DelegareToolBase(BaseTool):
    """Base class for Delegare tools."""
    
    # We use a private attribute to bypass Pydantic validation entirely
    _state: dict[str, Any] = {}
    
    def set_clients(self, sync_client: Any, async_client: Any) -> None:
        self._state["sync_client"] = sync_client
        self._state["async_client"] = async_client
        
    @property
    def sync_client(self) -> Any:
        return self._state.get("sync_client")
        
    @property
    def async_client(self) -> Any:
        return self._state.get("async_client")
