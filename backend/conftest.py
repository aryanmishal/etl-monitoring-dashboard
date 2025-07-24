import pytest

# Example fixture for database connection (customize as needed)
@pytest.fixture(scope='session')
def db_config():
    # Return test database config or connection
    return {
        'host': 'localhost',
        'user': 'test_user',
        'password': 'test_password',
        'database': 'etl_monitoring_test'
    } 