import numpy as np


def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    """
    Compute cosine similarity between two vectors.
    Returns value in range [-1, 1], higher = more similar.
    """

    vec1 = np.asarray(vec1, dtype=np.float32)
    vec2 = np.asarray(vec2, dtype=np.float32)

    if vec1.shape != vec2.shape:
        return 0.0

    dot = np.dot(vec1, vec2)
    norm = np.linalg.norm(vec1) * np.linalg.norm(vec2)

    if norm == 0:
        return 0.0

    return float(dot / norm)
