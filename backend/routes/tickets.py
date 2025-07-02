"""
Transaction and Ticket Purchase API routes
Handles ticket sales, payments, and booking confirmations
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid

from ..models import (
    TheaterLocation, MovieConfiguration
)
from ..database import (
    insert_document, find_document, find_documents,
    update_document, delete_document
)
from ..security import (
    rate_limit_middleware, validate_string_input, validate_email_format
)
from pydantic import BaseModel, Field, validator

router = APIRouter(prefix="/tickets", tags=["tickets"])

# Transaction Models
class TicketPurchaseRequest(BaseModel):
    """Request model for ticket purchase"""
    movie_id: str
    showtime_id: str
    theater_id: str
    seats: List[str] = Field(..., min_items=1, max_items=10)
    user_email: str
    user_name: str
    user_phone: Optional[str] = None
    payment_method: str = "credit_card"  # credit_card, paypal, apple_pay, google_pay
    special_requests: Optional[str] = None
    
    @validator('seats')
    def validate_seats(cls, v):
        if not v or len(v) == 0:
            raise ValueError('At least one seat must be selected')
        if len(v) > 10:
            raise ValueError('Maximum 10 seats per transaction')
        return v
    
    @validator('user_email')
    def validate_email(cls, v):
        return validate_email_format(v)

class TicketPurchaseResponse(BaseModel):
    """Response model for ticket purchase"""
    transaction_id: str
    status: str  # pending, confirmed, failed, cancelled
    total_amount: float
    currency: str = "USD"
    confirmation_code: str
    tickets: List[Dict[str, Any]]
    payment_url: Optional[str] = None  # For redirect to payment processor
    expires_at: datetime
    created_at: datetime

class PaymentStatusUpdate(BaseModel):
    """Webhook payload for payment status updates"""
    transaction_id: str
    status: str  # completed, failed, refunded
    payment_id: str
    amount: float
    currency: str
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None

class TicketValidation(BaseModel):
    """Ticket validation response"""
    ticket_id: str
    is_valid: bool
    movie_title: str
    theater_name: str
    showtime: str
    seat: str
    status: str
    scanned_at: Optional[datetime] = None

@router.post("/purchase", response_model=TicketPurchaseResponse)
async def purchase_tickets(
    purchase_request: TicketPurchaseRequest,
    request: Request
):
    """
    Purchase movie tickets - Main ticket booking endpoint
    
    This endpoint handles the initial ticket purchase request and can be extended
    to integrate with payment processors like Stripe, PayPal, or Fandango.
    """
    await rate_limit_middleware(request)
    
    try:
        # Validate input data
        purchase_request.user_name = validate_string_input(purchase_request.user_name, 100, 1)
        purchase_request.user_email = validate_email_format(purchase_request.user_email)
        
        # Verify movie exists
        movie = await find_document("movies", {"id": purchase_request.movie_id})
        if not movie:
            raise HTTPException(status_code=404, detail="Movie not found")
        
        # Generate transaction ID and confirmation code
        transaction_id = str(uuid.uuid4())
        confirmation_code = f"LB{str(uuid.uuid4())[:8].upper()}"
        
        # Calculate pricing (placeholder logic)
        base_price = 15.00  # Base ticket price
        seat_count = len(purchase_request.seats)
        total_amount = base_price * seat_count
        
        # Add format-specific pricing
        if "IMAX" in purchase_request.showtime_id:
            total_amount += 5.00 * seat_count
        elif "4DX" in purchase_request.showtime_id:
            total_amount += 8.00 * seat_count
        elif "DOLBY" in purchase_request.showtime_id:
            total_amount += 3.00 * seat_count
        
        # Create ticket records
        tickets = []
        for i, seat in enumerate(purchase_request.seats):
            ticket = {
                "id": str(uuid.uuid4()),
                "transaction_id": transaction_id,
                "movie_id": purchase_request.movie_id,
                "movie_title": movie.get("movie_title", "Unknown Movie"),
                "theater_id": purchase_request.theater_id,
                "showtime_id": purchase_request.showtime_id,
                "seat": seat,
                "price": base_price + (5.00 if "IMAX" in purchase_request.showtime_id else 0),
                "status": "pending",
                "created_at": datetime.utcnow()
            }
            tickets.append(ticket)
        
        # Create transaction record
        transaction = {
            "id": transaction_id,
            "movie_id": purchase_request.movie_id,
            "theater_id": purchase_request.theater_id,
            "showtime_id": purchase_request.showtime_id,
            "user_email": purchase_request.user_email,
            "user_name": purchase_request.user_name,
            "user_phone": purchase_request.user_phone,
            "seats": purchase_request.seats,
            "total_amount": total_amount,
            "currency": "USD",
            "payment_method": purchase_request.payment_method,
            "status": "pending",
            "confirmation_code": confirmation_code,
            "tickets": tickets,
            "special_requests": purchase_request.special_requests,
            "expires_at": datetime.utcnow() + timedelta(minutes=15),  # 15-minute hold
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Store transaction
        await insert_document("transactions", transaction)
        
        # Store individual tickets
        for ticket in tickets:
            await insert_document("tickets", ticket)
        
        # Generate payment URL (placeholder for future integration)
        payment_url = None
        if purchase_request.payment_method in ["credit_card", "paypal"]:
            # TODO: Integrate with payment processor
            # payment_url = f"https://payments.litebeem.com/pay/{transaction_id}"
            payment_url = f"/payment/process/{transaction_id}"
        
        return TicketPurchaseResponse(
            transaction_id=transaction_id,
            status="pending",
            total_amount=total_amount,
            currency="USD",
            confirmation_code=confirmation_code,
            tickets=tickets,
            payment_url=payment_url,
            expires_at=transaction["expires_at"],
            created_at=transaction["created_at"]
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transaction failed: {str(e)}")

@router.get("/transaction/{transaction_id}")
async def get_transaction_status(transaction_id: str, request: Request):
    """Get transaction status and details"""
    await rate_limit_middleware(request)
    
    transaction = await find_document("transactions", {"id": transaction_id})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return {
        "transaction_id": transaction_id,
        "status": transaction["status"],
        "total_amount": transaction["total_amount"],
        "confirmation_code": transaction["confirmation_code"],
        "expires_at": transaction["expires_at"],
        "tickets": transaction["tickets"]
    }

@router.post("/webhook/payment-status")
async def payment_status_webhook(
    status_update: PaymentStatusUpdate,
    request: Request
):
    """
    Webhook endpoint for payment processor status updates
    
    This endpoint receives updates from payment processors like:
    - Stripe webhooks
    - PayPal IPN
    - Fandango callbacks
    - Internal payment processor updates
    """
    
    try:
        # Find and update transaction
        transaction = await find_document("transactions", {"id": status_update.transaction_id})
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        # Update transaction status
        update_data = {
            "status": status_update.status,
            "payment_id": status_update.payment_id,
            "updated_at": datetime.utcnow(),
            "payment_completed_at": status_update.timestamp if status_update.status == "completed" else None
        }
        
        await update_document("transactions", {"id": status_update.transaction_id}, update_data)
        
        # Update ticket statuses
        ticket_status = "confirmed" if status_update.status == "completed" else status_update.status
        await update_document("tickets", 
                            {"transaction_id": status_update.transaction_id}, 
                            {"status": ticket_status, "updated_at": datetime.utcnow()})
        
        # TODO: Send confirmation email/SMS to customer
        if status_update.status == "completed":
            # send_confirmation_email(transaction["user_email"], transaction)
            pass
        
        return {"message": "Payment status updated successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Webhook processing failed: {str(e)}")

@router.get("/validate/{ticket_id}")
async def validate_ticket(ticket_id: str, request: Request):
    """Validate ticket for entry (QR code scanning)"""
    await rate_limit_middleware(request)
    
    ticket = await find_document("tickets", {"id": ticket_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Check if ticket is valid for entry
    is_valid = (
        ticket["status"] == "confirmed" and
        ticket.get("scanned_at") is None  # Not already used
    )
    
    if is_valid:
        # Mark ticket as scanned
        await update_document("tickets", 
                            {"id": ticket_id}, 
                            {"scanned_at": datetime.utcnow(), "status": "used"})
    
    return TicketValidation(
        ticket_id=ticket_id,
        is_valid=is_valid,
        movie_title=ticket.get("movie_title", "Unknown"),
        theater_name=ticket.get("theater_name", "Unknown Theater"),
        showtime=ticket.get("showtime_id", "Unknown Time"),
        seat=ticket.get("seat", "Unknown Seat"),
        status=ticket["status"],
        scanned_at=ticket.get("scanned_at")
    )

@router.get("/user/{user_email}")
async def get_user_tickets(user_email: str, request: Request):
    """Get all tickets for a user"""
    await rate_limit_middleware(request)
    
    # Validate email format
    user_email = validate_email_format(user_email)
    
    # Find user's transactions
    transactions = await find_documents("transactions", {"user_email": user_email})
    
    return {
        "user_email": user_email,
        "transactions": transactions,
        "total_tickets": sum(len(t.get("tickets", [])) for t in transactions)
    }

@router.delete("/transaction/{transaction_id}")
async def cancel_transaction(transaction_id: str, request: Request):
    """Cancel a pending transaction"""
    await rate_limit_middleware(request)
    
    transaction = await find_document("transactions", {"id": transaction_id})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction["status"] != "pending":
        raise HTTPException(status_code=400, detail="Can only cancel pending transactions")
    
    # Update transaction and tickets to cancelled
    await update_document("transactions", 
                        {"id": transaction_id}, 
                        {"status": "cancelled", "updated_at": datetime.utcnow()})
    
    await update_document("tickets", 
                        {"transaction_id": transaction_id}, 
                        {"status": "cancelled", "updated_at": datetime.utcnow()})
    
    return {"message": "Transaction cancelled successfully"}

# Partner Integration Endpoints (Future)
@router.post("/partners/fandango/sync")
async def sync_with_fandango(request: Request):
    """Sync showtimes and availability with Fandango"""
    # TODO: Implement Fandango API integration
    raise HTTPException(status_code=501, detail="Fandango integration coming soon")

@router.post("/partners/atom/sync") 
async def sync_with_atom(request: Request):
    """Sync showtimes and availability with Atom Tickets"""
    # TODO: Implement Atom Tickets API integration
    raise HTTPException(status_code=501, detail="Atom Tickets integration coming soon")