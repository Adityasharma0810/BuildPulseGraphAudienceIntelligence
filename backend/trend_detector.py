"""Burst detection baseline; production can replace it with Kleinberg or Hawkes."""
from math import sqrt
from random import Random
from statistics import mean


def trends(day: int) -> list[dict]:
    keywords = ("NovaX1", "NovaBattery", "NovaReplace", "FlagshipFaceoff")
    out = []
    for i, (keyword, peak) in enumerate(zip(keywords, (3, 12, 20, 27))):
        rng = Random(192 + i)
        volume = [int(14 + rng.random() * 13 + 110 / (1 + ((d - peak) / 1.9) ** 2)) for d in range(1, 32)]
        current = volume[day - 1]
        baseline = mean(volume[max(0, day - 6):max(1, day - 1)])
        velocity = round(100 * (current - baseline) / baseline)
        forecast = volume[day]
        margin = round(sqrt(forecast) * 1.7)
        out.append({"keyword": keyword, "hashtag": f"#{keyword}", "volume": current,
                    "velocity": velocity, "stage": "Viral" if day == peak else "Rising" if 0 < peak - day <= 4 else "Emerging" if day < peak else "Declining",
                    "forecast": {"estimate": forecast, "low": max(0, forecast - margin), "high": forecast + margin}})
    return sorted(out, key=lambda value: value["volume"], reverse=True)
