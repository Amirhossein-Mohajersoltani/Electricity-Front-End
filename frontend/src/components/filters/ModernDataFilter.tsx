// import React, { useState } from 'react';
// import { Calendar, Filter, ChevronDown } from 'lucide-react';
// import { Button } from '../ui/button';
// import { useLocation } from 'react-router-dom';

// // --- Interfaces (No changes) ---
// interface FilterData {
//   startDate: string;
//   endDate: string;
//   region: string;
//   feeder: string;
// }

// interface ModernDataFilterProps {
//   onFilterChange: (filters: FilterData) => void;
//   regions?: string[];
//   feeders?: string[];
// }

// // --- Component Definition ---
// const ModernDataFilter: React.FC<ModernDataFilterProps> = ({
//   onFilterChange,
//   regions = ['تهران', 'اصفهان', 'شیراز', 'تبریز', 'مشهد'],
//   feeders = ['فیدر 1', 'فیدر 2', 'فیدر 3', 'فیدر 4', 'فیدر 5']
// }) => {
//   // --- All Hooks must be at the top level ---
//   const location = useLocation(); // FIX 1: Use lowercase 'location'
  
//   const [filters, setFilters] = useState<FilterData>({
//     startDate: '',
//     endDate: '',
//     region: '',
//     feeder: ''
//   });

//   const [dropdownStates, setDropdownStates] = useState({
//     region: false,
//     feeder: false
//   });

//   const [isCustomInputVisible, setIsCustomInputVisible] = useState(false);
//   const [customValue, setCustomValue] = useState('');

//   const handleFilterChange = (key: keyof FilterData, value: string) => {
//     const newFilters = { ...filters, [key]: value };
//     setFilters(newFilters);
//   };

//   const handleApplyFilters = () => {
//     onFilterChange(filters);
//   };

//   const toggleDropdown = (dropdown: 'region' | 'feeder') => {
//     setDropdownStates(prev => ({ ...prev, [dropdown]: !prev[dropdown] }));
//   };

//   const selectOption = (dropdown: 'region' | 'feeder', value: string) => {
//     handleFilterChange(dropdown, value);
//     setDropdownStates(prev => ({ ...prev, [dropdown]: false }));
//   };

//   // Handlers for the conditional input
//   const handleCustomClick = () => {
//     setIsCustomInputVisible(true);
//   };

//   const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => { // FIX 2: Added type for 'event'
//     const numericValue = event.target.value.replace(/[^0-9]/g, '');
//     setCustomValue(numericValue);
//   };

//   // --- JSX Return ---
//   return (
//     <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6" dir="rtl">
//       {/* Header */}
//       <div className="flex items-center gap-3 mb-6">
//         <div className="p-2 bg-blue-50 rounded-lg">
//           <Filter className="h-5 w-5 text-blue-600" />
//         </div>
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900">فیلترهای جستجو</h3>
//           <p className="text-sm text-gray-500">انتخاب بازه زمانی و منطقه</p>
//         </div>
//       </div>

//       {/* Filter Controls */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//         {/* Start Date */}
//         <div className="space-y-2">
//           <label className="block text-sm font-medium text-gray-700">تاریخ شروع</label>
//           <div className="relative">
//             <input
//               type="text"
//               value={filters.startDate}
//               onChange={(e) => handleFilterChange('startDate', e.target.value)}
//               placeholder="1402/01/01"
//               className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
//             />
//             <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//           </div>
//         </div>

//         {/* End Date */}
//         <div className="space-y-2">
//           <label className="block text-sm font-medium text-gray-700">تاریخ پایان</label>
//           <div className="relative">
//             <input
//               type="text"
//               value={filters.endDate}
//               onChange={(e) => handleFilterChange('endDate', e.target.value)}
//               placeholder="1402/12/29"
//               className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
//             />
//             <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//           </div>
//         </div>

//         {/* Region Dropdown */}
//         <div className="space-y-2">
//           <label className="block text-sm font-medium text-gray-700">منطقه</label>
//           <div className="relative">
//             <button
//               onClick={() => toggleDropdown('region')}
//               className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right bg-white flex items-center justify-between"
//             >
//               <span className="text-gray-500">{filters.region || 'انتخاب منطقه'}</span>
//               <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${dropdownStates.region ? 'rotate-180' : ''}`} />
//             </button>
//             {dropdownStates.region && (
//               <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
//                 {regions.map((region) => (
//                   <button key={region} onClick={() => selectOption('region', region)} className="w-full px-4 py-3 text-right hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl">
//                     {region}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Feeder Dropdown */}
//         <div className="space-y-2">
//           <label className="block text-sm font-medium text-gray-700">فیدر</label>
//           <div className="relative">
//             <button
//               onClick={() => toggleDropdown('feeder')}
//               className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right bg-white flex items-center justify-between"
//             >
//               <span className="text-gray-500">{filters.feeder || 'انتخاب فیدر'}</span>
//               <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${dropdownStates.feeder ? 'rotate-180' : ''}`} />
//             </button>
//             {dropdownStates.feeder && (
//               <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
//                 {feeders.map((feeder) => (
//                   <button key={feeder} onClick={() => selectOption('feeder', feeder)} className="w-full px-4 py-3 text-right hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl">
//                     {feeder}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
        
//         {location.pathname === '/energy-comparison' && (
//             <div className="lg:col-span-4 md:col-span-2 col-span-1 space-y-2">
//                  <label className="block text-sm font-medium text-gray-700">بازه زمانی سریع</label>
//                  <div className="flex items-center gap-2 flex-wrap">
//                     <Button variant="outline">هفته</Button>
//                     <Button variant="outline">ماه</Button>
//                     <Button variant="outline">سال</Button>
//                     <Button variant="outline" onClick={handleCustomClick}>مقدار دلخواه</Button>
//                     {isCustomInputVisible && (
//                         <input
//                             type="text"
//                             pattern="[0-9]*"
//                             inputMode="numeric"
//                             value={customValue}
//                             onChange={handleInputChange}
//                             placeholder="یک عدد وارد کنید"
//                             className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         />
//                     )}
//                 </div>
//             </div>
//         )}
//       </div>

//       {/* Apply Button */}
//       <div className="flex justify-end">
//         <Button
//           onClick={handleApplyFilters}
//           className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
//         >
//           <Filter className="h-4 w-4" />
//           اعمال فیلترها
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default ModernDataFilter;