from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends
from app.database import db
from app.schemas.order import OrderCreate, OrderStatusUpdate, OrderResponse, OrderItemResponse
from app.security.dependencies import get_current_tenant_context, TenantContext, get_current_user, AuthenticatedUser

router = APIRouter(prefix="/orders", tags=["Orders & POS / KDS"])

async def process_order_creation(store_id: str, payload: OrderCreate) -> OrderResponse:
    if not payload.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order must contain at least one item")

    total_amount = 0.0
    total_cost = 0.0
    items_to_create = []

    # Fetch menu items and recipes
    for item_req in payload.items:
        menu_item = await db.menuitem.find_first(
            where={"id": item_req.menuItemId, "storeId": store_id},
            include={
                "recipes": {
                    "include": {"inventoryItem": True}
                }
            }
        )
        if not menu_item or not menu_item.isAvailable:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Menu item {item_req.menuItemId} is not available"
            )
        
        subtotal = menu_item.price * item_req.quantity
        total_amount += subtotal

        # Calculate unit cost and recipe cost per dish
        recipe_cost_per_unit = 0.0
        if menu_item.recipes:
            for recipe in menu_item.recipes:
                needed_qty = recipe.quantityRequired * item_req.quantity
                inv_item = recipe.inventoryItem or await db.inventoryitem.find_unique(where={"id": recipe.inventoryItemId})
                if inv_item:
                    unit_cost = getattr(inv_item, 'unitCost', 0.0) or 0.0
                    recipe_cost_per_unit += recipe.quantityRequired * unit_cost
                    new_stock = max(0.0, inv_item.currentStock - needed_qty)
                    await db.inventoryitem.update(
                        where={"id": inv_item.id},
                        data={"currentStock": new_stock}
                    )

        item_total_recipe_cost = recipe_cost_per_unit * item_req.quantity
        total_cost += item_total_recipe_cost

        items_to_create.append({
            "menu_item": menu_item,
            "quantity": item_req.quantity,
            "unitPrice": menu_item.price,
            "unitCost": menu_item.price - recipe_cost_per_unit, # Margin per unit
            "recipeCost": recipe_cost_per_unit,
            "subtotal": subtotal
        })

    gross_profit = total_amount - total_cost

    # Create Order
    order = await db.order.create(
        data={
            "storeId": store_id,
            "tableId": payload.tableId,
            "status": "PENDING",
            "totalAmount": total_amount,
            "totalCost": total_cost,
            "grossProfit": gross_profit,
            "customerNotes": payload.customerNotes
        }
    )

    # Create OrderItems
    order_item_responses = []
    for item in items_to_create:
        created_oi = await db.orderitem.create(
            data={
                "storeId": store_id,
                "orderId": order.id,
                "menuItemId": item["menu_item"].id,
                "quantity": item["quantity"],
                "unitPrice": item["unitPrice"],
                "unitCost": item["unitCost"],
                "recipeCost": item["recipeCost"],
                "subtotal": item["subtotal"]
            }
        )
        order_item_responses.append(
            OrderItemResponse(
                id=created_oi.id,
                menuItemId=created_oi.menuItemId,
                menuItemName=item["menu_item"].name,
                quantity=created_oi.quantity,
                unitPrice=created_oi.unitPrice,
                unitCost=getattr(created_oi, 'unitCost', 0.0) or 0.0,
                recipeCost=getattr(created_oi, 'recipeCost', 0.0) or 0.0,
                subtotal=created_oi.subtotal
            )
        )

    # Update Table Status to OCCUPIED if table specified
    table_number = None
    if payload.tableId:
        table = await db.table.find_first(where={"id": payload.tableId, "storeId": store_id})
        if table:
            table_number = table.tableNumber
            await db.table.update(where={"id": table.id}, data={"status": "OCCUPIED"})

    return OrderResponse(
        id=order.id,
        storeId=order.storeId,
        tableId=order.tableId,
        tableNumber=table_number,
        status=order.status,
        totalAmount=order.totalAmount,
        totalCost=getattr(order, 'totalCost', 0.0) or 0.0,
        grossProfit=getattr(order, 'grossProfit', 0.0) or 0.0,
        customerNotes=order.customerNotes,
        createdAt=order.createdAt,
        orderItems=order_item_responses
    )

# --- Staff POS Order Placement ---
@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_staff_order(
    payload: OrderCreate,
    tenant: TenantContext = Depends(get_current_tenant_context)
):
    return await process_order_creation(tenant.store_id, payload)

# --- Public Customer QR Code Order Placement ---
@router.post("/customer/{store_id}", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_customer_order(
    store_id: str,
    payload: OrderCreate
):
    store = await db.store.find_unique(where={"id": store_id})
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store not found")
    return await process_order_creation(store_id, payload)

# --- Public Customer Order Tracking ---
@router.get("/customer/status/{order_id}", response_model=OrderResponse)
async def get_customer_order_status(order_id: str):
    order = await db.order.find_unique(
        where={"id": order_id},
        include={"orderItems": {"include": {"menuItem": True}}, "table": True}
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    items = [
        OrderItemResponse(
            id=oi.id,
            menuItemId=oi.menuItemId,
            menuItemName=oi.menuItem.name if oi.menuItem else None,
            quantity=oi.quantity,
            unitPrice=oi.unitPrice,
            unitCost=getattr(oi, 'unitCost', 0.0) or 0.0,
            recipeCost=getattr(oi, 'recipeCost', 0.0) or 0.0,
            subtotal=oi.subtotal
        )
        for oi in order.orderItems
    ]

    return OrderResponse(
        id=order.id,
        storeId=order.storeId,
        tableId=order.tableId,
        tableNumber=order.table.tableNumber if order.table else None,
        status=order.status,
        totalAmount=order.totalAmount,
        totalCost=getattr(order, 'totalCost', 0.0) or 0.0,
        grossProfit=getattr(order, 'grossProfit', 0.0) or 0.0,
        customerNotes=order.customerNotes,
        createdAt=order.createdAt,
        orderItems=items
    )

# --- Staff / KDS List Active Tenant Orders ---
@router.get("", response_model=List[OrderResponse])
async def list_orders(
    status_filter: Optional[str] = None,
    tenant: TenantContext = Depends(get_current_tenant_context)
):
    where_clause = {"storeId": tenant.store_id}
    if status_filter:
        where_clause["status"] = status_filter

    orders = await db.order.find_many(
        where=where_clause,
        include={"orderItems": {"include": {"menuItem": True}}, "table": True},
        order={"createdAt": "desc"}
    )

    results = []
    for o in orders:
        items = [
            OrderItemResponse(
                id=oi.id,
                menuItemId=oi.menuItemId,
                menuItemName=oi.menuItem.name if oi.menuItem else None,
                quantity=oi.quantity,
                unitPrice=oi.unitPrice,
                unitCost=getattr(oi, 'unitCost', 0.0) or 0.0,
                recipeCost=getattr(oi, 'recipeCost', 0.0) or 0.0,
                subtotal=oi.subtotal
            )
            for oi in o.orderItems
        ]
        results.append(
            OrderResponse(
                id=o.id,
                storeId=o.storeId,
                tableId=o.tableId,
                tableNumber=o.table.tableNumber if o.table else None,
                status=o.status,
                totalAmount=o.totalAmount,
                totalCost=getattr(o, 'totalCost', 0.0) or 0.0,
                grossProfit=getattr(o, 'grossProfit', 0.0) or 0.0,
                customerNotes=o.customerNotes,
                createdAt=o.createdAt,
                orderItems=items
            )
        )
    return results

# --- KDS / POS Order Status Update (PENDING -> COOKING -> SERVED -> COMPLETED) ---
@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    payload: OrderStatusUpdate,
    tenant: TenantContext = Depends(get_current_tenant_context)
):
    order = await db.order.find_first(
        where={"id": order_id, "storeId": tenant.store_id},
        include={"orderItems": {"include": {"menuItem": True}}, "table": True}
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found for this tenant")

    updated = await db.order.update(
        where={"id": order_id},
        data={"status": payload.status}
    )

    # Free table if COMPLETED or CANCELLED
    if payload.status in ["COMPLETED", "CANCELLED"] and order.tableId:
        await db.table.update(
            where={"id": order.tableId},
            data={"status": "AVAILABLE"}
        )

    items = [
        OrderItemResponse(
            id=oi.id,
            menuItemId=oi.menuItemId,
            menuItemName=oi.menuItem.name if oi.menuItem else None,
            quantity=oi.quantity,
            unitPrice=oi.unitPrice,
            unitCost=getattr(oi, 'unitCost', 0.0) or 0.0,
            recipeCost=getattr(oi, 'recipeCost', 0.0) or 0.0,
            subtotal=oi.subtotal
        )
        for oi in order.orderItems
    ]

    return OrderResponse(
        id=updated.id,
        storeId=updated.storeId,
        tableId=updated.tableId,
        tableNumber=order.table.tableNumber if order.table else None,
        status=updated.status,
        totalAmount=updated.totalAmount,
        totalCost=getattr(updated, 'totalCost', 0.0) or 0.0,
        grossProfit=getattr(updated, 'grossProfit', 0.0) or 0.0,
        customerNotes=updated.customerNotes,
        createdAt=updated.createdAt,
        orderItems=items
    )
