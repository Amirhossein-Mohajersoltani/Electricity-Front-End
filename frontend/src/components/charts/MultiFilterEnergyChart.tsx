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
import type {
  FilterData,
  EnergyComparisonData,
  EnergyComparisonResultItem
} from '../../types/api.interfaces';

// ===========================================
// INTERFACES (بدون تغییر)
// ===========================================

interface MultiFilterEnergyData {
  [filterId: string]: EnergyComparisonData;
}

interface ProcessedChartData {
  period_label: string;
  period_start: string;
  [companyKey: string]: number | string;
}

interface CompanyInfo {
  key: string;
  name: string;
  color: string;
  filterId: string;
  filterName: string;
}

interface MultiFilterEnergyChartProps {
  multiData: MultiFilterEnergyData;
  filters: FilterData[];
  loading: boolean;
  title: string;
  companyTypes: string;
}

// ===========================================
// HELPER FUNCTIONS (بدون تغییر)
// ===========================================

const generateColors = (count: number): string[] => {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
    '#14B8A6', '#F43F5E', '#8B5A2B', '#0EA5E9', '#A855F7',
    '#22C55E', '#EAB308', '#DC2626', '#059669', '#7C3AED'
  ];
  if (count > colors.length) {
    for (let i = colors.length; i < count; i++) {
      colors.push(`hsl(${(i * 137.508) % 360}, 70%, 50%)`);
    }
  }
  return colors;
};

const formatEnergyValue = (value: number): string => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toFixed(0);
};

const createPeriodLabel = (item: EnergyComparisonResultItem): string => {
  if (item.period_start && item.period_end) {
    const startParts = item.period_start.split('-');
    const endParts = item.period_end.split('-');
    if (startParts.length >= 2 && endParts.length >= 2) {
      const startMonth = startParts[1];
      const startDay = startParts[2] || '01';
      const endMonth = endParts[1];
      const endDay = endParts[2] || '01';
      return `${startParts[0]}/${startMonth}/${startDay} - ${endParts[0]}/${endMonth}/${endDay}`;
    }
    return `${item.period_start} - ${item.period_end}`;
  }
  if (item.period_num) {
    return `دوره ${item.period_num}`;
  }
  return 'دوره نامشخص';
};

const convertPersianDateForSort = (persianDate: string): number => {
  if (!persianDate) return 0;
  const parts = persianDate.split('-');
  if (parts.length >= 3) {
    return parseInt(parts[0]) * 10000 + parseInt(parts[1]) * 100 + parseInt(parts[2]);
  }
  return 0;
};

// ===========================================
// MAIN COMPONENT (بخش رندر به‌روزرسانی شده)
// ===========================================

const MultiFilterEnergyChart: React.FC<MultiFilterEnergyChartProps> = ({
  multiData,
  filters,
  loading,
  title,
    companyTypes,
}) => {

  const { processedData, companies } = useMemo(() => {
    if (!filters || filters.length === 0 || !multiData) {
      return { processedData: [], companies: [] };
    }

    const periodMap = new Map<string, {
      period_label: string,
      period_start: string,
      period_end: string,
      companies: Map<string, number>
    }>();

    const companyInfoList: CompanyInfo[] = [];
    let colorIndex = 0;
    const colors = generateColors(50);

    filters.forEach(filter => {
      const filterData = multiData[filter.id];
      if (filterData) {
        Object.entries(filterData).forEach(([companyName, companyData]) => {
          if (companyData && companyData.result && Array.isArray(companyData.result) && companyData.result.length > 0) {
            const companyKey = `${filter.id}_${companyName}`;

            if (!companyInfoList.find(c => c.key === companyKey)) {
              companyInfoList.push({
                key: companyKey,
                name: companyName,
                color: colors[colorIndex % colors.length],
                filterId: filter.id,
                filterName: filter.name
              });
              colorIndex++;
            }

            companyData.result.forEach(resultItem => {
              const periodLabel = createPeriodLabel(resultItem);
              const periodStart = resultItem.period_start || '';
              const periodEnd = resultItem.period_end || '';
              const periodKey = `${periodStart}_${periodEnd}_${periodLabel}`;

              if (!periodMap.has(periodKey)) {
                periodMap.set(periodKey, {
                  period_label: periodLabel,
                  period_start: periodStart,
                  period_end: periodEnd,
                  companies: new Map()
                });
              }

              const period = periodMap.get(periodKey)!;
              period.companies.set(companyKey, resultItem.energetic || 0);
            });
          }
        });
      }
    });

    const chartData: ProcessedChartData[] = Array.from(periodMap.values())
      .sort((a, b) => {
        const dateA = convertPersianDateForSort(a.period_start);
        const dateB = convertPersianDateForSort(b.period_start);
        return dateA - dateB;
      })
      .map(period => {
        const dataPoint: ProcessedChartData = {
          period_label: period.period_label,
          period_start: period.period_start
        };

        companyInfoList.forEach(company => {
          dataPoint[company.key] = period.companies.get(company.key) || 0;
        });

        return dataPoint;
      });

    return { processedData: chartData, companies: companyInfoList };
  }, [multiData, filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">در حال بارگذاری نمودار...</p>
        </div>
      </div>
    );
  }

  if (!processedData || processedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-lg">داده‌ای برای نمایش در نمودار وجود ندارد.</p>
          <p className="text-sm mt-2">لطفاً فیلترهای مناسب انتخاب کنید.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {title && (
        <div className="mb-4 text-center">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
      )}

      {/* Chart Section */}
      <ResponsiveContainer width="100%" height={450}>
        <BarChart
          data={processedData}
          margin={{ top: 20, right: 30, left: 40, bottom: 120 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="period_label"
            tick={{ fill: '#6B7280', fontSize: 10 }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={{ stroke: '#E5E7EB' }}
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
          />
          <YAxis
  tickFormatter={formatEnergyValue}
  tick={{ fill: '#6B7280', fontSize: 12 }}
  axisLine={false}
  tickLine={false}
  label={{
    value:
      (companyTypes === 'private'
        ? 'kWh'
        : companyTypes === 'public'
        ? 'MWh'
        : companyTypes === 'admin'
        ? 'kWh'
        : '') + ' انرژی',
    angle: -90,
    position: 'insideLeft',
    style: { textAnchor: 'middle', fill: '#6B7280' },
    offset: -25
  }}
/>

          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload || payload.length === 0) return null;

              const periodStart = payload[0]?.payload?.period_start;
              const validPayload = payload.filter(p => p.value && p.value > 0);

              if (validPayload.length === 0) return null;

              return (
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg text-xs" style={{ direction: 'rtl', minWidth: '250px' }}>
                  <p className="font-bold text-sm text-gray-800 mb-2">دوره: {label}</p>
                  {periodStart && <p className="text-gray-500 text-xs mb-2">تاریخ شروع: {periodStart}</p>}
                  <div className="border-t border-gray-200 pt-2">
                    {validPayload.map((entry, index) => {
                      const company = companies.find(c => c.key === entry.dataKey);
                      return (
                          <div key={index} className="flex items-center justify-between my-1">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-sm" style={{backgroundColor: entry.color}}></span>
                              <span
                                  className="text-gray-700">{company ? `${company.name} (${company.filterName})` : entry.dataKey}</span>
                            </div>
                            {/*<span*/}
                            {/*    className="font-semibold text-gray-800">{formatEnergyValue(entry.value as number)}</span>*/}
                            <span
                                className="font-semibold text-gray-800">{entry.value} {companyTypes === 'private'
  ? 'kWh'
  : companyTypes === 'public'
    ? 'MWh'
    : companyTypes === "admin"
      ? 'kWh'
      : null}</span>
                          </div>
                      );
                    })}
                  </div>
                </div>
              );
            }}
          />
          <Legend
            verticalAlign="top"
            align="center"
            wrapperStyle={{ paddingBottom: '20px', direction: 'rtl', maxHeight: '100px', overflowY: 'auto' }}
            formatter={(value) => {
              const company = companies.find(c => c.key === value);
              return company ? <span title={`${company.name} (${company.filterName})`}>{`${company.name} (${company.filterName})`}</span> : value;
            }}
          />
          {companies.map((company) => (
            <Bar
              key={company.key}
              dataKey={company.key}
              name={company.key}
              fill={company.color}
              radius={[2, 2, 0, 0]}
              maxBarSize={40}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Info */}
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>مقایسه {companies.length} شرکت • {processedData.length} دوره زمانی • {filters.length} فیلتر</p>
      </div>

      {/* 📊 Data Table Section - START */}
      <div className="mt-8">
        <h4 className="text-md font-semibold text-gray-800 text-center mb-4">
          خلاصه داده‌ها به تفکیک دوره
        </h4>
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-right text-gray-700">
                  دوره
                </th>
                {companies.map((company) => (
                  <th key={company.key} className="whitespace-nowrap px-4 py-3 font-semibold text-center text-gray-700">
                    <div className="flex items-center justify-center gap-2">
                       <span
                         className="w-3 h-3 rounded-sm"
                         style={{ backgroundColor: company.color }}
                       />
                       <span>{company.name} ({company.filterName})</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {processedData.map((dataPoint, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-800">
                      {dataPoint.period_label}
                    </td>
                    {companies.map((company) => (
                        // <td key={company.key} className="whitespace-nowrap px-4 py-3 text-gray-600 text-center">
                        //   {formatEnergyValue(dataPoint[company.key] as number) || '۰'}
                        // </td>
                      <td key={company.key} className="whitespace-nowrap px-4 py-3 text-gray-600 text-center">
                    {dataPoint[company.key] || '۰'} {companyTypes === 'private'
  ? 'kWh'
  : companyTypes === 'public'
    ? 'MWh'
    : companyTypes === "admin"
      ? 'kWh'
      : null}
                  </td>
              ))}
            </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
{/* Data Table Section - END */
}
</div>
)
  ;
};

export default MultiFilterEnergyChart;