import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/base/card";
import { Button } from "@/app/components/base/button";
import { SimpleSelect } from '@/app/components/base/select'
import Switch from '@/app/components/base/switch'
import Indicator from "@/app/components/header/indicator";
import {useTranslation} from "react-i18next";
import useSWR from "swr";
import {fetchBlockchainConfig, updateBlockchainConfig, updateBlockchainStatus} from "@/service/blockchain";
import {asyncRunSafe} from "@/utils";
import type {BlockchainConfig} from '@/models/blockchain';

const defaultConfig = {
  ip: "192.168.1.1",
  port: "8545",
  contract: "DPoS",
  network: "Mainnet",
  node_name: "Full Node",
};

const contractOptions = [
  { value: "PoW", name: "徐州医科大学自研协议v1" },
  { value: "PoS", name: "徐州医科大学自研协议v2" },
  { value: "DPoS", name: "徐州医科大学自研协议v3" },
];

const networkOptions = [
  { value: "Mainnet", name: "Mainnet" },
  { value: "Testnet", name: "Testnet" },
  { value: "Devnet", name: "Devnet" },
];

const nodeNameOptions = [
  { value: "Full Node", name: "Full Node" },
  { value: "Light Node", name: "Light Node" },
  { value: "Archive Node", name: "Archive Node" },
];

const mockNodes = [
  { id: 1, ip: "192.168.1.2", port: "30303", status: "Active" },
  { id: 2, ip: "192.168.1.3", port: "30304", status: "Active" },
  { id: 3, ip: "192.168.1.4", port: "30305", status: "Active" },
];

export default function BlockchainConfigDisplay() {
  const { register, handleSubmit, setValue, watch } = useForm({ defaultValues: defaultConfig });
  const [config, setConfig] = useState(defaultConfig);
  const [isConnected, setIsConnected] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const { t } = useTranslation()
  const { data, mutate, isLoading } = useSWR(
    '/blockchain/config',
    fetchBlockchainConfig,
    {
      onSuccess: (data) => {
        setIsConnected(data?.enabled || false)
        setConfig({...data, ...config})
      },
    },
  )

  const handleCallbackResult = (err: Error | null, enable:boolean, message?: string) => {
    const type = err ? 'error' : 'success'
    message ||= (type === 'success' ? 'modifiedSuccessfully' : 'modifiedUnsuccessfully')
    if (type === 'success')
      setIsConnected(enable)
  }

  const onSubmit = (data:any) => {
    setConfig({ ...config, ...data });
    setIsSubmitEnabled(false);
    setIsEditing(false);
    // 可以在这里调用 mutate 来刷新数据，如果需要的话
    // mutate();
    // asyncRunSafe(
    //   updateBlockchainConfig({
    //     url: `/blockchain/config`,
    //     body: data,
    //   }) as Promise<BlockchainConfig>,
    // ).then(([err]) => handleCallbackResult(err, true))
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
              <Switch defaultValue={isConnected} onChange={onChangeBlockchainStatus}/>
              <div className='flex items-center gap-1'>
                <Indicator color={isConnected ? 'green' : 'yellow'}/>
                <div
                  className={`${isConnected ? 'text-text-success' : 'text-text-warning'} system-xs-semibold-uppercase`}>
                  {isConnected
                    ? t('common.blockchain.status.enable')
                    : t('common.blockchain.status.disable')}
                </div>
              </div>
            </div>
          </CardHeader>
        </div>

        {isConnected && (
          <div className="p-6 space-y-6 text-lg bg-gray-50 rounded-xl shadow-sm">
            <CardContent>
              <div className="grid grid-cols-2 gap-y-4">
                <p><strong className="text-gray-700">{t('common.blockchain.config.address')}:</strong> {config.ip}</p>
                <p><strong className="text-gray-700">{t('common.blockchain.config.port')}:</strong> {config.port}</p>
                <p><strong className="text-gray-700">{t('common.blockchain.config.contract')}:</strong> {contractOptions.find(option => option.value === config.contract)?.name || config.contract}</p>
                <p><strong className="text-gray-700">{t('common.blockchain.config.net_type')}:</strong> {config.network}</p>
                <p><strong className="text-gray-700">{t('common.blockchain.config.node_type')}:</strong> {config.node_name}</p>
              </div>
              <div className="flex justify-center">
                <Button className="px-6 py-2 text-base rounded-lg" onClick={() => setIsEditing(!isEditing)}>
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
                <label className="block font-semibold">{t('common.blockchain.config.consensus')}:</label>
                <SimpleSelect
                  wrapperClassName="w-full"
                  items={contractOptions}
                  defaultValue={config.contract}
                  onSelect={item => { setValue("contract", item.name); setIsSubmitEnabled(true); }}
                  notClearable
                />

                <label className="block font-semibold">{t('common.blockchain.config.net_type')}:</label>
                <SimpleSelect
                  wrapperClassName="w-full"
                  items={networkOptions}
                  defaultValue={config.network}
                  onSelect={item => { setValue("network", item.name); setIsSubmitEnabled(true); }}
                  notClearable
                />

                <label className="block font-semibold">{t('common.blockchain.config.node_type')}:</label>
                <SimpleSelect
                  wrapperClassName="w-full"
                  items={nodeNameOptions}
                  defaultValue={config.node_name}
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
      {isConnected && (
        <div className="text-lg font-semibold mb-4">
          <Card>
            <CardHeader>
              <div className="text-xl font-semibold">
                <CardTitle>{t('common.blockchain.node.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {mockNodes.map((node) => (
                  <li key={node.id} className="p-3 border rounded-lg bg-gray-50">
                    <p><strong>{t('common.blockchain.node.address')}: </strong> {node.ip}</p>
                    <p><strong>{t('common.blockchain.node.port')}: </strong> {node.port}</p>
                    <p><strong>{t('common.blockchain.node.status')}: </strong>
                      <span className={node.status === "Active" ? "text-green-600" : "text-red-600"}>
                        {node.status==="Active"? t('common.blockchain.status.active'): t('common.blockchain.status.invalid')}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
