import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, Users, Building, Wheat, Store, Sun, Shield, Maximize2 } from 'lucide-react';
import DynamicFilterPanel from '../components/DynamicFilterPanel';
import FloatingFilterButton from '../components/FloatingFilterButton';
import { apiService } from '../services/api';

interface TariffData {
  name: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  description: string;
}

interface DynamicFilterData {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  regions: string[];
  feeders: string[];
  color: string;
}

interface TooltipPayload {
  payload: TariffData;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

interface ApiTariffData {
  administrative?: number;
  agriculture?: number;
  commercial?: number;
  domestic?: number;
  industrial?: number;
  lighting?: number;
  [key: string]: number | undefined;
}

interface MultiFilterData {
  [key: string]: ApiTariffData[];
}

const TariffShare: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize with empty data - no chart should show initially
  const [tariffData, setTariffData] = useState<TariffData[]>([]);

  // Dynamic filter system states
  const [dynamicFilters, setDynamicFilters] = useState<DynamicFilterData[]>([]);
  const [showDynamicFilters, setShowDynamicFilters] = useState(false);
  const [useDynamicFilters, setUseDynamicFilters] = useState(false);

  // Color palette for different tariff types
  const tariffColors: Record<string, string> = {
    'خانگی': '#3B82F6',
    'تجاری': '#10B981', 
    'صنعتی': '#F59E0B',
    'کشاورزی': '#84CC16',
    'عمومی': '#8B5CF6',
    'روشنایی': '#F97316',
    'سایر': '#6B7280'
  };

  // Icons for different tariff types
  const getTariffIcon = (tariffType: string): React.ReactNode => {
    const iconMap: Record<string, React.ReactNode> = {
      'خانگی': <Users className="w-4 h-4" />,
      'تجاری': <Store className="w-4 h-4" />,
      'صنعتی': <Building className="w-4 h-4" />,
      'کشاورزی': <Wheat className="w-4 h-4" />,
      'عمومی': <Shield className="w-4 h-4" />,
      'روشنایی': <Sun className="w-4 h-4" />,
      'سایر': <TrendingUp className="w-4 h-4" />
    };
    return iconMap[tariffType] || <TrendingUp className="w-4 h-4" />;
  };

  const handleMaximize = () => {
    const validData = tariffData.filter(item => item.value > 0);
    
    if (validData.length === 0) {
      console.warn('TariffShare: No valid data available for full screen chart');
      return;
    }
    
    // Transform data to Chart.js format for FullScreenChart
    const chartData = {
      labels: validData.map(item => item.name),
      datasets: [{
        label: 'سهم تعرفه‌ها',
        data: validData.map(item => item.value),
        backgroundColor: validData.map(item => item.color),
        borderColor: validData.map(item => item.color),
        borderWidth: 2,
      }]
    };
    
    console.log('📊 TariffShare handleMaximize:', {
      originalTariffData: tariffData,
      processedChartData: chartData
    });
    
    // Uncomment when FullScreenChart is available
    // fullScreenChart.openFullScreen(
    //   chartData,
    //   'pie',
    //   'سهم تعرفه‌ها',
    //   'تحلیل سهم انواع مختلف مصرف کنندگان از کل مصرف برق'
    // );
  };

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <span className="font-medium text-gray-900">{data.name}</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{data.value.toFixed(1)}%</p>
          <p className="text-sm text-gray-600">{data.description}</p>
        </div>
      );
    }
    return null;
  };

  // Dynamic filter functions
  const handleDynamicFilters = async (filters: DynamicFilterData[]) => {
    setDynamicFilters(filters);
    setUseDynamicFilters(true);
    setLoading(true);
    setError('');

    try {
      const newMultiFilterData: MultiFilterData = {};
      
      // Process each filter
      for (const filter of filters) {
        console.log('🔄 Processing dynamic filter:', filter.name);
        
        const response = await apiService.getConsumptionDistributionByArrays(
          filter.feeders.length > 0 ? filter.feeders : [],
          filter.regions,
          filter.startDate,
          filter.endDate
        );
        
        console.log('📊 API Response for filter', filter.name, ':', response);
        
        if (response.status === 'success' && response.data) {
          // Check if the inner consumption_distribution has successful data
          if (response.data.consumption_distribution && 
              response.data.consumption_distribution.status === 'success' && 
              Array.isArray(response.data.consumption_distribution.result) &&
              response.data.consumption_distribution.result.length > 0) {
            newMultiFilterData[filter.id] = response.data.consumption_distribution.result;
          } else {
            console.warn('⚠️ API returned empty or failed result for filter:', filter.name);
            console.log('Consumption distribution status:', response.data.consumption_distribution?.status);
            console.log('Result array:', response.data.consumption_distribution?.result);
          }
        }
      }
      
      // Process the multi-filter data and set tariff data
      if (Object.keys(newMultiFilterData).length > 0) {
        // For now, use the first filter's data
        const firstFilterData = Object.values(newMultiFilterData)[0];
        console.log('🔍 First filter data structure:', firstFilterData);
        
        if (firstFilterData && Array.isArray(firstFilterData) && firstFilterData.length > 0) {
          let processedData: TariffData[] = [];
          
          // Check if first item is an object with tariff properties
          const firstItem = firstFilterData[0];
          if (typeof firstItem === 'object' && firstItem !== null) {
            // Map of English API keys to Persian names
            const tariffMapping: Record<string, string> = {
              'domestic': 'خانگی',
              'commercial': 'تجاری', 
              'industrial': 'صنعتی',
              'agriculture': 'کشاورزی',
              'administrative': 'عمومی',
              'lighting': 'روشنایی'
            };
            
            // Convert object properties to array
            processedData = Object.entries(firstItem)
              .filter(([key, value]) => tariffMapping[key] && typeof value === 'number' && value > 0)
              .map(([key, value]) => {
                const persianName = tariffMapping[key];
                return {
                  name: persianName,
                  value: typeof value === 'number' ? value : (value !== undefined ? parseFloat(value as string) : 0),
                  color: tariffColors[persianName] || '#6B7280',
                  icon: getTariffIcon(persianName),
                  description: `مصرف کنندگان ${persianName}`
                };
              });
          } else {
            // Fallback for array of objects with name/value structure
            processedData = firstFilterData.map((item: ApiTariffData) => {
              // For objects that might have name/value properties
              const itemAsRecord = item as Record<string, unknown>;
              return {
                name: (itemAsRecord.name || itemAsRecord.tariff_type || itemAsRecord.type || 'نامشخص') as string,
                value: parseFloat(String(itemAsRecord.value || itemAsRecord.percentage || itemAsRecord.share || 0)),
                color: tariffColors[(itemAsRecord.name || itemAsRecord.tariff_type || itemAsRecord.type) as string] || '#6B7280',
                icon: getTariffIcon((itemAsRecord.name || itemAsRecord.tariff_type || itemAsRecord.type) as string),
                description: (itemAsRecord.description as string) || `مصرف کنندگان ${itemAsRecord.name || itemAsRecord.tariff_type || itemAsRecord.type || 'نامشخص'}`
              };
            });
          }
          
          console.log('📈 Processed tariff data:', processedData);
          
          if (processedData.length > 0) {
            setTariffData(processedData);
          } else {
            console.warn('⚠️ No valid tariff data found after processing');
            setError('داده‌های تعرفه قابل نمایش یافت نشد');
          }
        } else {
          console.warn('⚠️ No valid array data found in response');
          setError('داده‌های معتبری یافت نشد. لطفاً فیلترهای مختلفی انتخاب کنید.');
        }
      } else {
        console.warn('⚠️ No successful API responses received');
        setError('هیچ داده‌ای از سرور دریافت نشد. ممکن است فیلترهای انتخابی داده‌ای نداشته باشند.');
      }
      
      console.log('✅ Multi-filter data loaded successfully');
    } catch (error) {
      console.error('❌ Multi-filter API call failed:', error);
      setError('خطا در بارگذاری داده‌های چندگانه');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 lg:p-6" dir="rtl">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">سهم تعرفه‌ها</h1>
          <p className="text-gray-600">
            تحلیل سهم انواع مختلف مصرف کنندگان از کل مصرف برق
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-700">نحوه استفاده</span>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              برای مقایسه سهم تعرفه‌ها در بازه‌های زمانی مختلف، روی دکمه شناور فیلتر (پایین سمت چپ) کلیک کنید و فیلترهای مختلف ایجاد کنید.
            </p>
          </div>
        </div>

        {/* Chart Section - Full Width */}
        <div className="w-full">
          
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="font-medium text-red-600">خطا</span>
              </div>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-center items-center h-80 lg:h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">در حال بارگذاری داده‌های تعرفه...</p>
                </div>
              </div>
            </div>
          )}

          {/* Chart Container */}
          {!loading && !error && (
            <>
              {/* Show chart if we have data */}
              {tariffData.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">توزیع سهم تعرفه‌ها</h2>
                      <p className="text-gray-600 mt-1">درصد مصرف هر نوع تعرفه از کل مصرف</p>
                    </div>
                  </div>
                  <div className="h-96 lg:h-[500px] relative group">
                    <button
                      onClick={handleMaximize}
                      className="absolute top-2 right-2 z-20 p-2 bg-white rounded-lg shadow-lg opacity-90 hover:opacity-100 transition-all duration-200 hover:bg-blue-50 hover:scale-105 border border-gray-300"
                      title="بزرگنمایی چارت"
                    >
                      <Maximize2 className="w-4 h-4 text-blue-600" />
                    </button>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={tariffData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {tariffData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Show empty state if no data and no attempt has been made */}
              {!loading && !error && tariffData.length === 0 && !useDynamicFilters && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex justify-center items-center h-80 lg:h-96">
                    <div className="text-center p-8">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 1-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">آماده برای تحلیل سهم تعرفه‌ها</h3>
                      <p className="text-gray-500 text-center max-w-md">
                        برای مشاهده سهم تعرفه‌ها، روی دکمه شناور فیلتر کلیک کنید و فیلترهای مورد نظر را تنظیم کنید
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tariff Legend */}
              {tariffData.length > 0 && (
                <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {tariffData.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="text-gray-600">{item.icon}</div>
                        <span className="font-medium text-gray-900">{item.name}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Floating Filter Button */}
      <FloatingFilterButton
        onClick={() => setShowDynamicFilters(true)}
        activeFiltersCount={dynamicFilters.length}
      />

      {/* Dynamic Filter Panel */}
      <DynamicFilterPanel
        isOpen={showDynamicFilters}
        onClose={() => setShowDynamicFilters(false)}
        onApplyFilters={handleDynamicFilters}
        title="فیلترهای پیشرفته سهم تعرفه"
        supportedAnalyses={['tariff']}
      />

      {/* Full Screen Chart Modal */}
      {/* <FullScreenChart
        isOpen={fullScreenChart.isOpen}
        onClose={fullScreenChart.closeFullScreen}
        chartData={fullScreenChart.chartData}
        chartType={fullScreenChart.chartType}
        title={fullScreenChart.title}
        description={fullScreenChart.description}
      /> */}
    </div>
  );
};

export default TariffShare;