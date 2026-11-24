"""Reference connector interface. Real adapters must use authorized, public APIs."""
from datetime import datetime, timedelta, timezone
from itertools import cycle
from typing import Iterator


class PublicConnector:
    def __init__(self, platform: str, samples: tuple[str, ...]):
        self.platform = platform
        self.samples = samples

    def events(self) -> Iterator[dict]:
        for index, text in enumerate(cycle(self.samples)):
            timestamp = datetime(2026, 4, 12, tzinfo=timezone.utc) + timedelta(seconds=index)
            yield {"id": f"{self.platform.lower()}-{index}", "platform": self.platform,
                   "timestamp": timestamp.isoformat(), "text": text, "handle": f"@signal_{index % 30:03}"}


# Swap the fixture iterator for authorized X API or Telegram public-channel
# consumers. Keep cursor, deletion handling, and source-specific quotas in each adapter.
x = PublicConnector("X", ("Love that my Nova doubles as a hand warmer.", "The Nova camera looks great."))
telegram = PublicConnector("Telegram", ("Battery itni garam kyun ho rahi hai?", "Free replacements are a promising start."))
