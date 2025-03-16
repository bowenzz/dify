'use client'

import {useTranslation} from 'react-i18next'
import {useProviderContextSelector} from '@/context/provider-context'
import Indicator from "@/app/components/header/indicator";
import React from "react";

const headerEnvClassName: { [k: string]: string } = {
  ONCHAIN: 'border-[#32CD32] text-[#32CD32]',
  OFFCHAIN: 'border-[#A5A5A5] text-[#949494]',
}

const ChainNav = () => {
  const { t } = useTranslation()
  const blockchainEnabled = useProviderContextSelector(state => state.blockchainEnabled)
  if (blockchainEnabled === null)
    return null

  return (
    <div className={`
      flex items-center h-[30px] mr-4 rounded-md px-2 text-xs font-medium border
      ${blockchainEnabled ? headerEnvClassName['ONCHAIN'] : headerEnvClassName['OFFCHAIN']}
    `}>
      {
        blockchainEnabled && (
          <>
            <Indicator className='w-3 h-3 mr-1' color='green' />
            {t('common.environment.onchain')}
          </>
        )
      }
      {
        !blockchainEnabled && (
          <>
            <Indicator className='w-3 h-3 mr-1' color='gray' />
            {t('common.environment.offchain')}
          </>
        )
      }
    </div>
  )
}

export default ChainNav
