from services.priority_service import predict_priority
from services.category_service import predict_category
from services.duplicate_service import check_duplicate


def analyze_complaint(complaint):
    priority = predict_priority(complaint)
    category = predict_category(complaint)
    duplicate_result = check_duplicate(complaint)

    return {
        "priority": priority,
        "category": category,
        "duplicate": duplicate_result["duplicate"],
        "similarity": duplicate_result["similarity"],
        "matched_complaint": duplicate_result["matched_complaint"],
    }
