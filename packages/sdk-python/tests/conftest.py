import pytest

@pytest.fixture
def mock_api_key():
    return "test_api_key"

@pytest.fixture
def mock_merchant_id():
    return "test_merchant_id"
