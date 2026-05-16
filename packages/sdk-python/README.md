# delegare

[![PyPI version](https://img.shields.io/pypi/v/delegare.svg)](https://pypi.org/project/delegare/)
[![Python versions](https://img.shields.io/pypi/pyversions/delegare.svg)](https://pypi.org/project/delegare/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/orgtom78/delegare/actions/workflows/python-sdk.yml/badge.svg)](https://github.com/orgtom78/delegare/actions)

Delegare Python SDK for agent payment authorization and settlement.

## Installation

```bash
pip install delegare
```

## Quickstart

```python
import os
from delegare import ApiKeyAuth, Delegare, ChargeRequest

auth = ApiKeyAuth(
    merchant_id=os.environ.get("DELEGARE_MERCHANT_ID"),
    api_key=os.environ.get("DELEGARE_API_KEY")
)

with Delegare(auth) as client:
    charge = client.charge(ChargeRequest(
        amountCents=500,
        intentMandate="mandate_123",
        merchantReference="ref_123",
        taskType="financial_data_extraction"
    ))
    print(charge.status)
```

For more documentation, visit [docs.delegare.dev](https://docs.delegare.dev).
