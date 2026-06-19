"""Image-related helpers."""
from __future__ import annotations

ALLOWED_EXT = {"jpg", "jpeg", "png", "webp"}


def is_allowed_image(filename: str) -> bool:
    if "." not in filename:
        return False
    return filename.rsplit(".", 1)[1].lower() in ALLOWED_EXT
