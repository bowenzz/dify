from typing import Optional

from pydantic import Field,PositiveInt
from pydantic_settings import BaseSettings


class BlockchainConfig(BaseSettings):
    """
    Configuration settings for Blockchain
    """
    BLOCKCHAIN_NAME: str = Field(
        description="Blockchain name",
        default="",
    )

    BLOCKCHAIN_ORGANIZATION: str = Field(
        description="Blockchain organization",
        default="",
    )

    BLOCKCHAIN_ORGID: str = Field(
        description="Blockchain organization ID",
        default="",
    )

    BLOCKCHAIN_ADDRESS: str = Field(
        description="Blockchain address",
        default="",
    )

    BLOCKCHAIN_ALIAS: Optional[str] = Field(
        description="Blockchain alias",
        default="",
    )

    BLOCKCHAIN_CHANNEL: str = Field(
        description="Blockchain channel",
        default="",
    )

    BLOCKCHAIN_CONTRACT: str = Field(
        description="Blockchain contract",
        default="",
    )

    BLOCKCHAIN_NETWORK: Optional[str] = Field(
        description="Blockchain network",
        default=None,
    )

    BLOCKCHAIN_USERNAME: Optional[str] = Field(
        description="Blockchain version",
        default=None,
    )

    BLOCKCHAIN_SIGNATURE: Optional[str] = Field(
        description="Blockchain signing secret",
        default=None,
    )

    BLOCKCHAIN_DATADIR: str = Field(
        description="Blockchain data directory",
        default="/app/api/storage",
    )

    BLOCKCHAIN_BASEAPI: str = Field(
        description="Blockchain base API",
        default="http://localhost:8888/api",
    )

    BLOCKCHAIN_WORKTIME: PositiveInt = Field(
        description="Blockchain work time",
        default=5,
    )

    BLOCKCHAIN_EXTRA: Optional[str] = Field(
        description="Blockchain extra param",
        default=None,
    )

