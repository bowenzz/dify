import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/base/card";
import { Button } from "@/app/components/base/button";
import { SimpleSelect } from '@/app/components/base/select'
import Switch from '@/app/components/base/switch'
import Indicator from "@/app/components/header/indicator";
import {useTranslation} from "react-i18next";

import {updateBlockchainConfig, updateBlockchainStatus} from "@/service/blockchain";
import {asyncRunSafe} from "@/utils";
import {BlockchainConfig, BlockchainNodeData} from '@/models/blockchain';

const defaultConfig = {
  enabled: true,
  name: "XZHMU",
  alias: "联盟链",
  address: "192.168.1.5",
  contract: "xzhmu_contract_v1",
  network: "Mainnet",
  mspid: "Org1MSP",
  organization: "hospital",
  channel: "myChannel",
  node_name: "peer1",
};

const contractOptions = [
  { value: "xzhmu_contract_v1", name: "徐州医科大学自研协议" },
];

const networkOptions = [
  { value: "main", name: "Mainnet" },
  { value: "test", name: "Testnet" },
  { value: "dev", name: "Devnet" },
];

const channelOptions = [
  { value: "mychannel", name: "加密通道" },
]

const nodeNameOptions = [
  { value: "Org1", name: "Producer Node" },
  { value: "Org2", name: "Supervisor Node" },
  { value: "Org3", name: "Customer Node" },
];

type ConfigProps = {
  data?: BlockchainConfig
  onUpdate: () => void
}

export default function BlockchainConfigDisplay({ data, onUpdate }: ConfigProps) {
  const { register, handleSubmit, setValue, watch } = useForm({ defaultValues: data || defaultConfig });
  const [config, setConfig] = useState(data || defaultConfig);
  const [isConnected, setIsConnected] = useState(data?.enabled ?? true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const { t } = useTranslation()

  useEffect(() => {
    if (data) {
      setConfig(data);
      setIsConnected(data.enabled);
    }
  }, [data]);

  const handleCallbackResult = (err: Error | null, enable:boolean, message?: string) => {
    const type = err ? 'error' : 'success'
    message ||= (type === 'success' ? 'modifiedSuccessfully' : 'modifiedUnsuccessfully')
    if (type === 'success') {
      setIsConnected(enable);
      onUpdate();
    }
  }

  const onSubmit = (formData:any) => {
    setConfig({ ...config, ...formData });
    setIsSubmitEnabled(false);
    setIsEditing(false);
    asyncRunSafe(
      updateBlockchainConfig({
        url: `/blockchain/config`,
        body: formData,
      }) as Promise<BlockchainConfig>,
    ).then(([err]) => handleCallbackResult(err, true))
  };

  const onChangeBlockchainStatus = async (value: boolean) => {
    const [err] = await asyncRunSafe<BlockchainConfig>(
      updateBlockchainStatus({
        url: `/blockchain/status`,
        body: { blockchain_enable: value },
      }) as Promise<BlockchainConfig>,
    )
    handleCallbackResult(err, value)
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card>
        <div className='flex justify-between items-center'>
          <CardHeader>
            <div className='flex items-center gap-3 self-stretch w-full'>
              <div className="text-2xl font-bold">
                <CardTitle>{t('common.blockchain.config.title')}</CardTitle>
              </div>
              <div className='flex items-center gap-1 text-4xl'>
                <Indicator color={isConnected ? 'green' : 'yellow'}/>
                <div
                  className={`${isConnected ? 'text-text-success' : 'text-text-warning'} system-xs-semibold-uppercase`}>
                  {isConnected
                    ? t('common.blockchain.status.active')
                    : t('common.blockchain.status.invalid')}
                </div>
              </div>
            </div>
          </CardHeader>
        </div>

        {isConnected && (
          <div className="p-6 space-y-6 text-lg bg-gray-50 rounded-xl shadow-sm">
            <CardContent>
              <div className="grid grid-cols-2 gap-y-4">
                <p><strong className="text-gray-700">{t('common.blockchain.config.name')}:</strong> {config.alias}</p>
                <p><strong className="text-gray-700">{t('common.blockchain.config.address')}:</strong> {config.address}</p>
                <p><strong className="text-gray-700">{t('common.blockchain.config.organization')}:</strong> {config.organization}</p>
                <p><strong className="text-gray-700">{t('common.blockchain.config.node_type')}:</strong> {nodeNameOptions.find(option => option.value === config.name)?.name || config.name}</p>
                <p><strong className="text-gray-700">{t('common.blockchain.config.contract')}:</strong> {contractOptions.find(option => option.value === config.contract)?.name || config.contract}</p>
                <p><strong className="text-gray-700">{t('common.blockchain.config.channel')}:</strong> {channelOptions.find(option => option.value === config.channel)?.name || config.channel}</p>
                <p><strong className="text-gray-700">{t('common.blockchain.config.network')}:</strong> {networkOptions.find(option => option.value === config.network)?.name || config.network}</p>
              </div>
              <div className="flex justify-center">
                <Button className="rounded-lg mt-4" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? t('common.blockchain.config.close_edit') : t('common.blockchain.config.edit_config')}
                </Button>
              </div>
            </CardContent>
          </div>
        )}
      </Card>

      {isConnected && isEditing && (
        <div className="text-lg font-semibold mb-4">
          <Card>
            <CardHeader>
              <div className="text-xl font-semibold">
                <CardTitle>{t('common.blockchain.config.edit_config')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <label className="block font-semibold">{t('common.blockchain.config.contract')}:</label>
                <SimpleSelect
                  wrapperClassName="w-full"
                  items={contractOptions}
                  defaultValue={config.contract}
                  onSelect={item => { setValue("contract", item.name); setIsSubmitEnabled(true); }}
                  notClearable
                />

                <label className="block font-semibold">{t('common.blockchain.config.network')}:</label>
                <SimpleSelect
                  wrapperClassName="w-full"
                  items={networkOptions}
                  defaultValue={config.network}
                  onSelect={item => { setValue("network", item.name); setIsSubmitEnabled(true); }}
                  notClearable
                />

                <label className="block font-semibold">{t('common.blockchain.config.channel')}:</label>
                <SimpleSelect
                  wrapperClassName="w-full"
                  items={channelOptions}
                  defaultValue={config.channel}
                  onSelect={item => { setValue("channel", item.name); setIsSubmitEnabled(true); }}
                  notClearable
                />

                <label className="block font-semibold">{t('common.blockchain.config.node_type')}:</label>
                <SimpleSelect
                  wrapperClassName="w-full"
                  items={nodeNameOptions}
                  defaultValue={config.name}
                  onSelect={item => { setValue("node_name", item.name); setIsSubmitEnabled(true); }}
                  notClearable
                />

                <div className="flex justify-end mt-4">
                  <Button type="submit" disabled={!isSubmitEnabled}>{t('common.blockchain.config.update')}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
