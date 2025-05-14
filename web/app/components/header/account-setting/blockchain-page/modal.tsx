import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from '@/app/components/base/modal'
import Button from '@/app/components/base/button'
import type { BlockLicense } from '@/models/blockchain'
// 标题图标
const TitleIcon = () => <span className="mr-2">📄</span>

type ShowLicenseModalProps = {
  data: BlockLicense
  onCancel: () => void
}

const ShowLicenseModal: FC<ShowLicenseModalProps> = ({
  data,
  onCancel,
}) => {
  const { t } = useTranslation()

  return (
    <Modal
      isShow
      onClose={onCancel}
      className='!p-4 !pb-4 !max-w-none !w-[400px]'
    >
      <div className='mb-2 text-xl font-semibold text-text-primary flex items-center'>
        <TitleIcon />
        {data.title}
      </div>

      <div className='space-y-4'>
        {/* 基本信息 */}
        <div className='p-4 bg-gray-50 rounded-lg'>
          <div className='text-sm text-gray-500 mb-2'>{t('common.blockchain.license.description')}</div>
          <div className='text-text-primary'>{data.content}</div>
        </div>

        {/* 授权详情 */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-xs text-gray-500'>{t('common.blockchain.license.authorizedUser')}</span>
            <span className='text-sm font-medium'>{data.authorized || 'N/A'}</span>
          </div>

          <div className='flex items-center justify-between'>
            <span className='text-xs text-gray-500'>{t('common.blockchain.license.expire')}</span>
            <span className='text-sm font-medium'>{data.expire ? data.expire : t('common.blockchain.license.perpetual')}</span>
          </div>

          <div className='flex items-center justify-between'>
            <span className='text-xs text-gray-500'>{t('common.blockchain.license.update')}</span>
            <span className='text-sm font-medium'>{data.updated || 'N/A'}</span>
          </div>

          <div className='flex items-center justify-between'>
            <span className='text-xs text-gray-500'>{t('common.blockchain.license.max_num')}</span>
            <span className='text-sm font-medium'>{data.max_num || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className='flex items-center justify-end mt-6'>
        <Button
          onClick={onCancel}
          className='mr-2'
        >
          {t('common.operation.close')}
        </Button>
      </div>
    </Modal>
  )
}

export default ShowLicenseModal
