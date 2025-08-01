import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';

interface FilterData {
  id: string;
  name: string;
  color: string;
}

interface MultiFilterEnergyChartProps {
  multiData: { [filterId: string]: any };
  filters: FilterData[];
  loading?: boolean;
  title?: string;
}

const MultiFilterEnergyChart: React.FC<MultiFilterEnergyChartProps> = ({
  multiData,
  filters,
  loading = false,
  title = "مقایسه انرژی چندگانه"
}) => {
  // Process data for chart display
  const processChartData = () => {
    const combinedData: any[] = [];
    const dataMap = new Map<string, any>();

    filters.forEach(filter => {
      const filterData = multiData[filter.id];
      if (!filterData || !filterData.compare_energetic) return;

      let chartData: any[] = [];
      
      if (filterData.compare_energetic.result && Array.isArray(filterData.compare_energetic.result)) {
        chartData = filterData.compare_energetic.result.map((item: any) => ({
          key: item.num_fidder ? `فیدر ${item.num_fidder}` : 
               item.year ? `سال ${item.year}` : 
               item.section || 'نامشخص',
          value: item.energetic || item.amount || item.consumption || 0,
          originalData: item
        }));
      }

      // Add data to combined dataset
      chartData.forEach(item => {
        const key = item.key;
        if (!dataMap.has(key)) {
          dataMap.set(key, { key });
        }
        const existing = dataMap.get(key);
        existing[filter.id] = item.value;
        existing[`${filter.id}_name`] = filter.name;
      });
    });

    return Array.from(dataMap.values()).sort((a, b) => {
      return a.key.localeCompare(b.key);
    });
  };

  const chartData = processChartData();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری داده‌ها...</p>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">داده‌ای برای نمایش موجود نیست</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">مقایسه انرژی {filters.length} فیلتر مختلف</p>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="key" 
              tick={{ fontSize: 12 }}
              label={{ value: 'دوره زمانی', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: 'انرژی (kWh)', angle: -90, position: 'insideLeft' }}
            />
            <Brush dataKey="key" height={30} stroke="#8884d8" />
            <Tooltip 
              formatter={(value: any, name: string) => {
                const filter = filters.find(f => f.id === name);
                return [`${value} kWh`, filter?.name || name];
              }}
              labelFormatter={(label) => `دوره: ${label}`}
            />
            <Legend 
              formatter={(value: string) => {
                const filter = filters.find(f => f.id === value);
                return filter?.name || value;
              }}
            />
            {filters.map(filter => (
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

      {/* Filter Legend */}
      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map(filter => (
          <div key={filter.id} className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: filter.color }}
            />
            <span className="text-sm font-medium">{filter.name}</span>
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {filters.map(filter => {
          const filterData = multiData[filter.id];
          if (!filterData || !filterData.compare_energetic || !filterData.compare_energetic.result) return null;
          
          const totalEnergy = filterData.compare_energetic.result.reduce((sum: number, item: any) => {
            return sum + (item.energetic || item.amount || item.consumption || 0);
          }, 0);

          return (
            <div key={filter.id} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: filter.color }}
                />
                <span className="font-medium text-sm">{filter.name}</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{totalEnergy.toLocaleString()} kWh</p>
              <p className="text-xs text-gray-600">مجموع انرژی</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MultiFilterEnergyChart; 