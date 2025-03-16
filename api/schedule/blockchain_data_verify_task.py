import os
import time
import shutil
import hashlib
import requests
from datetime import datetime
import click
import uuid

import app
from configs import dify_config  # 确保 API_URL 在你的配置文件中定义


@app.celery.task(queue="dataset")
def blockchain_data_verify_task():
    """
    打包整个目录，计算文件哈希，并上传文件信息到 API，上传成功后删除压缩文件
    """
    target_directory = dify_config.BLOCKCHAIN_DATADIR
    click.echo(click.style(f"Starting archive task for directory: {target_directory}", fg="green"))
    start_at = time.perf_counter()

    if not os.path.exists(target_directory):
        click.echo(click.style(f"Directory {target_directory} does not exist.", fg="green"))
        return

    try:
        # 1️⃣ 生成时间戳命名的 ZIP 文件
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        zip_filename = f"{timestamp}.zip"
        zip_path = os.path.join(os.path.dirname(target_directory), zip_filename)

        shutil.make_archive(zip_path.replace(".zip", ""), 'zip', target_directory)
        click.echo(click.style(f"Directory compressed: {zip_path}", fg="green"))

        # 2️⃣ 计算 SHA256 哈希
        file_hash = calculate_sha256(zip_path)

        # 3️⃣ 获取文件信息
        file_size = os.path.getsize(zip_path)
        modified_time = datetime.fromtimestamp(os.path.getmtime(zip_path)).isoformat()

        file_info = {
            "id": str(uuid.uuid4()),
            "address": dify_config.BLOCKCHAIN_ADDRESS,
            "area": 1,
            "owner": dify_config.BLOCKCHAIN_ORGANIZATION,
            "ownerId": dify_config.BLOCKCHAIN_ORGID,
            "algorithm": dify_config.BLOCKCHAIN_CONTRACT,
            "fileName": zip_filename,
            "fileHash": file_hash,
            "size": str(file_size),
            "modified": modified_time,
        }

        # 4️⃣ 上传文件信息到 API
        response = requests.post(f"{dify_config.BLOCKCHAIN_BASEAPI}/agency/realty/create", json=file_info)

        if response.status_code == 200:
            click.echo(click.style("File information uploaded successfully!", fg="green"))
            os.remove(zip_path)  # 删除压缩文件
            click.echo(click.style(f"Deleted zip file: {zip_path}", fg="green"))
        else:
            click.echo(click.style(f"Upload failed. Status: {response.status_code}, Response: {response.text}", fg="green"))

    except Exception as e:
        click.echo(click.style(f"Error in archive_and_upload_task: {e}", fg="green"))

    end_at = time.perf_counter()
    click.echo(click.style(f"Task completed in {end_at - start_at:.2f} seconds", fg="green"))


def calculate_sha256(file_path: str) -> str:
    """
    计算文件的 SHA256 哈希值
    """
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(8192):  # 读取文件块，避免占用过多内存
            sha256.update(chunk)
    return sha256.hexdigest()
