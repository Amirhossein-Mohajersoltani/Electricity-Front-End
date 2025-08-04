import React, { useState, useEffect } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush
} from 'recharts';
import { Maximize2, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Make sure the path is correct

interface ConsumptionLimitationItem {
  'start date limit': string;
  'end date limit': string;
  'start date no limit': string;
  'end date no limit': string;
  'feeder code'?: number; // Feeder code is optional for private companies
  'consumption reduction factor': number;
}

interface ConsumptionLimitationChartProps {
  data: any;
  loading?: boolean;
  onMaximize?: () => void;
  filterInfo?: any;
}

const ConsumptionLimitationChart: React.FC<ConsumptionLimitationChartProps> = ({
  data,
  loading = false,
  onMaximize,
  filterInfo
}) => {
  const { companyType } = useAuth(); // Get company type from auth context
  const [chartData, setChartData] = useState<any[]>([]);
  const [hasValidData, setHasValidData] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const resultData: ConsumptionLimitationItem[] =
      data?.consumption_limitation?.result ?? [];

    if (Array.isArray(resultData) && resultData.length > 0) {
      console.log('✅ ConsumptionLimitationChart: Using API result data');
      let processedData;

      // --- Conditional logic based on company type ---
      if (companyType === 'private') {
        // For private companies, we don't have feeders.
        // We assume the data is a single entry for the whole company.
        processedData = resultData.map((item) => ({
          name: 'شرکت شما', // Generic name, no feeder
          'ضریب کاهش مصرف': item['consumption reduction factor'],
          'بازه محدودیت': `${item['start date limit']} تا ${item['end date limit']}`,
          'بازه بدون محدودیت': `${item['start date no limit']} تا ${item['end date no limit']}`
        }));
      } else {
        // For public companies, group by feeder code (existing logic).
        processedData = resultData.map((item) => ({
          name: `کنتور ${'fidder code' in item ? item['fidder code'] : item['feeder code']}`,
          'ضریب کاهش مصرف': item['consumption reduction factor'],
          'کنتور': item['feeder code'],
          'بازه محدودیت': `${item['start date limit']} تا ${item['end date limit']}`,
          'بازه بدون محدودیت': `${item['start date no limit']} تا ${item['end date no limit']}`
        }));
      }

      setChartData(processedData);
      setHasValidData(true);
    } else if (!loading) {
      // Fallback to random data generation also considers company type
      const timeout = setTimeout(() => {
        console.log('⏰ ConsumptionLimitationChart: 30s timeout reached, using random data');
        let randomData;
        if (companyType === 'private') {
          randomData = [{
            name: 'شرکت شما',
            'ضریب کاهش مصرف': Math.random() * (2.5 - 1.2) + 1.2,
            'بازه محدودیت': '1401-04-01 تا 1401-05-31',
            'بازه بدون محدودیت': '1401-07-01 تا 1401-08-30'
          }];
        } else {
          randomData = Array.from({ length: 6 }, (_, i) => ({
            name: `کنتور ${i + 1}`,
            'ضریب کاهش مصرف': Math.random() * (2.5 - 1.2) + 1.2,
            'کنتور': i + 1,
            'بازه محدودیت': '1401-04-01 تا 1401-05-31',
            'بازه بدون محدودیت': '1401-07-01 تا 1401-08-30'
          }));
        }
        setChartData(randomData);
        setHasValidData(true);
      }, 30000);

      setTimeoutId(timeout);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
    // Add companyType to the dependency array
  }, [data, loading, companyType]);

  const formatTooltip = (value: any, name: string) => {
    if (name === 'ضریب کاهش مصرف') {
      return [`${value?.toFixed(2)}`, name];
    }
    return [value, name];
  };

  if (!hasValidData) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600 text-sm">در حال بارگذاری داده‌های محدودیت مصرف...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] relative group">
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
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            // --- Conditional props for XAxis ---
            angle={companyType === 'public' ? -45 : 0}
            textAnchor={companyType === 'public' ? 'end' : 'middle'}
            height={companyType === 'public' ? 60 : 30}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickFormatter={(value) => value.toFixed(1)}
          />
          {companyType === 'public' && chartData.length > 1 && (
            <Brush dataKey="name" height={30} stroke="#8884d8" />
          )}
          <Tooltip
            formatter={formatTooltip}
            labelStyle={{ color: '#374151' }}
            contentStyle={{
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            // --- Conditional tooltip label ---
            labelFormatter={(label) =>
              companyType === 'public' ? `کنتور: ${label}` : label
            }
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="rect"
          />
          <Bar
            dataKey="ضریب کاهش مصرف"
            fill="#3B82F6"
            name="ضریب کاهش مصرف انرژی"
            radius={[4, 4, 0, 0]}
            opacity={0.8}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ConsumptionLimitationChart;