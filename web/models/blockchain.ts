import type { I18nText } from '@/i18n/language'

interface options {
    name: string  // name: I18nText
    value: string
}

export interface BlockchainConfig {
    enabled: boolean
    name?: string
    organization?: string
    address?: string
    alias?: string
    mspid?: string
    network?: string
    channel?: string
    chain_code?: string
    chaincode_amount?: number
    contract?: string
    node_name?: string
    node_url?: string
    node_amount?: number
    block_height?: string
    node_list?: BlockchainNode[]
    chain_list?: string[]
    block_list?: string[]
    contract_list?: string[]
    node_options?: options[]
    network_options?: options[]
    contract_options?: options[]
}

export interface BlockchainNode {
    orgName: string
    peerName: string
    mspID: string
    url: string
    status?: string
}


export interface BlockchainNodeData {
    id?: string
    address?: string
    port?: number
    chaincode: string
    channel: string
    network?: string
    date?: string
    nodesCount: number
    orgCount: number
    nodes?: BlockchainNode[]
}

export interface BlockchainBlock {
    block_num: number;
    block_hash: string;
    data_hash: string;
    prev_hash: string;
    tx_count: number;
    save_time: string;
}

export interface BlockchainBlockData {
    page_num: number;
    page_size: number;
    total: number;
    blocks: BlockchainBlock[];
    has_more: boolean;
}

