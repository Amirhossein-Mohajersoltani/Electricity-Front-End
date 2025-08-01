import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Zap, Filter, X } from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PersianDatePicker from '../PersianDatePicker';

// --- Interfaces ---
interface ConsumptionLimitationFilterData {
  fidder_code: string[];
  region_code: string[];
  no_limitation_start_date: string;
  no_limitation_end_date: string;
  limitation_start_date: string;
  limitation_end_date: string;
}

interface ConsumptionLimitationFilterProps {
  onFilter: (data: ConsumptionLimitationFilterData) => void;
  loading?: boolean;
}

// --- Component Definition ---
const ConsumptionLimitationFilter: React.FC<ConsumptionLimitationFilterProps> = ({
  onFilter,
  loading = false,
}) => {
  // --- Hooks (Must be at the top level) ---
  const { companyType } = useAuth();

  // State for the main filter data
  const [regions, setRegions] = useState<string[]>([]);
  const [feeders, setFeeders] = useState<string[]>([]);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [availableFeeders, setAvailableFeeders] = useState<string[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingFeeders, setLoadingFeeders] = useState(false);

  // State for date inputs
  const [noLimitationStartDate, setNoLimitationStartDate] = useState('');
  const [noLimitationEndDate, setNoLimitationEndDate] = useState('');
  const [limitationStartDate, setLimitationStartDate] = useState('');
  const [limitationEndDate, setLimitationEndDate] = useState('');

  // State for the conditional UI (quick time range)


  // --- Data Fetching Effect ---
  useEffect(() => {
    loadRegionsAndFeeders();
  }, []);

  // --- Data Fetching and Event Handlers ---
  const loadRegionsAndFeeders = async () => {
    setLoadingRegions(true);
    try {
      const response = await apiService.getRegionsAndFeeders();
      if (response.status === 'success' && response.data) {
        setAvailableRegions(response.data.regions || []);
        setAvailableFeeders(response.data.fidders || []);
      }
    } catch (error) {
      console.error('Error loading regions and feeders:', error);
    } finally {
      setLoadingRegions(false);
    }
  };

  const loadFeedersForRegions = async (selectedRegions: string[]) => {
    if (selectedRegions.length === 0) {
      setAvailableFeeders([]);
      return;
    }
    setLoadingFeeders(true);
    try {
      const response = await apiService.getRegionsAndFeeders({ region_code: selectedRegions });
      if (response.status === 'success' && response.data) {
        setAvailableFeeders(response.data.fidders || []);
      }
    } catch (error) {
      console.error('Error loading feeders for regions:', error);
    } finally {
      setLoadingFeeders(false);
    }
  };

  const handleRegionChange = (region: string) => {
    const newRegions = regions.includes(region)
      ? regions.filter(r => r !== region)
      : [...regions, region];
    setRegions(newRegions);
    setFeeders([]); // Reset feeders when regions change
    if (companyType === 'public') {
      loadFeedersForRegions(newRegions);
    }
  };

  const handleFeederChange = (feeder: string) => {
    const newFeeders = feeders.includes(feeder)
      ? feeders.filter(f => f !== feeder)
      : [...feeders, feeder];
    setFeeders(newFeeders);
  };

 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noLimitationStartDate || !noLimitationEndDate || !limitationStartDate || !limitationEndDate) {
      alert('لطفاً تمام تاریخ‌ها را وارد کنید');
      return;
    }
    if (companyType === 'public' && (regions.length === 0 || feeders.length === 0)) {
      alert('لطفاً حداقل یک منطقه و یک فیدر انتخاب کنید');
      return;
    }
    const filterData: ConsumptionLimitationFilterData = {
      fidder_code: companyType === 'private' ? ['1'] : feeders,
      region_code: companyType === 'private' ? ['1'] : regions,
      no_limitation_start_date: noLimitationStartDate,
      no_limitation_end_date: noLimitationEndDate,
      limitation_start_date: limitationStartDate,
      limitation_end_date: limitationEndDate,
    };
    onFilter(filterData);
  };

  const resetForm = () => {
    setRegions([]);
    setFeeders([]);
    setNoLimitationStartDate('');
    setNoLimitationEndDate('');
    setLimitationStartDate('');
    setLimitationEndDate('');
   
  };

  // --- JSX Return ---
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">فیلتر محدودیت مصرف</h3>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <X className="w-4 h-4" />
          پاک کردن
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* No Limitation Period */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              بدون محدودیت
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ شروع</label>
                <PersianDatePicker
                  value={noLimitationStartDate}
                  onChange={setNoLimitationStartDate}
                  placeholder="تاریخ شروع"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ پایان</label>
                <PersianDatePicker
                  value={noLimitationEndDate}
                  onChange={setNoLimitationEndDate}
                  placeholder="تاریخ پایان"
                />
              </div>
            </div>
          </div>

          {/* Limitation Period */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              با محدودیت
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ شروع</label>
                <PersianDatePicker
                  value={limitationStartDate}
                  onChange={setLimitationStartDate}
                  placeholder="تاریخ شروع"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ پایان</label>
                <PersianDatePicker
                  value={limitationEndDate}
                  onChange={setLimitationEndDate}
                  placeholder="تاریخ پایان"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Region and Feeder Selection - Only for public companies */}
        {companyType === 'public' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Regions */}
            <div>
              <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                انتخاب منطقه
              </label>
              <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
                {loadingRegions ? (
                  <div className="text-center py-2 text-gray-500">در حال بارگذاری...</div>
                ) : availableRegions.length > 0 ? (
                  availableRegions.map(region => (
                    <label key={region} className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        checked={regions.includes(region)}
                        onChange={() => handleRegionChange(region)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">منطقه {region}</span>
                    </label>
                  ))
                ) : (
                  <div className="text-center py-2 text-gray-500">منطقه‌ای یافت نشد</div>
                )}
              </div>
              {regions.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  {regions.length} منطقه انتخاب شده
                </div>
              )}
            </div>

            {/* Feeders */}
            <div>
              <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                انتخاب فیدر
              </label>
              <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
                {loadingFeeders ? (
                  <div className="text-center py-2 text-gray-500">در حال بارگذاری...</div>
                ) : availableFeeders.length > 0 ? (
                  availableFeeders.map(feeder => (
                    <label key={feeder} className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        checked={feeders.includes(feeder)}
                        onChange={() => handleFeederChange(feeder)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{feeder}</span>
                    </label>
                  ))
                ) : (
                  <div className="text-center py-2 text-gray-500">
                    {regions.length > 0 ? 'فیدری یافت نشد' : 'ابتدا منطقه انتخاب کنید'}
                  </div>
                )}
              </div>
              {feeders.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  {feeders.length} فیدر انتخاب شده
                </div>
              )}
            </div>
          </div>
        )}
        
        

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                در حال پردازش...
              </>
            ) : (
              <>
                <Filter className="w-4 h-4" />
                اعمال فیلتر
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConsumptionLimitationFilter;