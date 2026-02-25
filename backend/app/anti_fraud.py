"""Anti-fraud pipeline for request validation."""
import re
from typing import Dict, Any, Tuple, Optional
from app.models import TrackType


# Prompt injection patterns
PROMPT_INJECTION_PATTERNS = [
    r"(?i)(ignore|forget|disregard).*(previous|above|instructions)",
    r"(?i)(you are|act as|pretend to be)",
    r"(?i)(system|assistant|user):",
    r"(?i)(<\|.*?\|>)",  # Special tokens
    r"(?i)(\[INST\]|\[/INST\])",  # Llama format
]


def stage1_rule_based_check(track: TrackType, form_data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Stage 1: Cheap rule-based checks.
    
    Returns: (is_valid, rejection_reason)
    """
    # Extract goal/description from form_data
    goal = form_data.get("goal", "").strip() if isinstance(form_data.get("goal"), str) else ""
    description = form_data.get("description", "").strip() if isinstance(form_data.get("description"), str) else ""
    
    text_input = f"{goal} {description}".strip()
    
    # Check 1: Empty or very short
    if len(text_input) < 10:
        return False, "Please provide more details about your goals. We need at least 10 characters to help you."
    
    # Check 2: Unrealistic numeric values
    if track == TrackType.SUPPLEMENTS:
        age = form_data.get("age")
        if age and (isinstance(age, (int, float)) and (age < 10 or age > 120)):
            return False, "Please provide a valid age."
        
        weight = form_data.get("weight")
        if weight and (isinstance(weight, (int, float)) and (weight < 20 or weight > 500)):
            return False, "Please provide a valid weight in kg."
    
    # Check 3: Random or meaningless text
    if len(set(text_input.split())) < 3:
        return False, "Please provide more meaningful information about your goals."
    
    # Check 4: Prompt injection attempts
    for pattern in PROMPT_INJECTION_PATTERNS:
        if re.search(pattern, text_input):
            return False, "Invalid input detected. Please provide a valid health-related query."
    
    # Check 5: Non-health queries (basic keyword check)
    health_keywords = [
        "health", "fitness", "workout", "exercise", "supplement", "nutrition",
        "diet", "muscle", "strength", "weight", "cardio", "training", "gym",
        "protein", "vitamin", "mineral", "body", "fit", "train", "sport"
    ]
    text_lower = text_input.lower()
    if not any(keyword in text_lower for keyword in health_keywords):
        return False, "Please provide a health or fitness-related query."
    
    # Check 6: Suspicious repeated patterns
    words = text_input.split()
    if len(words) > 5:
        word_counts = {}
        for word in words:
            word_counts[word] = word_counts.get(word, 0) + 1
        max_repeats = max(word_counts.values())
        if max_repeats > len(words) * 0.5:  # More than 50% same word
            return False, "Please provide more varied information."
    
    # Check 7: Language detection (basic - check for non-Latin if expecting English)
    # This is a simple check - in production, use a proper language detection library
    if not re.search(r'[a-zA-Z]', text_input):
        return False, "Please provide your query in English or your preferred language."
    
    return True, None


def stage2_structured_validation(track: TrackType, form_data: Dict[str, Any]) -> Tuple[bool, Optional[str], Optional[Dict[str, Any]]]:
    """
    Stage 2: Structured validation and context building.
    
    Returns: (is_valid, error_message, structured_context)
    """
    structured_context = {}
    
    if track == TrackType.SUPPLEMENTS:
        # Required fields
        required = ["goal", "age"]
        for field in required:
            if not form_data.get(field):
                return False, f"Please provide your {field}.", None
        
        # Build structured context
        structured_context = {
            "goal": form_data.get("goal", ""),
            "age": form_data.get("age"),
            "weight": form_data.get("weight"),
            "height": form_data.get("height"),
            "activity_level": form_data.get("activity_level", "moderate"),
            "dietary_restrictions": form_data.get("dietary_restrictions", []),
            "current_supplements": form_data.get("current_supplements", []),
            "health_conditions": form_data.get("health_conditions", []),
            "budget": form_data.get("budget", "moderate"),
        }
        
        # Validate age
        age = structured_context.get("age")
        if age and (not isinstance(age, (int, float)) or age < 10 or age > 120):
            return False, "Please provide a valid age (10-120).", None
        
    elif track == TrackType.WORKOUTS:
        # Required fields
        required = ["goal", "fitness_level"]
        for field in required:
            if not form_data.get(field):
                return False, f"Please provide your {field}.", None
        
        # Build structured context
        structured_context = {
            "goal": form_data.get("goal", ""),
            "fitness_level": form_data.get("fitness_level", "beginner"),
            "available_equipment": form_data.get("available_equipment", []),
            "time_per_week": form_data.get("time_per_week", 3),
            "preferred_activities": form_data.get("preferred_activities", []),
            "injuries": form_data.get("injuries", []),
            "age": form_data.get("age"),
            "weight": form_data.get("weight"),
            "height": form_data.get("height"),
        }
        
        # Validate time_per_week
        time_per_week = structured_context.get("time_per_week")
        if time_per_week and (not isinstance(time_per_week, (int, float)) or time_per_week < 1 or time_per_week > 14):
            return False, "Please provide valid time per week (1-14 hours).", None
    
    # Ensure goal is actionable
    goal = structured_context.get("goal", "")
    if len(goal.strip()) < 15:
        return False, "Please provide a more detailed goal (at least 15 characters).", None
    
    return True, None, structured_context
