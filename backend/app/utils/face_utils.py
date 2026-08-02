import face_recognition
import numpy as np
from io import BytesIO
from PIL import Image


def encode_face(image_bytes: bytes) -> np.ndarray:
    """
    Returns 128-D face encoding
    """
    image = face_recognition.load_image_file(BytesIO(image_bytes))
    encodings = face_recognition.face_encodings(image)

    if len(encodings) == 0:
        return None

    return encodings[0]  # 128-D


def verify_faces(stored_encoding: np.ndarray, live_encoding: np.ndarray, threshold=0.6):
    """
    Compares two 128-D encodings
    """
    distance = face_recognition.face_distance(
        [stored_encoding],
        live_encoding
    )[0]

    verified = distance <= threshold
    return verified, float(distance)
