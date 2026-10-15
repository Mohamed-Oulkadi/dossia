from minio import Minio

client = Minio(
    "localhost:9000",
    access_key="dossia_minio_admin",
    secret_key="dossia_minio_dev_secret_2026",
    secure=False
)

bucket = "dossia-medical-vault"
print(f"Checking bucket: {bucket}")
objects = client.list_objects(bucket, recursive=True)
for obj in objects:
    print(f"- Object: {obj.object_name} | Size: {obj.size} bytes | Content-Type: {obj.content_type}")
