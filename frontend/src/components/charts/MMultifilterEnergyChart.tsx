import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { FilterData } from "../DynamicFilterPanel";
import type { EnergyComparisonResponseDataItem } from '../../types/api.interfaces';

// ====================================================================
// IMPORTANT: This interface assumes your API response items have these keys.
// If your API returns different keys for the date/label and the value,
// you MUST update 'period_label' and 'total_consumption' here and in the
// 'useMemo' hook below.
// ====================================================================
interface ApiDataItem extends EnergyComparisonResponseDataItem {
  period_label: string;
  total_consumption: number;
}

// This interface describes the data structure AFTER processing, ready for the chart.
// It has a label and dynamic keys for each filter's data.
interface ProcessedChartData {
  period_label: string;
  [filterId: string]: string | number; // Allows for dynamic filter IDs
}

// This interface matches the state in your EnergyComparison component
interface MultiFilterEnergyData {
  [filterId: string]: ApiDataItem[];
}

interface MultiFilterEnergyChartProps {
  multiData: MultiFilterEnergyData;
  filters: FilterData[];
  loading: boolean;
  title: string;
}

// A helper function to format large numbers for the Y-axis
const formatEnergyValue = (value: number) => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
};

const MultiFilterEnergyChart: React.FC<MultiFilterEnergyChartProps> = ({ multiData, filters, loading }) => {

  const processedData = useMemo(() => {
    // Use the new `ProcessedChartData` type for the map.
    const combinedDataMap = new Map<string, ProcessedChartData>();

    filters.forEach(filter => {
      // The data from props is now correctly typed as ApiDataItem[]
      const dataForFilter = multiData[filter.id];
      
      if (dataForFilter) {
        dataForFilter.forEach(item => {
          // ====================================================================
          // IMPORTANT: If you changed the keys in ApiDataItem, change them here too.
          // For example: const { date, value } = item;
          // ====================================================================
          const { period_label, total_consumption } = item;
          
          const entry = combinedDataMap.get(period_label) || { period_label };
          
          // Add the consumption data using the filter's ID as the key.
          // This is now type-safe because of the index signature in `ProcessedChartData`.
          entry[filter.id] = total_consumption;
          
          combinedDataMap.set(period_label, entry);
        });
      }
    });

    return Array.from(combinedDataMap.values());
  }, [multiData, filters]);

  if (!loading && (!processedData || processedData.length === 0)) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>داده‌ای برای نمایش در نمودار وجود ندارد.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={processedData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="period_label" 
          tick={{ fill: '#6B7280', fontSize: 12 }} 
          axisLine={{ stroke: '#E5E7EB' }}
          tickLine={{ stroke: '#E5E7EB' }}
        />
        <YAxis
          tickFormatter={formatEnergyValue}
          tick={{ fill: '#6B7280', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '0.5rem',
            fontFamily: 'inherit',
            fontSize: '14px',
          }}
          labelStyle={{ fontWeight: 'bold', color: '#1F2937' }}
        />
        <Legend
          verticalAlign="top"
          align="left"
          wrapperStyle={{ paddingBottom: '20px' }}
        />
        {filters.map((filter) => (
          <Bar
            key={filter.id}
            dataKey={filter.id}
            name={filter.name}
            fill={filter.color}
            radius={[4, 4, 0, 0]}
            barSize={20}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MultiFilterEnergyChart;