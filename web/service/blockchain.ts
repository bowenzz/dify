import type { Fetcher } from 'swr'
import { del, get, patch, post, put } from './base'
import type { BlockchainConfig, BlockchainNodeData,BlockchainBlockData } from '@/models/blockchain'
import type {AppDetailResponse} from "@/models/app";


export const fetchBlockchainConfig: Fetcher<BlockchainConfig, string> = (url) => {
    return get(url) as Promise<BlockchainConfig>
}

export const updateBlockchainConfig: Fetcher<BlockchainConfig, {url:string; body: BlockchainConfig}> = ({url, body}) => {
    return post(url, {body}) as Promise<BlockchainConfig>
}

export const fetchBlockchainNodeList: Fetcher<BlockchainNodeData[], string> = (url) => {
    return get(url) as Promise<BlockchainNodeData[]>
}

export const fetchBlockchainBlockList: Fetcher<BlockchainBlockData, string> = (url) => {
    return get(url) as Promise<BlockchainBlockData>
}

export const updateBlockchainStatus: Fetcher<BlockchainConfig, { url: string; body: Record<string, any> }> = ({ url, body }) => {
    return post<BlockchainConfig>(url, { body })
}
