"""
E2E Encryption Service for CodeMaster Chat
RSA-4096 key exchange + AES-256-GCM message encryption
Server NEVER sees plaintext messages
"""

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.backends import default_backend
import os
import base64
import json


class CryptoService:

    @staticmethod
    def generate_key_pair():
        """Generate RSA-4096 key pair for a new user."""
        private_key = rsa.generate_private_key(
            public_exponent=65537, key_size=4096, backend=default_backend()
        )
        public_key = private_key.public_key()

        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        ).decode()

        public_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode()

        return private_pem, public_pem

    @staticmethod
    def encrypt_message(plaintext: str, recipient_public_key_pem: str) -> dict:
        """
        Encrypt a message for a specific recipient.
        1. Generate random AES-256 key
        2. Encrypt message with AES-256-GCM
        3. Encrypt AES key with recipient's RSA public key
        Returns encrypted package that only recipient can decrypt
        """
        aes_key = AESGCM.generate_key(bit_length=256)
        aesgcm = AESGCM(aes_key)
        nonce = os.urandom(12)
        ciphertext = aesgcm.encrypt(nonce, plaintext.encode(), None)

        recipient_key = serialization.load_pem_public_key(
            recipient_public_key_pem.encode(), backend=default_backend()
        )
        encrypted_aes_key = recipient_key.encrypt(
            aes_key,
            padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None)
        )

        return {
            "encrypted_key": base64.b64encode(encrypted_aes_key).decode(),
            "nonce": base64.b64encode(nonce).decode(),
            "ciphertext": base64.b64encode(ciphertext).decode(),
        }

    @staticmethod
    def decrypt_message(encrypted_data: dict, private_key_pem: str) -> str:
        """
        Decrypt a message using your private key.
        1. Decrypt AES key with your RSA private key
        2. Decrypt message with AES key
        """
        private_key = serialization.load_pem_private_key(
            private_key_pem.encode(), password=None, backend=default_backend()
        )

        encrypted_aes_key = base64.b64decode(encrypted_data["encrypted_key"])
        aes_key = private_key.decrypt(
            encrypted_aes_key,
            padding.OAEP(mgf=padding.MGF1(algorithm=hashes.SHA256()), algorithm=hashes.SHA256(), label=None)
        )

        nonce = base64.b64decode(encrypted_data["nonce"])
        ciphertext = base64.b64decode(encrypted_data["ciphertext"])
        aesgcm = AESGCM(aes_key)
        plaintext = aesgcm.decrypt(nonce, ciphertext, None)

        return plaintext.decode()

    @staticmethod
    def validate_public_key(key_pem: str) -> bool:
        """Check if a public key PEM string is valid."""
        try:
            serialization.load_pem_public_key(key_pem.encode(), backend=default_backend())
            return True
        except Exception:
            return False