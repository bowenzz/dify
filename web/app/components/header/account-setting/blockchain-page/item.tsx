import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import {BlockchainNodeData} from "@/models/blockchain";
import {Card, CardContent, CardHeader, CardTitle} from "@/app/components/base/card";

type ItemProps = {
  data?: BlockchainNodeData[]
  onUpdate: () => void
}

const mockNodes = [
  { id: 1, address: "192.168.1.2", port: "30303", status: "Active" },
  { id: 2, address: "192.168.1.3", port: "30304", status: "Active" },
  { id: 3, address: "192.168.1.4", port: "30305", status: "Active" },
];

const Item: FC<ItemProps> = ({
  data,
  onUpdate,
}) => {
  const { t } = useTranslation()
  const nodes = data && data.length > 0 ? data : mockNodes

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="text-xl font-semibold">
            <CardTitle>{t('common.blockchain.node.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>

          <ul className="space-y-6">
            {nodes.map((node) => (
              <li key={node.id} className="p-3 border rounded-lg bg-gray-50 text-xl">
                <p><strong className="text-gray-700">{t('common.blockchain.node.orgName')}: </strong> {node.orgName}</p>
                <p><strong className="text-gray-700">{t('common.blockchain.node.address')}: </strong> {node.url}</p>
                <p><strong className="text-gray-700">{t('common.blockchain.node.mspID')}: </strong> {node.mspID}</p>
                <p><strong className="text-gray-700">{t('common.blockchain.node.peerName')}: </strong> {node.peerName}</p>
                <p><strong className="text-gray-700">{t('common.blockchain.node.status')}: </strong>
                  <span className={node.status === "Active" ? "text-green-600" : "text-red-600"}>
                        {node.status === "Active" ? t('common.blockchain.status.active') : t('common.blockchain.status.invalid')}</span>
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default Item
