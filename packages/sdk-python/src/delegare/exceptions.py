from typing import Any


class DelegareError(Exception):
    """Base exception for all Delegare errors."""

    def __init__(self, message: str, response: Any = None) -> None:
        super().__init__(message)
        self.response = response


class AuthenticationError(DelegareError):
    """Raised when authentication fails (401)."""


class ChargeError(DelegareError):
    """Raised when a charge fails."""


class MandateNotFoundError(DelegareError):
    """Raised when a specified mandate cannot be found (404)."""


class MandateRevokedError(DelegareError):
    """Raised when attempting to use a revoked mandate (409/410)."""


class BudgetExceededError(DelegareError):
    """Raised when a charge would exceed the mandate's budget (402)."""


class X402Error(DelegareError):
    """Raised when interacting with an x402 protected resource fails."""


class SetupTimeoutError(DelegareError):
    """Raised when waiting for setup session completion times out."""
