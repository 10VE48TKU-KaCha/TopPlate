from typing import List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.database import db
from app.security.dependencies import get_current_tenant_context, TenantContext, require_roles

router = APIRouter(prefix="/reports", tags=["Financial Reports & Profitability"])

class FinancialsSummaryResponse(BaseModel):
    totalRevenue: float
    totalCost: float
    grossProfit: float
    grossProfitMarginPercent: float
    completedOrdersCount: float

class MenuProfitabilityItem(BaseModel):
    menuItemId: str
    menuItemName: str
    categoryName: Optional[str] = None
    price: float
    recipeCost: float
    profitPerUnit: float
    profitMarginPercent: float
    totalQuantitySold: int
    totalRevenue: float
    totalProfit: float

@router.get("/financials", response_model=FinancialsSummaryResponse)
async def get_financials_summary(
    tenant: TenantContext = Depends(get_current_tenant_context),
    _: None = Depends(require_roles(["SUPER_ADMIN", "STORE_ADMIN"]))
):
    orders = await db.order.find_many(
        where={
            "storeId": tenant.store_id,
            "status": {"not": "CANCELLED"}
        }
    )
    
    total_revenue = sum(o.totalAmount for o in orders)
    total_cost = sum(getattr(o, 'totalCost', 0.0) or 0.0 for o in orders)
    gross_profit = total_revenue - total_cost
    completed_count = len([o for o in orders if o.status == "COMPLETED"])
    
    margin_percent = 0.0
    if total_revenue > 0:
        margin_percent = (gross_profit / total_revenue) * 100.0

    return FinancialsSummaryResponse(
        totalRevenue=round(total_revenue, 2),
        totalCost=round(total_cost, 2),
        grossProfit=round(gross_profit, 2),
        grossProfitMarginPercent=round(margin_percent, 1),
        completedOrdersCount=completed_count
    )

@router.get("/menu-profitability", response_model=List[MenuProfitabilityItem])
async def get_menu_profitability(
    tenant: TenantContext = Depends(get_current_tenant_context),
    _: None = Depends(require_roles(["SUPER_ADMIN", "STORE_ADMIN"]))
):
    menu_items = await db.menuitem.find_many(
        where={"storeId": tenant.store_id},
        include={
            "category": True,
            "recipes": {"include": {"inventoryItem": True}},
            "orderItems": {
                "include": {"order": True}
            }
        }
    )

    report_items = []
    for item in menu_items:
        recipe_cost = 0.0
        if item.recipes:
            for r in item.recipes:
                if r.inventoryItem:
                    unit_cost = getattr(r.inventoryItem, 'unitCost', 0.0) or 0.0
                    recipe_cost += r.quantityRequired * unit_cost

        profit_per_unit = max(0.0, item.price - recipe_cost)
        margin_pct = (profit_per_unit / item.price * 100.0) if item.price > 0 else 0.0

        # Filter order items from valid orders
        valid_order_items = [
            oi for oi in item.orderItems
            if oi.order and oi.order.status != "CANCELLED"
        ]

        total_qty_sold = sum(oi.quantity for oi in valid_order_items)
        total_item_revenue = sum(oi.subtotal for oi in valid_order_items)
        total_item_profit = profit_per_unit * total_qty_sold

        report_items.append(
            MenuProfitabilityItem(
                menuItemId=item.id,
                menuItemName=item.name,
                categoryName=item.category.name if item.category else None,
                price=item.price,
                recipeCost=round(recipe_cost, 2),
                profitPerUnit=round(profit_per_unit, 2),
                profitMarginPercent=round(margin_pct, 1),
                totalQuantitySold=total_qty_sold,
                totalRevenue=round(total_item_revenue, 2),
                totalProfit=round(total_item_profit, 2)
            )
        )

    # Sort by total profit descending
    report_items.sort(key=lambda x: x.totalProfit, reverse=True)
    return report_items
