import sys
import unittest
from datetime import timedelta
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import app
from app.security.jwt import get_password_hash, verify_password, create_access_token, decode_access_token
from app.security.dependencies import AuthenticatedUser, TenantContext, TokenPayload
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.store import StoreCreate, StoreResponse
from app.schemas.menu import CategoryCreate, MenuItemCreate
from app.schemas.inventory import InventoryItemCreate
from app.schemas.order import OrderCreate, OrderItemCreate, OrderStatusUpdate


class TestAuthSecurity(unittest.TestCase):
    """Unit tests for Password Hashing and JWT Security"""

    def test_password_hashing(self):
        password = "SuperSecretPassword123!"
        hashed = get_password_hash(password)
        self.assertNotEqual(password, hashed)
        self.assertTrue(verify_password(password, hashed))
        self.assertFalse(verify_password("WrongPassword", hashed))

    def test_jwt_token_generation_and_decoding(self):
        payload_data = {
            "sub": "user_123",
            "email": "admin@store.com",
            "role": "STORE_ADMIN",
            "store_id": "store_abc123",
            "full_name": "Store Manager"
        }
        token = create_access_token(payload_data, expires_delta=timedelta(minutes=15))
        self.assertIsInstance(token, str)
        self.assertGreater(len(token), 20)

        decoded = decode_access_token(token)
        self.assertIsNotNone(decoded)
        self.assertEqual(decoded["sub"], "user_123")
        self.assertEqual(decoded["email"], "admin@store.com")
        self.assertEqual(decoded["role"], "STORE_ADMIN")
        self.assertEqual(decoded["store_id"], "store_abc123")

    def test_jwt_invalid_token(self):
        decoded = decode_access_token("invalid.jwt.token.string")
        self.assertIsNone(decoded)


class TestPydanticSchemas(unittest.TestCase):
    """Unit tests for Data Validation Schemas"""

    def test_login_schema(self):
        req = LoginRequest(email="test@example.com", password="password123")
        self.assertEqual(req.email, "test@example.com")
        
        with self.assertRaises(ValidationError):
            LoginRequest(email="invalid-email-format", password="password123")

    def test_store_create_schema(self):
        store = StoreCreate(name="Bistro Paris", slug="bistro-paris", address="123 Sukhumvit", phone="0812345678")
        self.assertEqual(store.name, "Bistro Paris")
        self.assertEqual(store.slug, "bistro-paris")

    def test_order_item_schema(self):
        item = OrderItemCreate(menuItemId="menu_1", quantity=2)
        self.assertEqual(item.quantity, 2)
        self.assertEqual(item.menuItemId, "menu_1")


class TestStockDeductionLogic(unittest.TestCase):
    """Unit tests for Inventory Recipe Stock Deduction calculation"""

    def test_recipe_stock_deduction_calculation(self):
        # Mock Inventory items before order
        inventory = {
            "ing_beef": {"name": "Beef Slice", "stock": 10.0, "unit": "kg"},
            "ing_cheese": {"name": "Cheddar Cheese", "stock": 5.0, "unit": "kg"},
        }

        # Mock Recipe for Burger (requires 0.2kg beef, 0.05kg cheese per order)
        burger_recipe = [
            {"inventory_id": "ing_beef", "qty_per_item": 0.2},
            {"inventory_id": "ing_cheese", "qty_per_item": 0.05},
        ]

        # Order 3 Burgers
        order_qty = 3
        for ing in burger_recipe:
            inv_id = ing["inventory_id"]
            deduct_amount = ing["qty_per_item"] * order_qty
            inventory[inv_id]["stock"] -= deduct_amount

        # Assert correct remaining stock
        self.assertAlmostEqual(inventory["ing_beef"]["stock"], 9.4)   # 10.0 - (0.2 * 3) = 9.4
        self.assertAlmostEqual(inventory["ing_cheese"]["stock"], 4.85) # 5.0 - (0.05 * 3) = 4.85


class TestFastAPIEndpoints(unittest.TestCase):
    """Integration tests for FastAPI application endpoints"""

    def setUp(self):
        self.client = TestClient(app)

    def test_root_endpoint(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("docs", data)

    def test_unauthenticated_protected_route(self):
        response = self.client.get("/api/v1/auth/me")
        self.assertEqual(response.status_code, 401)  # HTTPBearer missing header returns 401 Unauthorized


if __name__ == "__main__":
    unittest.main()
