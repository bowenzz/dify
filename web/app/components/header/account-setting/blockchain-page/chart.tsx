import React, { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import Loading from "@/app/components/base/loading";
import Chart from "@/app/components/app/overview/appChart";
import type { PeriodParams } from "@/app/components/app/overview/appChart";
import { fetchBlockchainBlockList } from "@/service/blockchain";
import dayjs from 'dayjs';
import { BlockchainBlockData, BlockchainNode } from "@/models/blockchain";

const commonDateFormat = 'MMM D, YYYY';
const defaultPeriod = {
  start: dayjs().subtract(7, 'day').format(commonDateFormat),
  end: dayjs().format(commonDateFormat),
};

const getDefaultChartData = ({ start, end }: { start: string; end: string }) => {
  const diffDays = dayjs(end).diff(dayjs(start), 'day');
  return Array.from({ length: diffDays || 1 }, (_, index) => ({
    date: dayjs(start).add(index, 'day').format(commonDateFormat),
    count: 0
  }));
};

type ChartProps = {
  period?: PeriodParams;
  nodeData: BlockchainNode[];
};

const processNodeData = (nodeData: BlockchainNode[], days: number) => {
  // 创建一个包含最近days天的数据数组
  const processedData = Array(days).fill(null).map((_, index) => {
    const date = dayjs().subtract(days - 1 - index, 'day').format(commonDateFormat);
    const isToday = index === days - 1; // 检查是否是最后一天（今天）
    return {
      date,
      count: isToday ? nodeData.length : 0 // 只在今天显示节点数量
    };
  });

  return processedData;
};

const processBlockData = (blockData: BlockchainBlockData) => {
  if (!blockData?.blocks?.length) {
    return [];
  }

  // 按日期分组统计区块数据
  const blocksByDate = blockData.blocks.reduce((acc, block) => {
    // 使用 dayjs 处理 ISO 格式的时间字符串
    const date = dayjs(block.save_time).format(commonDateFormat);

    if (!acc[date]) {
      acc[date] = {
        count: 0,
        blocks: 0
      };
    }
    acc[date].count = Math.max(acc[date].count, block.block_num); // 使用最大区块号
    acc[date].blocks += 1; // 统计每天的区块数量
    return acc;
  }, {} as Record<string, { count: number; blocks: number }>);

  // 转换为图表数据格式并按日期排序
  return Object.entries(blocksByDate)
    .map(([date, stats]) => ({
      date,
      count: stats.count,
      blocks: stats.blocks
    }))
    .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
};

export const BlockChart: FC<ChartProps> = ({
  period,
  nodeData,
}) => {
  const { t } = useTranslation();
  const { data: blockResponse, error: blockError, isLoading } = useSWR<BlockchainBlockData>(
    '/blockchain/blocks',
    fetchBlockchainBlockList
  )
  // if (isLoading || !response)
  //   return <Loading />

  const chartData = useMemo(() => {
    // 根据period参数或默认值确定天数
    const days = period?.query
      ? dayjs(period.query.end).diff(dayjs(period.query.start), 'day') + 1
      : 7;

    return {
      data: processNodeData(nodeData, days),
      tooltipExtra: (item: any) => ({
        '节点数量': item.count
      })
    };
  }, [nodeData, period]);

  const blockChartData = useMemo(() => {
    if (blockResponse && blockResponse.blocks) {
      const processedData = processBlockData(blockResponse);
      if (processedData.length > 0) {
        return {
          data: processedData,
          tooltipExtra: (item: any) => ({
            '区块数量': item.blocks
          })
        };
      }
    }
    return {
      data: getDefaultChartData(period?.query ?? defaultPeriod),
      tooltipExtra: () => ({})
    };
  }, [blockResponse, period]);

  const noDataFlag = isLoading || blockError || !chartData.data || chartData.data.length === 0;

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className='flex flex-row items-center mt-8 mb-4 system-xl-semibold text-text-primary'>
        <span className='mr-3'>{t('common.blockchain.chart.title')}</span>
      </div>

      <Chart
        basicInfo={{
          title: t('common.blockchain.chart.node_amount'),
          explanation: t('common.blockchain.chart.explanation'),
          timePeriod: period?.name ?? 'Last 7 days'
        }}
        chartData={chartData}
        chartType='endUsers'
        {...(noDataFlag && { yMax: 500 })}
      />

      <Chart
        basicInfo={{
          title: t('common.blockchain.chart.block_height'),
          explanation: t('common.blockchain.chart.block_explanation'),
          timePeriod: period?.name ?? 'Last 7 days'
        }}
        chartData={blockChartData}
        chartType='conversations'
        {...(noDataFlag && { yMax: 500 })}
      />
    </div>
  );
};
