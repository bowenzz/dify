import os
import time
import shutil
import hashlib
import requests
from datetime import datetime
import uuid
import logging
from apscheduler.schedulers.background import BackgroundScheduler

from configs import dify_config  # 确保 API_URL 在你的配置文件中定义
from dify_app import DifyApp


def init_app(app: DifyApp):
    """
    初始化应用，启动定时备份任务
    """
    # 获取环境变量中的MODE
    mode = os.environ.get('MODE')
    if mode and mode == "api":
        return
    logging.info("Initializing blockchain backup scheduler...")

    # 创建后台调度器
    scheduler = BackgroundScheduler()

    # 添加定时任务，默认每天凌晨2点执行备份
    scheduler.add_job(
        run_backup_script,
        trigger='interval',
        hours=dify_config.BLOCKCHAIN_WORKTIME,
        id='blockchain_backup',
        name='Blockchain daily backup',
        replace_existing=True
    )

    # 启动调度器
    try:
        scheduler.start()
        logging.info("Blockchain backup scheduler started successfully")
    except Exception as e:
        logging.error(f"Failed to start blockchain backup scheduler: {e}")

def run_backup_script():
    """
    打包整个目录，计算文件哈希，并上传文件信息到 API，上传成功后删除压缩文件
    """
    target_directory = dify_config.BLOCKCHAIN_DATADIR
    logging.info(f"Starting archive task for directory: {target_directory}")
    start_at = time.perf_counter()

    if not os.path.exists(target_directory):
        logging.info(f"Directory {target_directory} does not exist.")
        return

    try:
        # 生成时间戳命名的 ZIP 文件
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        zip_filename = f"{timestamp}.zip"
        zip_path = os.path.join(os.path.dirname(target_directory), zip_filename)

        shutil.make_archive(zip_path.replace(".zip", ""), 'zip', target_directory)
        logging.info(f"Directory compressed: {zip_path}")

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

        # 上传文件信息到 API
        response = requests.post(f"{dify_config.BLOCKCHAIN_BASEAPI}/agency/realty/create", json=file_info)

        if response.status_code == 200:
            logging.info("File information uploaded successfully!")
            os.remove(zip_path)  # 删除压缩文件
            logging.info(f"Deleted zip file: {zip_path}")
        else:
            logging.info(f"Upload failed. Status: {response.status_code}, Response: {response.text}")

    except Exception as e:
        logging.info(f"Error in archive_and_upload_task: {e}")

    end_at = time.perf_counter()
    logging.info(f"Task completed in {end_at - start_at:.2f} seconds")

def calculate_sha256(file_path: str) -> str:
    """
    计算文件的 SHA256 哈希值
    """
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(8192):  # 读取文件块，避免占用过多内存
            sha256.update(chunk)
    return sha256.hexdigest()
