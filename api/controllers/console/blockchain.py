from flask_login import current_user  # type: ignore
from flask_restful import Resource, marshal_with, reqparse  # type: ignore

from constants import HIDDEN_VALUE
from controllers.console import api
from controllers.console.wraps import account_initialization_required, setup_required
from fields.blockchain_fields import blockchain_fields,blockchain_block_fields
from libs.login import login_required
from services.blockchain_service import BlockChainConfigService,BlockchainNodeService
from werkzeug.exceptions import BadRequest, Forbidden, abort
import logging

class BlockChainConfigAPI(Resource):
    @setup_required
    @login_required
    @account_initialization_required
    @marshal_with(blockchain_fields)
    def get(self):
        result = BlockChainConfigService.get_config()
        try:
            nodes_info = BlockchainNodeService.get_info()
            if nodes_info and hasattr(nodes_info, 'nodes'):
                result["node_list"] = nodes_info.nodes
            else:
                result["node_list"] = []

        except Exception as e:
            logging.error(f"BlockChainConfigAPI.get() - 获取节点信息时发生异常: {str(e)}", exc_info=True)
            result["node_list"] = []

        return result

    @setup_required
    @login_required
    @account_initialization_required
    @marshal_with(blockchain_fields)
    def post(self):
        if not current_user.is_admin_or_owner:
            raise Forbidden()
        parser = reqparse.RequestParser()
        parser.add_argument("enabled", type=bool, required=False, location="json")
        parser.add_argument("name", type=str, required=True, location="json")
        parser.add_argument("organization", type=str, required=True, location="json")
        parser.add_argument("address", type=str, required=True, location="json")
        parser.add_argument("alias", type=str, required=False, location="json")
        parser.add_argument("channel", type=str, required=False, location="json")
        parser.add_argument("contract", type=str, required=False, location="json")
        parser.add_argument("node_name", type=str, required=False, location="json")
        args = parser.parse_args()

        data = {
            "enabled": args.enabled,
            "name": args.get("name"),
            "organization": args.get("organization"),
            "address": args.get("address"),
            "alias": args.get("alias"),
            "channel": args.get("channel"),
            "contract": args.get("contract"),
            "node_name": args.get("node_name"),
        }

        return BlockChainConfigService.update_config(data)

class BlockchainStatus(Resource):
    @setup_required
    @login_required
    @account_initialization_required
    @marshal_with(blockchain_fields)
    def post(self):
        if not current_user.is_admin_or_owner:
            raise Forbidden()

        parser = reqparse.RequestParser()
        parser.add_argument("blockchain_enable", type=bool, required=True, location="json")
        args = parser.parse_args()

        blockchain_service = BlockChainConfigService()
        config = blockchain_service.update_blockchain_status(args.get("blockchain_enable"))

        return config

class BlockchainNodeAPI(Resource):
    @setup_required
    @login_required
    @account_initialization_required
    @marshal_with(blockchain_fields)
    def get(self):
        return BlockchainNodeService.get_info()

    @setup_required
    @login_required
    @account_initialization_required
    @marshal_with(blockchain_fields)
    def post(self):
        extension_data_from_db = BlockChainConfigService.get_config()

        parser = reqparse.RequestParser()
        parser.add_argument("name", type=str, required=True, location="json")
        parser.add_argument("api_endpoint", type=str, required=True, location="json")
        parser.add_argument("api_key", type=str, required=True, location="json")
        args = parser.parse_args()

        extension_data_from_db.name = args["name"]
        extension_data_from_db.api_endpoint = args["api_endpoint"]

        if args["api_key"] != HIDDEN_VALUE:
            extension_data_from_db.api_key = args["api_key"]

        return BlockChainConfigService.update_config(extension_data_from_db)

    @setup_required
    @login_required
    @account_initialization_required
    def delete(self):
        extension_data_from_db = BlockChainConfigService.get_config()

        BlockChainConfigService.delete(extension_data_from_db)

        return {"result": "success"}

class BlockchainBlockAPI(Resource):
    @setup_required
    @login_required
    @account_initialization_required
    @marshal_with(blockchain_block_fields)
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument("pagesize", type=int, default=10, location="args")
        parser.add_argument("pagenum", type=int, default=1, location="args")
        args = parser.parse_args()

        try:
            blocks_data = BlockchainNodeService.get_blocks(pagesize=args['pagesize'], pagenum=args['pagenum'])
            return blocks_data
        except Exception as e:
            print(f"Failed to get blockchain blocks: {str(e)}")
            return {"blocks": [], "total": 0,
                    "page_size": args['pagesize'],
                    "page_num": args['pagenum'],
                    "has_more": False}

api.add_resource(BlockChainConfigAPI, "/blockchain/config")
api.add_resource(BlockchainStatus, "/blockchain/status")
api.add_resource(BlockchainNodeAPI, "/blockchain/node")
api.add_resource(BlockchainBlockAPI, "/blockchain/blocks")