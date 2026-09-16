# Smart Municipal Council API

## POST /chat

Request

{
  "message": "How do I report a water leak?"
}

---

## POST /predict-priority

Request

{
  "complaint": "tree fallen on road"
}

Response

{
  "priority": "HIGH"
}

---

## POST /check-duplicate

Request

{
  "complaint": "water not coming since yesterday"
}

Response

{
  "duplicate": true,
  "similarity": 0.72,
  "matched_complaint": "water not working since yesterday night"
}

---

## POST /analyze-complaint

Request

{
  "complaint": "tree fallen on road blocking traffic"
}

Response

{
  "priority": "HIGH",
  "duplicate": false,
  "similarity": 0.34,
  "matched_complaint": "Tree fell on the road completely blocked dangerous"
}