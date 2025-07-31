// // src/components/filters/DataFilter.tsx
// //import { Calendar } from "../ui/calender"
// import { Input } from "../ui/input"
// import { Button } from "../ui/button"
// import { Card } from "../ui/CardWrapper"
// import { useState, useEffect } from "react"
// import { apiService } from "../../services/api"

// interface FilterData {
//   region_code: string;
//   fidder_code: string;
//   start_date: string;
//   end_date: string;
// }

// interface DataFilterProps {
//   onFilter?: (data: FilterData) => void;
//   loading?: boolean;
// }

// const DataFilter = ({ onFilter, loading = false }: DataFilterProps) => {
//   const [region, setRegion] = useState("")
//   const [feederCode, setFeederCode] = useState("")
//   const [startDate, setStartDate] = useState("")
//   const [endDate, setEndDate] = useState("")
  
//   const [regions, setRegions] = useState<string[]>([]);
//   const [feeders, setFeeders] = useState<string[]>([]);
//   const [dataLoading, setDataLoading] = useState(false);

//   // Load initial data (all regions and feeders)
//   useEffect(() => {
//     loadInitialData();
//   }, []);

//   // Load feeders when region changes
//   useEffect(() => {
//     if (region) {
//       loadFeedersByRegion(region);
//     }
//   }, [region]);

//   const loadInitialData = async () => {
//     setDataLoading(true);
//     try {
//       const response = await apiService.getFidderRegion();
//       if (response.status === 'success' && response.data) {
//         setRegions(response.data.regions || []);
//         setFeeders(response.data.fidders || []); // Backend returns 'fidders' not 'feeders'
//       }
//     } catch (error) {
//       console.error('Error loading initial data:', error);
//     } finally {
//       setDataLoading(false);
//     }
//   };

//   const loadFeedersByRegion = async (regionCode: string) => {
//     try {
//       const response = await apiService.getFidderRegion({ region_code: regionCode });
//       if (response.status === 'success' && response.data) {
//         setFeeders(response.data.fidders || []); // Backend returns 'fidders' not 'feeders'
//         // Reset feeder selection when region changes
//         setFeederCode('');
//       }
//     } catch (error) {
//       console.error('Error loading feeders by region:', error);
//     }
//   };

//   const handleSearch = () => {
//     const filterData: FilterData = {
//       region_code: region,
//       fidder_code: feederCode,
//       start_date: startDate,
//       end_date: endDate
//     };
    
//     console.log("Searching with:", filterData);
    
//     if (onFilter) {
//       onFilter(filterData);
//     }
//   }

//   return (
//     <Card className="p-6 w-full rounded-3xl shadow-sm border border-gray-100 bg-white">
//       <div className="space-y-6 text-right font-ahang">
//         <h3 className="font-bold text-gray-900 text-xl mb-6">فیلترداده ها</h3>
        
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">منطقه</label>
//             <select
//               value={region}
//               onChange={(e) => setRegion(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 text-right appearance-none bg-gray-50"
//               disabled={dataLoading}
//             >
//               <option value="">انتخاب منطقه</option>
//               {regions.map((regionItem) => (
//                 <option key={regionItem} value={regionItem}>
//                   {regionItem}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">فیدر</label>
//             <select
//               value={feederCode}
//               onChange={(e) => setFeederCode(e.target.value)}
//               className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 text-right appearance-none bg-gray-50"
//               disabled={dataLoading || !feeders.length}
//             >
//               <option value="">انتخاب فیدر</option>
//               {feeders.map((feeder) => (
//                 <option key={feeder} value={feeder}>
//                   {feeder}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ شروع</label>
//             <Input 
//               value={startDate}
//               onChange={(e) => setStartDate(e.target.value)}
//               type="text" 
//               placeholder="1402-01-01" 
//               className="text-right border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">تاریخ پایان</label>
//             <Input 
//               value={endDate}
//               onChange={(e) => setEndDate(e.target.value)}
//               type="text" 
//               placeholder="1402-12-29" 
//               className="text-right border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
//             />
//           </div>
//         </div>

//         <Button 
//           onClick={handleSearch}
//           className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors"
//           disabled={loading || dataLoading}
//         >
//           {loading || dataLoading ? 'در حال بارگذاری...' : 'جستجو'}
//         </Button>
//       </div>
//     </Card>
//   );
// };

// export default DataFilter;
