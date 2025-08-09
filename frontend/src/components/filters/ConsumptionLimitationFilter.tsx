import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Zap, Filter, X, Building2 } from 'lucide-react';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PersianDatePicker from '../PersianDatePicker';
import type {
  ConsumptionLimitationFilterData,
  ConsumptionLimitationFilterProps,
} from '../../types/filterInterfaces'; // حالا این import به درستی کار می‌کند

// --- Component Definition ---
const ConsumptionLimitationFilter: React.FC<ConsumptionLimitationFilterProps> = ({
  onFilter,
  loading = false,
}) => {
  // --- Hooks ---
  const { companyType } = useAuth();

  // State for public company filters
  const [regions, setRegions] = useState<string[]>([]);
  const [feeders, setFeeders] = useState<string[]>([]);
  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [availableFeeders, setAvailableFeeders] = useState<string[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingFeeders, setLoadingFeeders] = useState(false);

  // State for admin company filters
  const [privateCompanies, setPrivateCompanies] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // State for date inputs
  const [noLimitationStartDate, setNoLimitationStartDate] = useState('');
  const [noLimitationEndDate, setNoLimitationEndDate] = useState('');
  const [limitationStartDate, setLimitationStartDate] = useState('');
  const [limitationEndDate, setLimitationEndDate] = useState('');

  // --- Data Fetching Effect ---
  useEffect(() => {
    if (companyType === 'admin') {
      loadPrivateCompanies();
    } else {
      loadRegionsAndFeeders();
    }
  }, [companyType]);

  // --- Data Fetching and Event Handlers ---
  const loadPrivateCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const response = await apiService.getPrivateCompanies();
      if (response.status === 'success' && response.data) {
        setPrivateCompanies(response.data.company_names || []);
      }
    } catch (error) {
      console.error('Error loading private companies:', error);
      setPrivateCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const loadRegionsAndFeeders = async () => {
    setLoadingRegions(true);
    try {
      const response = await apiService.getRegionsAndFeeders();
      if (response.status === 'success' && response.data) {
        setAvailableRegions(response.data.regions || []);
        // FIX: Use 'fidders' to match the API response and new interface
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
        // FIX: Use 'fidders' to match the API response and new interface
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
    setFeeders([]);
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

  const handleCompanyChange = (company: string) => {
    const newCompanies = selectedCompanies.includes(company)
      ? selectedCompanies.filter(c => c !== company)
      : [...selectedCompanies, company];
    setSelectedCompanies(newCompanies);
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
    if (companyType === 'admin' && selectedCompanies.length === 0) {
      alert('لطفاً حداقل یک شرکت انتخاب کنید');
      return;
    }

    // FIX: Changed 'let' to 'const' to resolve ESLint warning.
    const baseData = {
      no_limitation_start_date: noLimitationStartDate,
      no_limitation_end_date: noLimitationEndDate,
      limitation_start_date: limitationStartDate,
      limitation_end_date: limitationEndDate,
    };

    let filterData: ConsumptionLimitationFilterData;

    if (companyType === 'admin') {
      filterData = {
        ...baseData,
        company_names: selectedCompanies,
        // region_code: [],
        // fidder_code: [],
      };
    } else if (companyType === 'public') {
      filterData = {
        ...baseData,
        region_code: regions,
        fidder_code: feeders,
      };
    } else { // 'private'
      filterData = {
        ...baseData,
        region_code: ['1'],
        fidder_code: ['1'],
      };
    }

    onFilter(filterData);
  };

  const resetForm = () => {
    setRegions([]);
    setFeeders([]);
    setNoLimitationStartDate('');
    setNoLimitationEndDate('');
    setLimitationStartDate('');
    setLimitationEndDate('');
    setSelectedCompanies([]);
  };

  // --- JSX Return (No changes needed here) ---
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

        {/* Region and Feeder Selection - Only for 'public' companies */}
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

        {/* Company Selection - Only for 'admin' users */}
        {companyType === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                انتخاب شرکت
              </label>
              <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                {loadingCompanies ? (
                  <div className="text-center py-2 text-gray-500">در حال بارگذاری شرکت‌ها...</div>
                ) : privateCompanies.length > 0 ? (
                  privateCompanies.map(company => (
                    <label key={company} className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        checked={selectedCompanies.includes(company)}
                        onChange={() => handleCompanyChange(company)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{company}</span>
                    </label>
                  ))
                ) : (
                  <div className="text-center py-2 text-gray-500">شرکتی یافت نشد</div>
                )}
              </div>
              {selectedCompanies.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  {selectedCompanies.length} شرکت انتخاب شده
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