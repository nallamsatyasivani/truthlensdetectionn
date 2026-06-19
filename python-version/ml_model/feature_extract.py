"""Lightweight image feature extraction.

Produces a 16-dim feature vector summarising colour stats, edge density,
frequency-domain energy, and noise characteristics. Real AI-vs-Real
classifiers tend to use these kinds of low-level signals.
"""
from __future__ import annotations

import numpy as np
from PIL import Image, ImageFilter


def extract_features(image_path: str) -> np.ndarray:
    img = Image.open(image_path).convert("RGB").resize((256, 256))
    arr = np.asarray(img, dtype=np.float32) / 255.0  # H,W,3

    # 1-3: per-channel means
    means = arr.mean(axis=(0, 1))
    # 4-6: per-channel stds
    stds = arr.std(axis=(0, 1))

    gray = arr.mean(axis=2)

    # 7: overall brightness
    brightness = float(gray.mean())
    # 8: contrast
    contrast = float(gray.std())

    # 9: edge density (Sobel-like via PIL)
    edges = np.asarray(img.convert("L").filter(ImageFilter.FIND_EDGES), dtype=np.float32) / 255.0
    edge_density = float(edges.mean())
    # 10: edge std
    edge_std = float(edges.std())

    # 11-12: FFT energy split (low vs high freq)
    f = np.fft.fftshift(np.fft.fft2(gray))
    mag = np.log1p(np.abs(f))
    h, w = mag.shape
    cy, cx = h // 2, w // 2
    r = min(h, w) // 8
    low = mag[cy - r:cy + r, cx - r:cx + r].mean()
    total = mag.mean()
    high = total - low * (4 * r * r) / (h * w)
    low_e = float(low)
    high_e = float(high)

    # 13: noise estimate (residual after blur)
    blurred = np.asarray(img.filter(ImageFilter.GaussianBlur(1.2)), dtype=np.float32) / 255.0
    noise = float(np.abs(arr - blurred).mean())

    # 14: saturation proxy (max-min channel)
    sat = float((arr.max(axis=2) - arr.min(axis=2)).mean())

    # 15: green-red ratio
    gr = float(arr[..., 1].mean() / (arr[..., 0].mean() + 1e-6))

    # 16: blue-red ratio
    br = float(arr[..., 2].mean() / (arr[..., 0].mean() + 1e-6))

    return np.array([
        means[0], means[1], means[2],
        stds[0], stds[1], stds[2],
        brightness, contrast,
        edge_density, edge_std,
        low_e, high_e,
        noise, sat, gr, br,
    ], dtype=np.float32)
