import os
import time
import shutil
import hashlib
import logging
import requests
from datetime import datetime
import uuid
from typing import Optional

import app
from configs import dify_config
from requests.exceptions import RequestException

# 配置日志
logger = logging.getLogger(__name__)

def validate_config() -> Optional[str]:
    """验证所需的配置项"""
    required_configs = [
        'BLOCKCHAIN_DATADIR',
        'BLOCKCHAIN_ADDRESS',
        'BLOCKCHAIN_ORGANIZATION',
        'BLOCKCHAIN_ORGID',
        'BLOCKCHAIN_CONTRACT',
        'BLOCKCHAIN_BASEAPI'
    ]

    missing = []
    for config in required_configs:
        if not hasattr(dify_config, config) or not getattr(dify_config, config):
            missing.append(config)

    return f"Missing required configurations: {', '.join(missing)}" if missing else None

@app.celery.task(queue="dataset", bind=True, max_retries=3)
def blockchain_data_verify_task(self):
    """
    打包整个目录，计算文件哈希，并上传文件信息到 API
    包含重试机制和完善的错误处理
    """
    # 验证配置
    if error_msg := validate_config():
        logger.error(error_msg)
        return

    start_at = time.perf_counter()
    target_directory = dify_config.BLOCKCHAIN_DATADIR
    zip_path = None

    logger.info(f"Starting archive task for directory: {target_directory}")

    if not os.path.exists(target_directory):
        logger.warning(f"Directory {target_directory} does not exist.")
        return

    try:
        # 生成带UUID的ZIP文件名以避免冲突
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        zip_filename = f"{timestamp}_{unique_id}.zip"
        zip_path = os.path.join(os.path.dirname(target_directory), zip_filename)

        # 使用 try-finally 确保清理临时文件
        try:
            shutil.make_archive(zip_path.replace(".zip", ""), 'zip', target_directory)
            logger.info(f"Directory compressed: {zip_path}")

            # 计算 SHA256 哈希
            file_hash = calculate_sha256(zip_path)

            # 获取文件信息
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

            # 上传文件信息到 API（带超时和重试）
            try:
                response = requests.post(
                    f"{dify_config.BLOCKCHAIN_BASEAPI}/agency/realty/create",
                    json=file_info,
                    timeout=30  # 设置30秒超时
                )
                response.raise_for_status()
                logger.info("File information uploaded successfully!")

            except RequestException as e:
                # 如果是可重试的错误，抛出异常以触发Celery重试机制
                logger.error(f"Upload failed: {str(e)}")
                raise self.retry(exc=e, countdown=60)  # 1分钟后重试

        finally:
            # 清理临时文件
            if zip_path and os.path.exists(zip_path):
                os.remove(zip_path)
                logger.info(f"Cleaned up temporary file: {zip_path}")

    except Exception as e:
        logger.error(f"Error in blockchain_data_verify_task: {str(e)}", exc_info=True)
        raise  # 重新抛出异常，让Celery处理任务失败

    finally:
        end_at = time.perf_counter()
        logger.info(f"Task completed in {end_at - start_at:.2f} seconds")

def calculate_sha256(file_path: str) -> str:
    """
    计算文件的 SHA256 哈希值
    """
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(8192):  # 读取文件块，避免占用过多内存
            sha256.update(chunk)
    return sha256.hexdigest()