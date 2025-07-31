import  { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, TrendingDown, BarChart3, Zap } from 'lucide-react';
import ConsumptionLimitationChart from '@/components/charts/ConsumptionLimitationChart';
import ConsumptionLimitationFilter from '@/components/filters/ConsumptionLimitationFilter';
import FloatingFilterButton from '@/components/FloatingFilterButton';
// import { FullScreenChart } from '@/components/charts/FullScreenChart';
// import { useFullScreenChart } from '@/hooks/useFullScreenChart';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';

interface ConsumptionLimitationItem {
  'start date limit': string;
  'end date limit': string;
  'start date no limit': string;
  'end date no limit': string;
  'feeder code': number;
  'consumption reduction factor': number;
}

interface ConsumptionLimitationFilterData {
  fidder_code: string[];
  region_code: string[];
  no_limitation_start_date: string;
  no_limitation_end_date: string;
  limitation_start_date: string;
  limitation_end_date: string;
}

interface DynamicFilterData {
  id: string;
  name: string;
  regions: string[];
  feeders: string[];
  startDate: string;
  endDate: string;
}

const ConsumptionLimitation = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { companyType } = useAuth();

  // Dynamic filter system states
  const [dynamicFilters, setDynamicFilters] = useState<DynamicFilterData[]>([]);
  const [showDynamicFilters, setShowDynamicFilters] = useState(false);

  // const fullScreenChart = useFullScreenChart();

  const fetchConsumptionLimitationData = async (filterData: ConsumptionLimitationFilterData) => {
    console.log('📊 Fetching consumption limitation data with filters:', filterData);
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getConsumptionLimitation(filterData);
      console.log('📊 Consumption limitation API response:', response);
      
      if (response.status === 'success' && response.data) {
        setData(response.data);
      } else {
        throw new Error(response.message || 'خطا در دریافت داده‌ها');
      }
    } catch (err) {
      console.error('❌ Consumption limitation API call failed:', err);
      setError(err instanceof Error ? err.message : 'خطا در دریافت داده‌ها');
    } finally {
      setLoading(false);
    }
  };

  const handleMaximize = () => {
    if (data && data.consumption_limitation && Array.isArray(data.consumption_limitation)) {
      // Transform data to Chart.js format for FullScreenChart
      const chartData = {
        labels: data.consumption_limitation.map((item: ConsumptionLimitationItem) => `فیدر ${item['feeder code']}`),
        datasets: [{
          label: 'ضریب کاهش مصرف انرژی',
          data: data.consumption_limitation.map((item: ConsumptionLimitationItem) => item['consumption reduction factor']),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
          borderRadius: 4,
        }]
      };
      
      // fullScreenChart.openFullScreen(
      //   chartData,
      //   'bar',
      //   'تحلیل محدودیت مصرف',
      //   'ضریب کاهش مصرف انرژی ناشی از محدودیت'
      // );
    }
  };

  const handleFilterSubmit = (filterData: ConsumptionLimitationFilterData) => {
    fetchConsumptionLimitationData(filterData);
  };

  const handleDynamicFilters = async (filters: DynamicFilterData[]) => {
    setDynamicFilters(filters);
    console.log('Dynamic filters applied:', filters);
  };

  const calculateTotalStats = () => {
    if (!data || !data.consumption_limitation || !Array.isArray(data.consumption_limitation)) {
      return {
        totalFeeders: 0,
        averageReduction: 0,
        maxReduction: 0,
        minReduction: 0
      };
    }

    const reductionFactors = data.consumption_limitation.map((item: ConsumptionLimitationItem) => 
      item['consumption reduction factor']
    );

    const totalFeeders = reductionFactors.length;
    const averageReduction = totalFeeders > 0 ? 
      reductionFactors.reduce((sum: number, factor: number) => sum + factor, 0) / totalFeeders : 0;
    const maxReduction = totalFeeders > 0 ? Math.max(...reductionFactors) : 0;
    const minReduction = totalFeeders > 0 ? Math.min(...reductionFactors) : 0;
    
    return {
      totalFeeders,
      averageReduction,
      maxReduction,
      minReduction
    };
  };

  const stats = calculateTotalStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">تحلیل محدودیت مصرف</h1>
        <p className="text-muted-foreground">
          {companyType === 'private' 
            ? 'تحلیل ضریب کاهش مصرف انرژی ناشی از محدودیت در خط تولید'
            : 'تحلیل ضریب کاهش مصرف انرژی ناشی از محدودیت در فیدرهای انتخابی'
          }
        </p>
      </div>

      {/* Filter Panel */}
      <ConsumptionLimitationFilter 
        onFilter={handleFilterSubmit}
        loading={loading}
      />

      {/* Dynamic Filters */}
      {showDynamicFilters && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">فیلترهای پیشرفته</h3>
          <p className="text-gray-600 mb-4">این بخش در حال توسعه است</p>
          <button 
            onClick={() => setShowDynamicFilters(false)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            بستن
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      {stats.totalFeeders > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {companyType === 'private' ? 'تعداد نقاط تحلیل' : 'تعداد فیدرها'}
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFeeders}</div>
              <p className="text-xs text-muted-foreground">
                نقاط تحلیل شده
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">میانگین ضریب کاهش</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageReduction.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                میانگین کل
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">حداکثر کاهش</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.maxReduction.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                بالاترین ضریب
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">حداقل کاهش</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.minReduction.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                کمترین ضریب
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle>نمودار ضریب کاهش مصرف</CardTitle>
          <CardDescription>
            ضریب کاهش مصرف انرژی ناشی از محدودیت برای هر {companyType === 'private' ? 'نقطه' : 'فیدر'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConsumptionLimitationChart
            data={data}
            loading={loading}
            onMaximize={handleMaximize}
          />
        </CardContent>
      </Card>

      {/* Floating Filter Button */}
      <FloatingFilterButton 
        onClick={() => setShowDynamicFilters(!showDynamicFilters)}
      />

      {/* Full Screen Chart */}
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

export default ConsumptionLimitation; 