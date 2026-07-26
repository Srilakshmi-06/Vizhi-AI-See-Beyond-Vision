from typing import List, Dict, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# Dangerous objects that require immediate warning
DANGEROUS_OBJECTS = {
    "car", "truck", "bus", "motorcycle", "bicycle",  # Vehicles
    "person", "dog", "cat",  # Living beings
    "chair", "bench", "couch",  # Obstacles at waist level
    "stairs", "escalator",  # Height changes
    "fire hydrant", "stop sign", "parking meter",  # Street obstacles
    "potted plant", "vase", "backpack"  # Tripping hazards
}

# Priority levels for warnings
PRIORITY_HIGH = ["car", "truck", "bus", "motorcycle", "bicycle", "stairs", "escalator"]
PRIORITY_MEDIUM = ["person", "dog", "cat", "chair", "bench"]
PRIORITY_LOW = ["fire hydrant", "stop sign", "potted plant", "backpack"]


class SafetyAgent:
    """
    Safety Agent for continuous obstacle monitoring.
    Prevents repetitive warnings by tracking recently warned objects.
    """
    
    def __init__(self, warning_cooldown_seconds: int = 5):
        """
        Initialize Safety Agent.
        
        Args:
            warning_cooldown_seconds: Time to wait before repeating a warning
        """
        self.warning_cooldown = timedelta(seconds=warning_cooldown_seconds)
        self.last_warnings: Dict[str, datetime] = {}
        
    def should_warn(self, object_name: str, position: str) -> bool:
        """
        Check if we should warn about this object.
        
        Args:
            object_name: Name of the detected object
            position: Position of the object (left, center, right)
        
        Returns:
            True if warning should be issued
        """
        key = f"{object_name}_{position}"
        current_time = datetime.now()
        
        # Check if this object was recently warned about
        if key in self.last_warnings:
            time_since_warning = current_time - self.last_warnings[key]
            if time_since_warning < self.warning_cooldown:
                return False
        
        # Update last warning time
        self.last_warnings[key] = current_time
        return True
    
    def clean_old_warnings(self):
        """
        Remove old warnings from memory to prevent memory buildup.
        """
        current_time = datetime.now()
        expired_keys = [
            key for key, timestamp in self.last_warnings.items()
            if current_time - timestamp > self.warning_cooldown * 2
        ]
        for key in expired_keys:
            del self.last_warnings[key]
    
    def get_priority(self, object_name: str) -> int:
        """
        Get priority level of an object.
        
        Args:
            object_name: Name of the object
        
        Returns:
            Priority level (1=high, 2=medium, 3=low, 4=normal)
        """
        if object_name in PRIORITY_HIGH:
            return 1
        elif object_name in PRIORITY_MEDIUM:
            return 2
        elif object_name in PRIORITY_LOW:
            return 3
        return 4
    
    def analyze_frame(self, detected_objects: List[Dict]) -> Dict:
        """
        Analyze detected objects and generate safety warnings.
        
        Args:
            detected_objects: List of detected objects from YOLO
                             Each object: {"name": str, "confidence": float, "position": str}
        
        Returns:
            {
                "warnings": List of warning messages,
                "dangerous_objects": List of dangerous objects detected,
                "safe": Boolean indicating if environment is safe
            }
        """
        # Clean old warnings periodically
        self.clean_old_warnings()
        
        warnings = []
        dangerous_objects = []
        
        # Sort objects by priority
        sorted_objects = sorted(
            detected_objects,
            key=lambda x: (self.get_priority(x["name"]), -x["confidence"])
        )
        
        for obj in sorted_objects:
            object_name = obj["name"]
            position = obj["position"]
            confidence = obj["confidence"]
            
            # Check if object is dangerous
            if object_name in DANGEROUS_OBJECTS:
                dangerous_objects.append(obj)
                
                # Check if we should warn about this object
                if self.should_warn(object_name, position):
                    warning = self._generate_warning(object_name, position)
                    warnings.append(warning)
        
        return {
            "warnings": warnings,
            "dangerous_objects": dangerous_objects,
            "safe": len(dangerous_objects) == 0,
            "total_objects": len(detected_objects)
        }
    
    def _generate_warning(self, object_name: str, position: str) -> str:
        """
        Generate warning message for an object.
        
        Args:
            object_name: Name of the object
            position: Position of the object
        
        Returns:
            Warning message
        """
        position_text = {
            "left": "on your left",
            "center": "ahead",
            "right": "on your right"
        }.get(position, position)
        
        # Special warnings for high-priority objects
        if object_name in PRIORITY_HIGH:
            if object_name in ["car", "truck", "bus"]:
                return f"Caution! Vehicle {position_text}."
            elif object_name in ["stairs", "escalator"]:
                return f"Warning! {object_name.capitalize()} {position_text}."
            else:
                return f"Alert! {object_name.capitalize()} {position_text}."
        
        # Regular warnings
        return f"{object_name.capitalize()} {position_text}."


# Global safety agent instance
_safety_agent = SafetyAgent(warning_cooldown_seconds=5)


def get_safety_agent() -> SafetyAgent:
    """
    Get the global safety agent instance.
    """
    return _safety_agent
