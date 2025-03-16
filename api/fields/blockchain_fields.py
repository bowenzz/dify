from flask_restful import fields  # type: ignore

from libs.helper import TimestampField


blockchain_node_fields = {
    "orgName": fields.String,
    "peerName": fields.String,
    "mspID": fields.String,
    "url": fields.String,
    "status": fields.String,
}

blockchain_block_fields = {
    "blocks": fields.List(fields.Nested({
        "block_num": fields.Integer,
        "block_hash": fields.String,
        "data_hash": fields.String,
        "prev_hash": fields.String,
        "tx_count": fields.Integer,
        "save_time": fields.String,
    })),
    "total": fields.Integer,
    "page_size": fields.Integer,
    "page_num": fields.Integer,
    "has_more": fields.Boolean
}

blockchain_contract_fields = {
    "name": fields.String,
    "version": fields.String,
    "description": fields.String,
    "language": fields.String,
    "path": fields.String,
    "source": fields.String,
    "bytecode": fields.String,
    "abi": fields.String,
    # "events": fields.List(fields.Nested()),
    # "functions": fields.List(fields.Nested()),
    # "constructor": fields.Nested(),
}

blockchain_fields = {
    "enabled": fields.Boolean,
    "name": fields.String,
    "organization": fields.String,
    "address": fields.String,
    "alias": fields.String,
    "channel": fields.String,
    "network": fields.String,
    "chain_code": fields.String,
    "contract": fields.String,
    "mspid": fields.String,
    "orderer": fields.String,
    "node_name": fields.String,
    "node_url": fields.String,
    "node_amount": fields.String,
    "block_height": fields.String,
    "node_list": fields.List(fields.Nested(blockchain_node_fields)),
    "block_list": fields.List(fields.Nested(blockchain_block_fields)),
    "contract_list": fields.List(fields.Nested(blockchain_contract_fields)),
    "created_at": TimestampField,
    "updated_at": TimestampField,
}