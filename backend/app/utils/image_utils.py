import face_recognition
import numpy as np

def encode_face(image_bgr):
    # Convert OpenCV BGR → RGB
    image_rgb = image_bgr[:, :, ::-1]
    encodings = face_recognition.face_encodings(image_rgb)

    if not encodings:
        return None

    return encodings[0]  # 128-D vector


def verify_faces(stored_embedding, live_embedding, threshold=0.6):
    distance = np.linalg.norm(stored_embedding - live_embedding)
    verified = distance < threshold
    return verified, float(distance)
