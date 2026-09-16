from services.priority_service import predict_priority
from services.duplicate_service import check_duplicate


def analyze_complaint(complaint):

    priority = predict_priority(
        complaint
    )

    duplicate_result = check_duplicate(
        complaint
    )

    return {
        "priority": priority,
        "duplicate": duplicate_result["duplicate"],
        "similarity": duplicate_result["similarity"],
        "matched_complaint":
            duplicate_result["matched_complaint"]
    }
