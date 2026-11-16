#!/usr/bin/env python3
"""
Dossia — HashiCorp Vault Community Edition Bootstrapper & Secret Seeder (SEC-01)
================================================================================
Initializes and seeds HashiCorp Vault KV v2 secret engine at 'secret/data/dossia'
with PostgreSQL database, MinIO object storage, JWT HMAC, and AI provider secrets.
"""

import os
import sys
import json
import urllib.request
import urllib.error

DEFAULT_VAULT_ADDR = os.getenv("VAULT_ADDR", "http://127.0.0.1:8200").rstrip("/")
DEFAULT_VAULT_TOKEN = os.getenv("VAULT_TOKEN", "dossia_vault_dev_root_token_2026")
DEFAULT_SECRET_PATH = os.getenv("VAULT_SECRET_PATH", "secret/data/dossia").lstrip("/")


def mask_secret(value: str) -> str:
    if not value or len(value) <= 6:
        return "******"
    return value[:3] + "..." + value[-3:]


def check_vault_health(vault_addr: str) -> bool:
    url = f"{vault_addr}/v1/sys/health"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Dossia-Vault-Bootstrap"})
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode())
            print(f"[OK] Vault status: initialized={data.get('initialized')}, sealed={data.get('sealed')}, version={data.get('version')}")
            return True
    except Exception as e:
        print(f"[WARN] Could not contact Vault health endpoint at {url}: {e}")
        return False


def seed_secrets(vault_addr: str, token: str, secret_path: str, secrets: dict) -> bool:
    url = f"{vault_addr}/v1/{secret_path}"
    payload = json.dumps({"data": secrets}).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "X-Vault-Token": token,
            "Content-Type": "application/json",
            "User-Agent": "Dossia-Vault-Bootstrap"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status in (200, 204):
                print(f"[SUCCESS] Successfully wrote {len(secrets)} secrets to Vault path '{secret_path}'")
                return True
            else:
                print(f"[ERROR] Vault returned unexpected HTTP status: {resp.status}")
                return False
    except urllib.error.HTTPError as e:
        print(f"[ERROR] Failed to write secrets to Vault ({e.code}): {e.read().decode()}")
        return False
    except Exception as e:
        print(f"[ERROR] Connection error writing to Vault: {e}")
        return False


def verify_secrets(vault_addr: str, token: str, secret_path: str) -> dict:
    url = f"{vault_addr}/v1/{secret_path}"
    req = urllib.request.Request(
        url,
        headers={
            "X-Vault-Token": token,
            "Accept": "application/json",
            "User-Agent": "Dossia-Vault-Bootstrap"
        },
        method="GET"
    )

    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode())
            stored = data.get("data", {}).get("data", {})
            print(f"[OK] Verification successful. Vault contains {len(stored)} keys at '{secret_path}':")
            for k, v in stored.items():
                print(f"     • {k}: {mask_secret(str(v))}")
            return stored
    except Exception as e:
        print(f"[WARN] Failed to read back secrets from Vault: {e}")
        return {}


def main():
    print("=" * 70)
    print("Dossia SaaS — HashiCorp Vault Secrets Bootstrapper (SEC-01)")
    print("=" * 70)

    vault_addr = os.getenv("VAULT_ADDR", DEFAULT_VAULT_ADDR)
    token = os.getenv("VAULT_TOKEN", DEFAULT_VAULT_TOKEN)
    secret_path = os.getenv("VAULT_SECRET_PATH", DEFAULT_SECRET_PATH)

    print(f"Target Vault Endpoint : {vault_addr}")
    print(f"Secret Engine Path    : {secret_path}")

    # Gather secrets from environment or default dev credentials
    secrets_to_seed = {
        "db_password": os.getenv("DB_PASSWORD", "dossia_dev_password_2026"),
        "db_user": os.getenv("DB_USER", "dossia_user"),
        "minio_secret_key": os.getenv("MINIO_SECRET_KEY", "dossia_minio_dev_secret_2026"),
        "minio_access_key": os.getenv("MINIO_ACCESS_KEY", "dossia_minio_admin"),
        "jwt_secret": os.getenv("JWT_SECRET", "dossia_secret_key_morocco_clinical_saas_jwt_token_2026_super_secure_key_123"),
        "ai_api_key": os.getenv("DOSSIA_AI_API_KEY", "")
    }

    if "--check" in sys.argv:
        if check_vault_health(vault_addr):
            verify_secrets(vault_addr, token, secret_path)
        return

    healthy = check_vault_health(vault_addr)
    if not healthy:
        print(f"\n[INFO] HashiCorp Vault is not reachable at {vault_addr}.")
        print("[INFO] Start Vault with: docker compose up -d vault")
        print("[INFO] Spring Boot will use local fallback properties when Vault is offline.")
        return

    success = seed_secrets(vault_addr, token, secret_path, secrets_to_seed)
    if success:
        verify_secrets(vault_addr, token, secret_path)


if __name__ == "__main__":
    main()
