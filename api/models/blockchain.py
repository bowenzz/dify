from sqlalchemy import func

from .engine import db
from .types import StringUUID

class BlockChain(db.Model):
    __tablename__ = "block_chain"
    __table_args__ = (
        db.PrimaryKeyConstraint("id", name="blockchain_pkey"),
    )
    id = db.Column(StringUUID, server_default=db.text("uuid_generate_v4()"))
    app_id = db.Column(StringUUID, nullable=False)
    organization = db.Column(StringUUID, nullable=True)
    name = db.Column(db.Text, nullable=False)
    address = db.Column(db.Text, nullable=True)
    user = db.Column(db.Text, nullable=True)
    password = db.Column(db.Text, nullable=True)
    alias = db.Column(db.Text, nullable=True)
    channel = db.Column(db.Text, nullable=True)
    chain_code = db.Column(db.Text, nullable=True)
    contract = db.Column(db.Text, nullable=True)
    mspid = db.Column(db.Text, nullable=True)
    private_key = db.Column(db.Text, nullable=True)
    signed_cert = db.Column(db.Text, nullable=True)
    orderer = db.Column(db.Text, nullable=True)
    ca = db.Column(db.Text, nullable=True)
    node_name = db.Column(db.Text, nullable=True)
    node_amount = db.Column(db.Text, nullable=True)
    node_url = db.Column(db.Text, nullable=True)
    node_owner = db.Column(db.Text, nullable=True)
    block_height = db.Column(db.Integer, nullable=True)
    chain_amount = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, server_default=func.current_timestamp())
    updated_at = db.Column(db.DateTime, nullable=False, server_default=func.current_timestamp())