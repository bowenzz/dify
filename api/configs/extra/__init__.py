from configs.extra.notion_config import NotionConfig
from configs.extra.sentry_config import SentryConfig
from configs.extra.blockchain_config import BlockchainConfig

class ExtraServiceConfig(
    # place the configs in alphabet order
    BlockchainConfig,
    NotionConfig,
    SentryConfig,
):
    pass
