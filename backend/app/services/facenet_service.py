import torch
import numpy as np
from facenet_pytorch import InceptionResnetV1

# Load FaceNet once (VERY IMPORTANT)
model = InceptionResnetV1(pretrained="vggface2").eval()

def get_face_embedding(face_tensor: torch.Tensor) -> np.ndarray:
    """
    Input: preprocessed face tensor [1, 3, 160, 160]
    Output: numpy embedding (512,)
    """
    with torch.no_grad():
        embedding = model(face_tensor)

    return embedding.cpu().numpy()[0]
