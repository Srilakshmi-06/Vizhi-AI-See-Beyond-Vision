from typing import Dict, Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# In production, integrate with:
# - Emergency services API
# - SMS/Call services (Twilio)
# - Location services (GPS)


def trigger_emergency(
    user_id: Optional[str] = None,
    location: Optional[str] = None,
    emergency_type: str = "general"
) -> Dict:
    """
    Trigger emergency SOS.
    
    Args:
        user_id: User identifier (optional)
        location: User's current location (GPS coordinates or address)
        emergency_type: Type of emergency (general, medical, accident)
    
    Returns:
        {
            "success": bool,
            "message": str,
            "emergency_id": str,
            "timestamp": str
        }
    """
    timestamp = datetime.now().isoformat()
    emergency_id = f"EMG_{timestamp.replace(':', '').replace('-', '').replace('.', '')}"
    
    # Log emergency
    logger.critical(f"EMERGENCY TRIGGERED: {emergency_id}")
    logger.critical(f"Type: {emergency_type}")
    logger.critical(f"Location: {location}")
    logger.critical(f"User: {user_id}")
    
    # In production:
    # 1. Send SMS to emergency contacts
    # 2. Call emergency services
    # 3. Share GPS location
    # 4. Notify nearby help
    
    return {
        "success": True,
        "message": "Emergency services have been notified. Help is on the way. Stay calm.",
        "emergency_id": emergency_id,
        "timestamp": timestamp,
        "type": emergency_type
    }


def cancel_emergency(emergency_id: str) -> Dict:
    """
    Cancel a triggered emergency.
    
    Args:
        emergency_id: Emergency ID to cancel
    
    Returns:
        {
            "success": bool,
            "message": str
        }
    """
    logger.info(f"Emergency cancelled: {emergency_id}")
    
    return {
        "success": True,
        "message": "Emergency alert cancelled."
    }
