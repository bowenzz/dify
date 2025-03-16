import { useTranslation } from 'react-i18next'
import useSWR from 'swr'
import Item from './item'
import Empty from './empty'
import Base from './base'
import Config from './config'
import { useModalContext } from '@/context/modal-context'
import {fetchBlockchainConfig, fetchBlockchainNodeList} from '@/service/blockchain'
import { useToastContext } from '@/app/components/base/toast'
import { BlockChart } from "./chart";

const BlockchainPage = () => {
  const { t } = useTranslation()
  const { data, mutate, isLoading } = useSWR(
    '/blockchain/config',
    fetchBlockchainConfig,
  )
  const { notify } = useToastContext()

  const handleOpenBlockchainPageModal = () => {
    // setShowApiBasedExtensionModal({
    //   payload: {},
    //   onSaveCallback: () => mutate(),
    // })
    notify({ type: 'error', message: t('common.blockchain.status.disabled') })
  }
  const hasNodes = !isLoading && data?.node_list?.length > 0

  return (
    <div>
      <Empty />
      {/*<Base />*/}
      <Config
        data = {data}
        onUpdate={() => mutate()}
      />
      <BlockChart
        nodeData={data?.node_list || []}
      />
      {
        hasNodes && (
          <Item
            data={data.node_list}
            onUpdate={() => mutate()}
          />
        )
      }
      <div className='flex items-center justify-center px-3 h-8 text-[13px] font-medium text-gray-700 rounded-lg bg-gray-50 cursor-pointer'>
        {/*onClick={handleOpenBlockchainPageModal}*/}
        {/*<RiAddLine className='mr-2 w-4 h-4' />*/}
        {/*{t('common.blockchain.add')}*/}

      </div>
    </div>
  )
}

export default BlockchainPage
