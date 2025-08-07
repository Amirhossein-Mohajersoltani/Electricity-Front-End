import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import type {
  ResultItem,
  ApiData,
  FilterData,
  MultiFilterEnergyChartProps,
  
} from "@/types/chartInterfaces";
// ... (Constants and Interfaces remain unchanged) ...
const DATA_KEYS = {
  ENERGETIC: 'energetic',
  FIDDER_CODE: 'fidder code',
  KEY_PREFIX: 'فیدر',
} as const;

const MESSAGES = {
  LOADING: 'در حال بارگذاری داده‌ها...',
  NO_DATA: 'داده‌ای برای نمایش موجود نیست',
  TOTAL_ENERGY: 'مجموع کل توان',
} as const;




// ✅ 1. فیلتر مقادیر صفر از این تابع حذف شد
const processChartData = (multiData: Record<string, ApiData>, filters: FilterData[]) => {
  const dataMap = new Map<string, Record<string, any>>();

  filters.forEach((filter) => {
    const result = multiData[filter.id]?.data?.energy_comparison?.result;
    if (!result) return;

    // The .filter() call that removed zero values is now gone.
    const chartData = result.map((item: ResultItem) => ({
      key: `${DATA_KEYS.KEY_PREFIX} ${item[DATA_KEYS.FIDDER_CODE]} - دوره ${item.period_num}`,
      feederCode: item[DATA_KEYS.FIDDER_CODE],
      periodNum: item.period_num,
      periodStart: item.period_start,
      periodEnd: item.period_end,
      value: item[DATA_KEYS.ENERGETIC],
    }));

    chartData.forEach((item) => {
      const key = item.key;
      if (!dataMap.has(key)) {
        dataMap.set(key, {
          key,
          feederCode: item.feederCode,
          periodNum: item.periodNum,
          periodStart: item.periodStart,
          periodEnd: item.periodEnd,
        });
      }
      dataMap.get(key)![filter.id] = item.value;
    });
  });

  return Array.from(dataMap.values()).sort((a, b) => {
    if (a.feederCode !== b.feederCode) {
      return a.feederCode - b.feederCode;
    }
    return a.periodNum - b.periodNum;
  });
};

const LoadingState: React.FC = () => (
 <div className="flex h-64 items-center justify-center">
  <div className="text-center">
  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
  <p className="mt-4 text-gray-600">{MESSAGES.LOADING}</p>
  </div>
 </div>
);

const EmptyState: React.FC = () => (
 <div className="flex h-64 items-center justify-center">
  <p className="text-gray-500">{MESSAGES.NO_DATA}</p>
 </div>
);


const MultiFilterEnergyChart: React.FC<MultiFilterEnergyChartProps> = ({
  multiData,
  filters,
  loading = false,
  title = 'مقایسه انرژی چندگانه',
}) => {
  const { companyType } = useAuth();
  const energyUnit = companyType === 'private' ? 'KW' : 'MW';

  const chartData = useMemo(() => processChartData(multiData, filters), [multiData, filters]);

  if (loading) return <LoadingState />;
  if (chartData.length === 0) return <EmptyState />;

  return (
    <div className="w-full space-y-6">
      {/* Chart Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {/* ✅ 2. عبارت "فقط مقادیر غیر صفر" از اینجا حذف شد */}
        <p className="text-sm text-gray-600">
          مقایسه انرژی {filters.length} فیلتر مختلف
        </p>
      </div>

      {/* Chart */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="key"
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{
                value: `انرژی (${energyUnit})`,
                angle: -90,
                position: 'insideLeft',
              }}
            />
            <Brush dataKey="key" height={30} stroke="#8884d8" />
            <Tooltip
              formatter={(value: number, name: string) => {
                const filter = filters.find((f) => f.id === name);
                return [
                  `${value.toLocaleString()} ${energyUnit}`,
                  filter?.name || name,
                ];
              }}
              labelFormatter={(label) => `${label}`}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            <Legend
              formatter={(value: string) => {
                const filter = filters.find((f) => f.id === value);
                return filter?.name || value;
              }}
            />
            {filters.map((filter) => (
              <Bar
                key={filter.id}
                dataKey={filter.id}
                fill={filter.color}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Statistics (Unchanged) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filters.map((filter) => {
          const result = multiData[filter.id]?.data?.energy_comparison?.result;
          if (!result) return null;

          const totalEnergy = result.reduce(
            (sum: number, item: ResultItem) => sum + (item[DATA_KEYS.ENERGETIC] || 0),
            0,
          );

          const nonZeroCount = result.filter(
            (item: ResultItem) => item[DATA_KEYS.ENERGETIC] > 0
          ).length;

          return (
            <div
              key={filter.id}
              className="rounded-lg border bg-gray-50 p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: filter.color }}
                />
                <span className="text-sm font-semibold text-gray-800">
                  {filter.name}
                </span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {totalEnergy.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                {energyUnit}
              </p>
              <p className="text-xs text-gray-500">{MESSAGES.TOTAL_ENERGY}</p>
               <p className="text-xs text-gray-400 mt-1">
                {nonZeroCount} مورد با مقدار غیر صفر
               </p>
            </div>
          );
        })}
      </div>

       {/* Data Details (Unchanged) */}
       <div className="mt-6 rounded-lg bg-gray-50 p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">جزئیات داده‌ها:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-gray-600">
          {chartData.map((item, index) => (
            <div key={index} className="bg-white p-3 rounded-lg border shadow-sm">
              <div className="mb-2 border-b pb-2">
                <div className="font-bold text-gray-700">دوره {item.periodNum}</div>
              </div>
              <div className="mb-2 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">تاریخ شروع:</span>
                  <span className="font-medium">{item.periodStart}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">تاریخ پایان:</span>
                  <span className="font-medium">{item.periodEnd}</span>
                </div>
              </div>
              <div className="space-y-1">
                {filters.map((filter) => {
                  const value = item[filter.id];
                  // Show the value even if it is 0
                  if (typeof value === 'number') {
                    return (
                      <div key={filter.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: filter.color }}
                          />
                          <span>{filter.name}:</span>
                        </div>
                        <span className="font-bold" style={{ color: filter.color }}>
                          {value.toLocaleString()} {energyUnit}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MultiFilterEnergyChart);