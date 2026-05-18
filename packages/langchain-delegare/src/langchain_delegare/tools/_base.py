from typing import Any
from pydantic import PrivateAttr, BaseModel, ConfigDict
from delegare import AsyncDelegare, Delegare
from langchain_core.tools import BaseTool

class DelegareInputBase(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

class DelegareToolBase(BaseTool):
    """Base class for Delegare tools."""
    
    # We use a private attribute to bypass Pydantic validation entirely
    _state: dict[str, Any] = PrivateAttr(default_factory=dict)
    
    def set_clients(self, sync_client: Any, async_client: Any) -> None:
        self._state["sync_client"] = sync_client
        self._state["async_client"] = async_client
        
    @property
    def sync_client(self) -> Any:
        return self._state.get("sync_client")
        
    @property
    def async_client(self) -> Any:
        return self._state.get("async_client")
