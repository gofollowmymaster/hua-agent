class CumulativeDeltaNormalizer:
    """Converts cumulative provider snapshots into non-duplicated deltas."""

    def __init__(self) -> None:
        self._values: dict[str, str] = {}

    def normalize(self, channel: str, value: str) -> str:
        """Returns only unseen text while preserving independent channels."""
        if not value:
            return ""
        previous = self._values.get(channel, "")
        if value == previous:
            return ""
        if value.startswith(previous):
            delta = value[len(previous) :]
            self._values[channel] = value
            return delta
        self._values[channel] = previous + value
        return value
