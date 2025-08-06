// EnergyComparisonChart.tsx
import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Brush
} from "recharts";
import { Maximize2 } from 'lucide-react';

import type { EnergyComparisonChartProps,ChartDataPoint } from '@/types/chartInterfaces';

// Default test data based on your API sample
const DEFAULT_DATA: ChartDataPoint[] = [
  { name: 'فیدر 28 - سال 1401', value: 4106.3, year: 1401, feeder: 28 },
  { name: 'فیدر 66 - سال 1401', value: 9066.2, year: 1401, feeder: 66 },
  { name: 'فیدر 76 - سال 1401', value: 2572.6, year: 1401, feeder: 76 },
  { name: 'فیدر 28 - سال 1402', value: 3850.1, year: 1402, feeder: 28 },
  { name: 'فیدر 66 - سال 1402', value: 8200.5, year: 1402, feeder: 66 },
  { name: 'فیدر 76 - سال 1402', value: 2100.8, year: 1402, feeder: 76 }
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    color: string;
    payload: ChartDataPoint;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg">
        <p className="text-sm font-medium">{`${label}`}</p>
        {payload.map((entry, entryIndex) => (
          <div key={entryIndex} className="text-sm" style={{ color: entry.color }}>
            <p>{`مصرف انرژی: ${entry.value?.toLocaleString()} کیلووات ساعت`}</p>
            {entry.payload?.year && <p>{`سال: ${entry.payload.year}`}</p>}
            {entry.payload?.feeder && <p>{`فیدر: ${entry.payload.feeder}`}</p>}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function EnergyComparisonChart({ data, onMaximize }: EnergyComparisonChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>(DEFAULT_DATA);

  useEffect(() => {
    if (data && data.energy_comparison && data.energy_comparison.result) {
      const resultData = data.energy_comparison.result || [];
      const validEntries = resultData.filter((item) => item.energetic && item.energetic > 0);

      if (validEntries.length > 0) {
        const processedData = validEntries.map((item) => ({
          name: `فیدر ${item.num_fidder} - سال ${item.year}`,
          value: Math.round(item.energetic * 10) / 10,
          year: item.year,
          feeder: item.num_fidder
        }));
        setChartData(processedData);
        return;
      }
    }
    setChartData(DEFAULT_DATA);
  }, [data]);

  return (
    <div className="w-full h-64 relative group">
      {onMaximize && (
        <button
          onClick={onMaximize}
          className="absolute top-2 right-2 z-20 p-2 bg-white rounded-lg shadow-lg opacity-90 hover:opacity-100 transition-all duration-200 hover:bg-blue-50 hover:scale-105 border border-gray-300"
          title="بزرگنمایی چارت"
        >
          <Maximize2 className="w-4 h-4 text-blue-600" />
        </button>
      )}
      <ResponsiveContainer width="100%" height="100%">
        {/* 1. یک حاشیه بزرگ در پایین برای جا دادن Brush و Legend تعریف می‌کنیم */}
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
          {/* 2. یک ارتفاع مشخص به محور X می‌دهیم تا فضای لیبل‌های چرخانده شده رزرو شود */}
          <XAxis 
            dataKey="name" 
            axisLine={{ stroke: '#d1d5db' }}
            tickLine={{ stroke: '#d1d5db' }}
            tick={{ fontSize: 12, fontFamily: 'Dana, sans-serif', fill: '#6b7280' }}
            angle={-60}
            textAnchor="end"
            tickMargin={25}
            height={80} // این ارتفاع، فضای لازم برای لیبل‌ها را ایجاد می‌کند
          />
          <YAxis 
            axisLine={{ stroke: '#d1d5db' }}
            tickLine={{ stroke: '#d1d5db' }}
            tick={{ fontSize: 12, fontFamily: 'Dana, sans-serif', fill: '#6b7280' }}
            tickFormatter={(value) => `${value.toLocaleString()}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" />
          <Bar
            dataKey="value"
            fill="#8b5cf6" 
            name="مصرف انرژی (کیلووات ساعت)"
            radius={[5, 3, 0, 0]}
          />
          {/* 3. به Brush اجازه می‌دهیم به صورت خودکار زیر فضای رزرو شده XAxis قرار گیرد */}
          <Brush dataKey="name" height={30} stroke="#8b5cf6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}