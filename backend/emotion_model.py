"""Deterministic fallback for a future multilingual Hugging Face model."""
LABELS = ("anxiety", "excitement", "sarcasm", "support", "opposition", "anger", "hope")
CUES = (
    ("safe", "hot", "garam"), ("great", "looks", "camera"), ("hand warmer", "premium"),
    ("recommend", "solid"), ("wait", "avoid"), ("unacceptable", "stop"), ("promising", "replacement"),
)


def score(text: str) -> dict[str, float]:
    # A production adapter can instantiate transformers.pipeline once during
    # lifespan startup and score with a calibrated XLM-R multi-label checkpoint.
    normalized = text.lower()
    return {label: .89 if any(word in normalized for word in cues) else .12
            for label, cues in zip(LABELS, CUES)}
