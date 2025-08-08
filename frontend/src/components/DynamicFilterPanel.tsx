import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { X, Plus, Filter, Calendar, MapPin, Zap, Search, Trash2, ListFilter, Loader2, AlertTriangle, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PersianDatePicker from './PersianDatePicker';
import MultiSelect from './ui/multi-select';
import api from '../services/api';
import type { FilterData } from '../types/api.interfaces';

export interface DynamicFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterData[]) => void;
  title?: string;
}

const FILTER_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

const getRangeDisplayText = (filter: FilterData): string => {
  if (filter.period) {
    switch (filter.period) {
      case 'weekly': return 'هفتگی';
      case 'monthly': return 'ماهانه';
      case 'yearly': return 'سالیانه';
      case 'custom': return filter.costume_period ? `بازه دلخواه: ${filter.costume_period} روز گذشته` : 'بازه دلخواه';
      default: return 'بازه نامشخص';
    }
  }
  return `${filter.startDate || ''} تا ${filter.endDate || ''}`;
};

const DynamicFilterPanel: React.FC<DynamicFilterPanelProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  title = "فیلترهای پیشرفته"
}) => {
  const { companyType } = useAuth();
  const location = useLocation();

  const [filters, setFilters] = useState<FilterData[]>(() => {
    const savedFilters = localStorage.getItem('dynamicFilters');
    try {
      return savedFilters ? JSON.parse(savedFilters) : [];
    } catch {
      return [];
    }
  });

  const [availableRegions, setAvailableRegions] = useState<string[]>([]);
  const [availableFeeders, setAvailableFeeders] = useState<string[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingFeeders, setLoadingFeeders] = useState(false);
  
  const [availablePrivateCompanies, setAvailablePrivateCompanies] = useState<string[]>([]);
  const [loadingPrivateCompanies, setLoadingPrivateCompanies] = useState(false);

  const [error, setError] = useState('');
  const [isCustomInputVisible, setIsCustomInputVisible] = useState(false);
  
  // ✅ CHANGED: This is the only line you need to change.
  // Now only 'public' users will see location filters. 'admin' and 'private' will see company names.
  const shouldShowLocationFilters = companyType === 'public';

  const [currentFilter, setCurrentFilter] = useState<Partial<FilterData>>({
    name: '',
    regions: [],
    feeders: [],
    companyNames: [],
    startDate: '',
    endDate: '',
    period: undefined,
    costume_period: undefined
  });

  useEffect(() => {
    if (isOpen) {
      if (shouldShowLocationFilters) {
        loadPublicCompanyData();
      } else {
        // This will now correctly run for both 'admin' and 'private' users
        loadPrivateCompanyData();
      }
    }
  }, [companyType, isOpen, shouldShowLocationFilters]);

  useEffect(() => {
    localStorage.setItem('dynamicFilters', JSON.stringify(filters));
  }, [filters]);

  const loadPublicCompanyData = async () => {
    setLoadingRegions(true);
    setError('');
    try {
      const response = await api.getFidderRegion();
      if (response.status === 'success' && response.data?.regions) {
        setAvailableRegions(response.data.regions);
      } else {
        setError('خطا در بارگذاری مناطق');
      }
    } catch (err) {
      console.error('Error loading region data:', err);
      setError('خطا در ارتباط با سرور برای دریافت اطلاعات مناطق');
    } finally {
      setLoadingRegions(false);
    }
  };
  
  const loadPrivateCompanyData = async () => {
    setLoadingPrivateCompanies(true);
    setError('');
    try {
      const response = await api.getPrivateCompanies();
      if (response.status === 'success' && response.data?.company_names) {
        setAvailablePrivateCompanies(response.data.company_names);
        console.log('✅ Private companies loaded:', response.data.company_names);
      } else {
        console.warn('⚠️ No company names in response:', response);
        setAvailablePrivateCompanies([]);
      }
    } catch (err) {
      console.error('❌ Error loading private companies:', err);
      setError('خطا در بارگذاری لیست شرکت‌ها. از حالت پیش‌فرض استفاده می‌شود.');
      // Set fallback companies based on the sample data
      setAvailablePrivateCompanies(['بازار بزرگ اطلس', 'بناگست']);
    } finally {
      setLoadingPrivateCompanies(false);
    }
  };

  const loadFeedersByRegions = async (regionCodes: (string | number)[]) => {
    if (!regionCodes || regionCodes.length === 0) {
      setAvailableFeeders([]);
      setCurrentFilter(prev => ({ ...prev, feeders: [] }));
      return;
    }

    setLoadingFeeders(true);
    setAvailableFeeders([]);
    setCurrentFilter(prev => ({ ...prev, feeders: [] }));
    setError('');

    try {
      const response = await api.getFiddersByRegions(regionCodes.map(String));
      if (response.status === 'success' && response.data?.fidders) {
        setAvailableFeeders([...new Set(response.data.fidders)]);
      } else if (regionCodes.length > 0) {
        setError('⚠️ هیچ فیدری در مناطق انتخاب شده یافت نشد');
      }
    } catch (err) {
      console.error('Error loading feeders by regions:', err);
      setError('خطا در بارگذاری فیدرها');
    } finally {
      setLoadingFeeders(false);
    }
  };

  const handleFilterChange = (key: keyof FilterData, value: FilterData[keyof FilterData]) => {
    setCurrentFilter(prev => ({ ...prev, [key]: value }));
    if (error) setError('');

    if (key === 'regions' && Array.isArray(value)) {
      if (value.length > 0) {
        loadFeedersByRegions(value);
      } else {
        setAvailableFeeders([]);
        setCurrentFilter(prev => ({ ...prev, feeders: [] }));
      }
    }
  };

  const handleDateChange = (key: 'startDate' | 'endDate', value: string) => {
    setCurrentFilter(prev => ({ ...prev, [key]: value, period: undefined, costume_period: undefined }));
  };

  const handlePresetRangeClick = (range: 'weekly' | 'monthly' | 'yearly' | 'custom') => {
    setIsCustomInputVisible(range === 'custom');
    setCurrentFilter(prev => ({
      ...prev,
      period: range,
      startDate: '',
      endDate: '',
      costume_period: range !== 'custom' ? undefined : prev.costume_period,
    }));
  };
  
  const handleCustomDaysChange = (value: string) => {
    const days = parseInt(value, 10);
    setCurrentFilter(prev => ({
      ...prev,
      costume_period: isNaN(days) ? undefined : days.toString()
    }));
  };

  const addFilter = () => {
    const hasManualDates = currentFilter.startDate && currentFilter.endDate;
    const hasPresetRange = currentFilter.period && (currentFilter.period !== 'custom' || (currentFilter.costume_period && parseInt(currentFilter.costume_period) > 0));

    if (!currentFilter.name) {
      setError('لطفاً نام فیلتر را وارد کنید.');
      return;
    }
    
    if (!hasManualDates && !hasPresetRange) {
      setError('لطفاً یک بازه زمانی معتبر (تاریخ شروع و پایان یا یک بازه پیش‌فرض) انتخاب کنید.');
      return;
    }

    if (shouldShowLocationFilters) {
      if (!currentFilter.regions || currentFilter.regions.length === 0) {
        setError('لطفاً حداقل یک منطقه انتخاب کنید.');
        return;
      }
      if (!currentFilter.feeders || currentFilter.feeders.length === 0) {
        setError('لطفاً حداقل یک فیدر انتخاب کنید.');
        return;
      }
    } else {
      if (!currentFilter.companyNames || currentFilter.companyNames.length === 0) {
        setError('لطفاً حداقل یک شرکت را انتخاب کنید.');
        return;
      }
    }

    const newFilter: FilterData = {
      id: Date.now().toString(),
      name: currentFilter.name!,
      color: FILTER_COLORS[filters.length % FILTER_COLORS.length],
      
      ...(shouldShowLocationFilters ? {
        regions: currentFilter.regions || [],
        feeders: currentFilter.feeders || [],
      } : {
        companyNames: currentFilter.companyNames || [],
      }),
      
      ...(currentFilter.startDate && { startDate: currentFilter.startDate }),
      ...(currentFilter.endDate && { endDate: currentFilter.endDate }),
      ...(currentFilter.period && { period: currentFilter.period }),
      ...(currentFilter.costume_period && { costume_period: currentFilter.costume_period }),
    };

    setFilters(prevFilters => [...prevFilters, newFilter]);
    setCurrentFilter({ 
      name: '', 
      startDate: '', 
      endDate: '', 
      regions: [], 
      feeders: [],
      companyNames: [],
      period: undefined, 
      costume_period: undefined 
    });
    setAvailableFeeders([]);
    setIsCustomInputVisible(false);
    setError('');
  };

  const removeFilter = (filterId: string) => {
    setFilters(filters.filter(f => f.id !== filterId));
  };

  const handleApplyFilters = () => {
    if (filters.length === 0) {
      setError('برای اعمال، ابتدا حداقل یک فیلتر اضافه کنید.');
      return;
    }
    onApplyFilters(filters);
    onClose();
  };

  const SelectLoadingState = () => (
    <div className="flex items-center justify-center h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <Card className="w-full max-w-7xl max-h-[95vh] flex flex-col bg-gray-50/90 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-white">
          <div className="flex items-center gap-3">
            <Filter className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>فیلترهای مورد نظر خود را بسازید و برای مقایسه اضافه کنید.</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <div className="flex-grow overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Active Filters Panel */}
            <div className="flex flex-col space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800">
                <ListFilter className="h-5 w-5 text-gray-500" />
                مرحله ۲: بررسی و اعمال
              </h3>
              <Card className="flex-grow bg-white">
                <CardHeader>
                  <CardTitle>فیلترهای فعال ({filters.length})</CardTitle>
                  <CardDescription>این فیلترها در نمودار اعمال خواهند شد.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {filters.length === 0 ? (
                    <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg">
                      <div className="mx-auto h-12 w-12 text-gray-400"><Filter /></div>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">فیلتری اضافه نشده است</h3>
                      <p className="mt-1 text-sm text-gray-500">از پنل سمت چپ، فیلتر جدید خود را بسازید.</p>
                    </div>
                  ) : (
                    filters.map((filter) => (
                      <div key={filter.id} className="flex items-start justify-between p-3 border rounded-lg shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-4">
                          <span className="w-2 h-16 rounded-full" style={{ backgroundColor: filter.color }} />
                          <div>
                            <p className="font-bold text-gray-800">{filter.name}</p>
                            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {getRangeDisplayText(filter)}
                            </p>
                            {filter.regions && filter.feeders && (
                              <>
                                <p className="text-xs text-gray-500 mt-1"><span className="font-medium">{filter.regions.length}</span> منطقه</p>
                                <p className="text-xs text-gray-500 mt-1"><span className="font-medium">{filter.feeders.length}</span> فیدر</p>
                              </>
                            )}
                            {filter.companyNames && (
                               <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                                  <Building className="h-3.5 w-3.5" />
                                  <span className="font-medium">{filter.companyNames.length}</span> شرکت
                               </p>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFilter(filter.id)} className="text-gray-400 hover:bg-red-100 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Create New Filter Panel */}
            <div className="flex flex-col space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800">
                <Plus className="h-5 w-5 text-gray-500" />
                مرحله ۱: ساخت فیلتر جدید
              </h3>
              <Card className="bg-white">
                <CardContent className="p-6 space-y-5">
                  <div>
                    <Label htmlFor="filterName" className="text-sm font-medium text-gray-700">نام فیلتر <span className="text-red-500">*</span></Label>
                    <Input id="filterName" placeholder="مثال: سه ماهه اول سال ۱۴۰۳" value={currentFilter.name || ''} onChange={(e) => handleFilterChange('name', e.target.value)} className="mt-2" />
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">بازه زمانی <span className="text-red-500">*</span></Label>
                    {location.pathname.includes('comparison') && (
                      <div className="flex items-center gap-2 flex-wrap mb-4">
                        <Button size="sm" type="button" variant={currentFilter.period === 'weekly' ? 'default' : 'outline'} onClick={() => handlePresetRangeClick('weekly')}>هفتگی</Button>
                        <Button size="sm" type="button" variant={currentFilter.period === 'monthly' ? 'default' : 'outline'} onClick={() => handlePresetRangeClick('monthly')}>ماهانه</Button>
                        <Button size="sm" type="button" variant={currentFilter.period === 'yearly' ? 'default' : 'outline'} onClick={() => handlePresetRangeClick('yearly')}>سالیانه</Button>
                        <Button size="sm" type="button" variant={currentFilter.period === 'custom' ? 'default' : 'outline'} onClick={() => handlePresetRangeClick('custom')}>بازه دلخواه</Button>
                      </div>
                    )}
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isCustomInputVisible ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md border mb-4">
                        <Input type="text" pattern="[0-9]*" inputMode="numeric" value={currentFilter.costume_period || ''} onChange={(e) => handleCustomDaysChange(e.target.value.replace(/[^0-9]/g, ''))} placeholder="تعداد روز" className="w-28 text-center" />
                        <span className="text-sm text-gray-600">روز گذشته</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> تاریخ شروع</Label>
                        <PersianDatePicker value={currentFilter.startDate || ''} onChange={(value) => handleDateChange('startDate', value)} placeholder="انتخاب تاریخ" />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> تاریخ پایان</Label>
                        <PersianDatePicker value={currentFilter.endDate || ''} onChange={(value) => handleDateChange('endDate', value)} placeholder="انتخاب تاریخ" />
                      </div>
                    </div>
                  </div>

                  {shouldShowLocationFilters ? (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><MapPin className="h-4 w-4" /> مناطق <span className="text-red-500">*</span></Label>
                        {loadingRegions ? <SelectLoadingState /> : (
                          <MultiSelect options={availableRegions} value={currentFilter.regions?.map(r => String(r)) || []} onChange={(value) => handleFilterChange('regions', value)} placeholder="انتخاب مناطق" disabled={loadingRegions} />
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><Zap className="h-4 w-4" /> فیدرها <span className="text-red-500">*</span></Label>
                        {loadingFeeders ? <SelectLoadingState /> : (
                          <MultiSelect options={availableFeeders} value={currentFilter.feeders || []} onChange={(value) => handleFilterChange('feeders', value)} placeholder={(currentFilter.regions || []).length === 0 ? "ابتدا منطقه را انتخاب کنید" : "انتخاب فیدرها"} disabled={loadingFeeders || (currentFilter.regions || []).length === 0} />
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"><Building className="h-4 w-4" /> شرکت‌ها <span className="text-red-500">*</span></Label>
                        {loadingPrivateCompanies ? <SelectLoadingState /> : (
                          <MultiSelect 
                            options={availablePrivateCompanies} 
                            value={currentFilter.companyNames || []} 
                            onChange={(value) => handleFilterChange('companyNames', value)} 
                            placeholder="انتخاب شرکت یا شرکت‌ها" 
                            disabled={loadingPrivateCompanies} 
                          />
                        )}
                        {availablePrivateCompanies.length === 0 && !loadingPrivateCompanies && (
                          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            از داده‌های نمونه استفاده می‌شود
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col items-stretch">
                  {error && (
                    <div className="w-full bg-red-50 text-red-700 p-3 rounded-md mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}
                  <Button onClick={addFilter} className="w-full" disabled={loadingRegions || loadingFeeders || loadingPrivateCompanies}>
                    <Plus className="h-4 w-4 ml-2" />
                    افزودن به لیست فیلترها
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>

        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t bg-white">
          <Button variant="outline" onClick={() => { setFilters([]); localStorage.removeItem('dynamicFilters'); }} className="w-full sm:w-auto" disabled={filters.length === 0}>
            <Trash2 className="h-4 w-4 ml-2" />
            پاک کردن همه ({filters.length})
          </Button>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto">انصراف</Button>
            <Button onClick={handleApplyFilters} disabled={filters.length === 0} className="w-full sm:w-auto">
              <Search className="h-4 w-4 ml-2" />
              اعمال {filters.length} فیلتر
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DynamicFilterPanel;