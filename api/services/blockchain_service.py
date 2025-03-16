from configs.extra import BlockchainConfig
from core.extension.api_based_extension_requestor import APIBasedExtensionRequestor
from core.helper.encrypter import decrypt_token, encrypt_token
from extensions.ext_database import db
from pydantic import BaseModel, ConfigDict
from configs import dify_config
import requests
import logging

from models import APIBasedExtension

class OptionModel(BaseModel):
    name : str = ""
    value : str = ""

class BlockchainNode(BaseModel):
    orgName: str = ""
    peerName: str = ""
    mspID: str = ""
    url: str = ""
    status: str = "Active"

class BlockchainNodeModel(BaseModel):
    chaincode: str = ""
    channel: str = ""
    network: str = ""
    nodes: list[BlockchainNode] = []
    nodesCount: int = 0
    orgCount: int = 0
    queryTime: str = ""

class BlockchainContractModel(BaseModel):
    name : str = ""
    version : str = ""
    description : str = ""
    abi : str = ""

class BlockchainBlockModel(BaseModel):
    block_num : int = 0
    block_hash : str = ""
    data_hash : str = ""
    prev_hash : str = ""
    tx_count : int = 0
    save_time : str = ""

class BlockchainConfigModel(BaseModel):
    enabled : bool = False
    name : str = ""
    organization : str = ""
    address : str = ""
    alias : str = ""
    channel : str = ""
    chain_code : str = ""
    contract : str = ""
    node_name : str = ""
    node_url : str = ""
    node_amount : str = ""
    block_height : str = ""
    node_options : list[OptionModel] = []
    network_options : list[OptionModel] = []
    contract_options : list[OptionModel] = []
    node_list : list[BlockchainNode] = []
    block_list : list[BlockchainBlockModel] = []
    contract_list : list[BlockchainContractModel] = []


class BlockChainConfigService:
    @classmethod
    def get_config(cls):
        # config = BlockchainConfigModel()
        config = {
            "enabled": dify_config.BLOCKCHAIN_ENABLED,
            "name": dify_config.BLOCKCHAIN_NAME,
            "organization": dify_config.BLOCKCHAIN_ORGANIZATION,
            "orgId": dify_config.BLOCKCHAIN_ORGID,
            "address": dify_config.BLOCKCHAIN_ADDRESS,
            "alias": dify_config.BLOCKCHAIN_ALIAS,
            "channel": dify_config.BLOCKCHAIN_CHANNEL,
            "contract": dify_config.BLOCKCHAIN_CONTRACT,
            "network": dify_config.BLOCKCHAIN_NETWORK,
            "node_list": []
        }

        return config

    @classmethod
    def update_config(cls, data) -> BlockchainConfigModel:
        config = BlockchainConfigModel()
        if not isinstance(data, dict):
            data = data.__dict__

        config.enabled = data["enabled"]
        config.name = data["name"]
        config.organization = data["organization"]
        config.address = data["address"]
        config.alias = data["alias"]
        config.channel = data["channel"]
        config.contract = data["contract"]
        config.node_name = data["node_name"]

        dify_config.BLOCKCHAIN_ENABLED = config.enabled
        dify_config.BLOCKCHAIN_NAME = config.name
        dify_config.BLOCKCHAIN_ADDRESS = config.address
        dify_config.BLOCKCHAIN_CONTRACT_ALIAS = config.alias
        dify_config.BLOCKCHAIN_ORGANIZATION = config.organization
        dify_config.BLOCKCHAIN_CONTRACT = config.contract
        dify_config.BLOCKCHAIN_CHANNEL = config.channel

        if config.enabled:
            for node in config.node_list:
                cls._ping_node(node)

        return config


    def update_blockchain_status(self, enabled: bool) -> BlockchainConfigModel:
        config = BlockchainConfigModel()
        config = self._blockchain_config_from_env(config)

        if enabled == config.enabled:
            return config

        config.enabled = enabled
        dify_config.BLOCKCHAIN_ENABLED = config.enabled

        return config

    @staticmethod
    def delete(config:BlockchainConfigModel) -> None:
        pass

    @staticmethod
    def _ping_node(node:BlockchainNodeModel) -> None:
        try:
            client = BlockchainNodeService()
            resp = client.request(node, {"action":"ping"})
            if resp.get("result") != "pong":
                raise ValueError(resp)
        except Exception as e:
            raise ValueError("connection error: {}".format(e))

    @staticmethod
    def _blockchain_config_from_env(config: BlockchainConfigModel):
        config.enabled = dify_config.BLOCKCHAIN_ENABLED
        config.name = dify_config.BLOCKCHAIN_NAME
        config.address = dify_config.BLOCKCHAIN_ADDRESS
        config.organization = dify_config.BLOCKCHAIN_ORGANIZATION
        config.alias = dify_config.BLOCKCHAIN_ALIAS
        config.channel = dify_config.BLOCKCHAIN_CHANNEL
        config.contract = dify_config.BLOCKCHAIN_CONTRACT

        return config


class BlockchainNodeService:
    timeout: tuple[int, int] = (5, 60)
    """timeout for request connect and read"""
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    url = dify_config.BLOCKCHAIN_BASEAPI
    sign = dify_config.BLOCKCHAIN_SIGNATURE

    def request(self, point: BlockchainNodeModel, params: dict):
        url = f"{self.url}:{point}"
        response = requests.post(url, headers=self.headers, data=params, timeout=self.timeout)
        response.raise_for_status()
        return response.json()

    @classmethod
    def get_info(cls, node_url: str="") -> BlockchainNodeModel:
        try:
            if not node_url:
                node_url = f"{cls.url}/agency/network/info"
            url = f"{node_url}"
            response = requests.get(url, headers=cls.headers, timeout=cls.timeout)
            response.raise_for_status()
            response_data = response.json()
            if response_data.get('code') == 200 and 'data' in response_data:
                data = response_data['data']
                return BlockchainNodeModel(**data)
            else:
                return BlockchainNodeModel()
        except Exception as e:
            logging.info(f"get_info error: {e}")
            # raise ValueError("connection error: {}".format(e))
            return BlockchainNodeModel()

    @classmethod
    def get_blocks(cls, node_url: str="", pagesize: int = 10, pagenum: int = 1) -> dict:
        try:
            if not node_url:
                node_url = f"{cls.url}/agency/block/list"
            url = f"{node_url}?pageSize={pagesize}&pageNum={pagenum}"
            response = requests.get(url, headers=cls.headers, timeout=cls.timeout)
            response.raise_for_status()
            response_data = response.json()
            blocks = []
            total = 0
            if response_data.get('code') == 200 and 'data' in response_data:
                data = response_data['data']
                blocks = [BlockchainBlockModel(**block) for block in data.get('blocks', [])]
                total = data.get('total', 0)
            else:
                logging.info(f"get_blocks error: {response_data.get('code')}")
            # 验证和转换数据

            return {
                "blocks": blocks,
                "total": total,
                "page_size": pagesize,
                "page_num": pagenum,
                "has_more": len(blocks) == pagesize
            }
        except Exception as e:
            print(f"get_blocks error: {e}")
            # raise ValueError("connection error: {}".format(e))
            return {
                "blocks": [],
                "total": 0,
                "page_size": pagesize,
                "page_num": pagenum,
                "has_more": False
            }