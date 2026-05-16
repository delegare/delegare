from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from typing import TypeGuard


@dataclass
class ApiKeyAuth:
    merchant_id: str
    api_key: str
    base_url: str = "https://api.delegare.dev/v1"


@dataclass
class OAuthAuth:
    access_token: str
    base_url: str = "https://api.delegare.dev/v1"
    refresh_token: str | None = None
    on_token_refresh: Callable[[str, str], Any] | None = None


DelegareConfig = ApiKeyAuth | OAuthAuth


def is_oauth_config(config: DelegareConfig) -> TypeGuard[OAuthAuth]:
    return isinstance(config, OAuthAuth)
