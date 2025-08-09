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
import { useAuth } from '../../context/AuthContext';
import type { ConsumptionLimitationItem, ConsumptionLimitationChartProps } from '../../types/chartInterfaces';

const ConsumptionLimitationChart: React.FC<ConsumptionLimitationChartProps> = ({
  data,
  loading = false,
  onMaximize,
}) => {
  const { companyType } = useAuth();
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    console.log('Original data:', data); // برای دیباگ
    
    // بررسی ساختار داده ورودی
    if (data && typeof data === 'object') {
      let processedData: any[] = [];

      // اگر داده در data.data است
      const dataSource = data.data || data;
      
      // پردازش داده‌ها
      Object.entries(dataSource).forEach(([companyName, companyData]: [string, any]) => {
        console.log(`Processing ${companyName}:`, companyData); // برای دیباگ
        
        if (companyData?.result && Array.isArray(companyData.result) && companyData.result.length > 0) {
          const resultItem = companyData.result[0];
          
          // بررسی وجود ضریب کاهش مصرف
          if (resultItem['consumption reduction factor'] !== undefined && resultItem['consumption reduction factor'] !== null) {
            if (companyType === 'admin') {
              processedData.push({
                name: companyName || 'شرکت نامشخص',
                'ضریب کاهش مصرف': Number(resultItem['consumption reduction factor']),
                'بازه محدودیت': `${resultItem['start date limit']} تا ${resultItem['end date limit']}`,
                'بازه بدون محدودیت': `${resultItem['start date no limit']} تا ${resultItem['end date no limit']}`,
                'کد فیدر': resultItem['fidder code'] || resultItem['feeder code'] || null
              });
            } else if (companyType === 'public') {
              processedData.push({
                name: `کنتور ${resultItem['fidder code'] || resultItem['feeder code'] || 'نامشخص'}`,
                'ضریب کاهش مصرف': Number(resultItem['consumption reduction factor']),
                'بازه محدودیت': `${resultItem['start date limit']} تا ${resultItem['end date limit']}`,
                'بازه بدون محدودیت': `${resultItem['start date no limit']} تا ${resultItem['end date no limit']}`,
                'نام شرکت': companyName
              });
            } else { // companyType === 'private'
              processedData.push({
                name: companyName || 'شرکت شما',
                'ضریب کاهش مصرف': Number(resultItem['consumption reduction factor']),
                'بازه محدودیت': `${resultItem['start date limit']} تا ${resultItem['end date limit']}`,
                'بازه بدون محدودیت': `${resultItem['start date no limit']} تا ${resultItem['end date no limit']}`
              });
            }
          }
        }
      });

      console.log('Processed data:', processedData); // برای دیباگ
      setChartData(processedData);
    } else {
      console.log('No valid data found'); // برای دیباگ
      setChartData([]);
    }
  }, [data, companyType]);

  const formatTooltip = (value: any, name: string) => {
    if (name === 'ضریب کاهش مصرف') {
      return [`${value?.toFixed(3)}`, name];
    }
    return [value, name];
  };

  // 1. نمایش لودر در حالت بارگذاری
  if (loading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600 text-sm">در حال بارگذاری داده‌های چارت...</p>
        </div>
      </div>
    );
  }

  // 2. نمایش پیام "عدم وجود داده" اگر داده‌ای نباشد
  if (chartData.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-2">داده‌ای برای نمایش وجود ندارد.</p>
          <p className="text-gray-400 text-sm">لطفاً بازه زمانی مناسب را انتخاب کنید.</p>
        </div>
      </div>
    );
  }

  // 3. رندر چارت با داده‌ها
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
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            angle={(companyType === 'public' || companyType === 'admin') ? -45 : 0}
            textAnchor={(companyType === 'public' || companyType === 'admin') ? 'end' : 'middle'}
            height={(companyType === 'public' || companyType === 'admin') ? 70 : 30}
            interval={0}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickFormatter={(value) => value.toFixed(3)}
            domain={['dataMin - 0.1', 'dataMax + 0.1']}
          />
          {(companyType === 'public' || companyType === 'admin') && chartData.length > 5 && (
            <Brush dataKey="name" height={30} stroke="#3B82F6" y={320} />
          )}
          <Tooltip
            formatter={formatTooltip}
            labelStyle={{ color: '#374151', fontWeight: 'bold' }}
            contentStyle={{
              backgroundColor: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            labelFormatter={(label) => {
                if (companyType === 'public') return `کنتور: ${label}`;
                if (companyType === 'admin') return `شرکت: ${label}`;
                return label;
            }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-800 mb-2">
                      {companyType === 'public' ? `کنتور: ${label}` : 
                       companyType === 'admin' ? `شرکت: ${label}` : label}
                    </p>
                    <p className="text-blue-600">
                      ضریب کاهش مصرف: {data['ضریب کاهش مصرف']?.toFixed(3)}
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
                      {data['بازه محدودیت']}
                    </p>
                    <p className="text-gray-600 text-xs">
                      {data['بازه بدون محدودیت']}
                    </p>
                    {data['کد فیدر'] && (
                      <p className="text-gray-500 text-xs mt-1">
                        کد فیدر: {data['کد فیدر']}
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px', bottom: 0 }}
            iconType="rect"
          />
          <Bar
            dataKey="ضریب کاهش مصرف"
            fill="#3B82F6"
            name="ضریب کاهش مصرف انرژی"
            radius={[4, 4, 0, 0]}
            opacity={0.8}
            stroke="#2563EB"
            strokeWidth={1}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ConsumptionLimitationChart;