import os
import binascii
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


def encrypt_file(file_bytes: bytes, master_key: bytes):
    # 🔑 Convert HEX master key → raw bytes (32 bytes)
    master_key = binascii.unhexlify(master_key)

    # 1️⃣ Generate per-file AES-256 key
    file_key = os.urandom(32)

    # 2️⃣ Encrypt file content
    nonce = os.urandom(12)
    aes = AESGCM(file_key)
    encrypted_file = aes.encrypt(nonce, file_bytes, None)

    # 3️⃣ Encrypt file key with master key
    key_nonce = os.urandom(12)
    master_aes = AESGCM(master_key)
    encrypted_file_key = master_aes.encrypt(key_nonce, file_key, None)

    return {
        "encrypted_file": nonce + encrypted_file,
        "encrypted_key": key_nonce + encrypted_file_key
    }


def decrypt_file(encrypted_file: bytes, encrypted_key: bytes, master_key: bytes):
    # 🔑 Convert HEX master key → raw bytes (32 bytes)
    master_key = binascii.unhexlify(master_key)

    # 1️⃣ Decrypt file key
    key_nonce = encrypted_key[:12]
    enc_key = encrypted_key[12:]
    master_aes = AESGCM(master_key)
    file_key = master_aes.decrypt(key_nonce, enc_key, None)

    # 2️⃣ Decrypt file
    nonce = encrypted_file[:12]
    ciphertext = encrypted_file[12:]
    aes = AESGCM(file_key)
    return aes.decrypt(nonce, ciphertext, None)
