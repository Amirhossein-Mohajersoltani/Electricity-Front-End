import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Download, CheckCircle, X, AlertCircle, Send, Loader, Database, Table, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';
import apiService from '../services/api';
import { useAuth } from '../context/AuthContext';

interface CsvRow {
  [key: string]: string | number;
}

const CsvUpload: React.FC = () => {
  const { companyType } = useAuth();
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'validated' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadResult, setUploadResult] = useState<{ added: number; updated: number; skipped: number } | null>(null);

  // Expected CSV structure based on company type
  const getExpectedColumns = () => {
    if (companyType === 'private') {
      return [
        'fidder_id', 'is_off', 'date', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9', 'H10', 'H11', 'H12',
        'H13', 'H14', 'H15', 'H16', 'H17', 'H18', 'H19', 'H20', 'H21', 'H22', 'H23', 'H24'
      ];
    } else {
      return [
        'کد فیدر', 'تاریخ', 'تعطیلات', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7', 'H8', 'H9', 'H10', 'H11', 'H12',
        'H13', 'H14', 'H15', 'H16', 'H17', 'H18', 'H19', 'H20', 'H21', 'H22', 'H23', 'H24', 'مجموع',
        'خانگی', 'صنعتی', 'کشاورزی', 'تجاری', 'روشنایی', 'اداری', 'ناحیه'
      ];
    }
  };

  const expectedColumns = getExpectedColumns();

  // Sample data based on company type
  const getSampleData = () => {
    if (companyType === 'private') {
      return {
        'fidder_id': '1',
        'is_off': '1',
        'date': '3/20/2024',
        'H1': '31',
        'H2': '31.2',
        'H3': '31.8',
        'H4': '31.8',
        'H5': '32',
        'H6': '32.2',
        'H7': '32',
        'H8': '27.2',
        'H9': '26.4',
        'H10': '26.6',
        'H11': '25.4',
        'H12': '26',
        'H13': '26.2',
        'H14': '26',
        'H15': '26',
        'H16': '26',
        'H17': '25.4',
        'H18': '25.4',
        'H19': '30.8',
        'H20': '31.8',
        'H21': '32',
        'H22': '33.4',
        'H23': '32.8',
        'H24': '33.4'
      };
    } else {
      return {
        'کد فیدر': '1',
        'تاریخ': '1440/01/02',
        'تعطیلات': '1',
        'H1': '2.576',
        'H2': '2.312',
        'H3': '2.119',
        'H4': '2.018',
        'H5': '1.954',
        'H6': '1.877',
        'H7': '1.863',
        'H8': '1.901',
        'H9': '2.016',
        'H10': '2.162',
        'H11': '2.314',
        'H12': '2.372',
        'H13': '2.407',
        'H14': '2.373',
        'H15': '2.305',
        'H16': '2.255',
        'H17': '2.287',
        'H18': '2.489',
        'H19': '2.816',
        'H20': '2.877',
        'H21': '2.883',
        'H22': '2.9',
        'H23': '2.866',
        'H24': '2.742',
        'مجموع': '56.684',
        'خانگی': '0.4',
        'صنعتی': '0.25',
        'کشاورزی': '0.1',
        'تجاری': '0.12',
        'روشنایی': '0.1',
        'اداری': '0.03',
        'ناحیه': '5'
      };
    }
  };

  const sampleData = getSampleData();

  // Get sample headers for display
  const getSampleHeaders = () => {
    if (companyType === 'private') {
      return [
        'fidder_id', 'is_off', 'date', 'H1', 'H2', 'H3', '...', 'H24'
      ];
    } else {
      return [
        'کد فیدر', 'تاریخ', 'تعطیلات', 'H1', 'H2', 'H3', '...', 'H24', 'مجموع', 'خانگی', 'صنعتی', 'ناحیه'
      ];
    }
  };

  const sampleHeaders = getSampleHeaders();

  const parseCsv = (text: string): CsvRow[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const row: CsvRow = {};
      headers.forEach((header, index) => {
        row[header.trim()] = values[index]?.trim() || '';
      });
      return row;
    });
  };

  const validateCsv = (data: CsvRow[]): boolean => {
    if (data.length === 0) {
      setErrorMessage('فایل CSV خالی است');
      return false;
    }

    const fileColumns = Object.keys(data[0]);
    const missingColumns = expectedColumns.filter(col => !fileColumns.includes(col));
    
    if (missingColumns.length > 0) {
      setErrorMessage(`ستون‌های مورد نیاز یافت نشد: ${missingColumns.join(', ')}`);
      return false;
    }

    return true;
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadStatus('idle');
    setErrorMessage('');
    setUploadResult(null);

    try {
      const text = await file.text();
      const parsedData = parseCsv(text);
      
      if (validateCsv(parsedData)) {
        setCsvData(parsedData);
        setUploadedFile(file);
        setUploadStatus('validated');
      } else {
        setUploadStatus('error');
      }
    } catch (error) {
      setErrorMessage('خطا در خواندن فایل');
      setUploadStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadToServer = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    setUploadStatus('uploading');
    setErrorMessage('');

    try {
      const response = await apiService.uploadCsv(uploadedFile);
      
      if (response.status === 'success') {
        setUploadStatus('success');
        setUploadResult(response.data || { added: 0, updated: 0, skipped: 0 });
      } else {
        setUploadStatus('error');
        setErrorMessage(response.message || 'خطا در آپلود فایل');
      }
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage('خطا در ارسال فایل به سرور');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1
  });

  const downloadSample = () => {
    // Use the appropriate sample file based on company type
    const link = document.createElement('a');
    const fileName = companyType === 'private' ? 'sample-private.csv' : 'sample-public.csv';
    link.href = `/${fileName}`;
    link.download = fileName;
    link.click();
  };

  const clearData = () => {
    setCsvData([]);
    setUploadedFile(null);
    setUploadStatus('idle');
    setErrorMessage('');
    setUploadResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Database className="h-8 w-8 text-blue-600" />
              آپلود اطلاعات
            </h1>
            <p className="text-gray-600">
              {companyType === 'private' 
                ? 'از این بخش می‌توانید اطلاعات مصرف برق خط تولید و داده‌های مصرف شرکت خود را به سیستم وارد کنید'
                : 'از این بخش می‌توانید اطلاعات مصرف برق، داده‌های فیدر و سایر اطلاعات مورد نیاز را به سیستم وارد کنید'
              }
            </p>
          </div>

          {/* Sample Data Table */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Table className="h-5 w-5 text-blue-600" />
              نمونه ساختار فایل CSV
            </h3>
            <p className="text-gray-600 mb-4">
              فایل شما باید دقیقاً مطابق با ساختار زیر باشد:
            </p>
            
            {/* Sample Table */}
            <div className="overflow-x-auto bg-gray-50 rounded-lg p-4 mb-4">
              <table className="min-w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-blue-50">
                    {sampleHeaders.map((header, index) => (
                      <th key={header} className="border border-gray-300 px-2 py-1 text-center font-medium text-gray-700">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    {sampleHeaders.map((header, i) => (
                      <td key={i} className="border border-gray-300 px-2 py-1 text-center">
                        {header === '...' ? '...' : sampleData[header as keyof typeof sampleData] || ''}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <p className="mb-1">• فایل باید شامل تمام ستون‌ها باشد</p>
                <p className="mb-1">• ترتیب ستون‌ها مهم است</p>
                <p className="mb-1">• داده‌ها باید با کاما (,) جدا شوند</p>
                <p className="mb-1 text-red-600 font-medium">• مقادیر مصرف بر حسب مگاوات (MW) است</p>
                {companyType === 'private' ? (
                  <p className="text-blue-600">• تاریخ به صورت میلادی (3/20/2024)</p>
                ) : (
                  <p className="text-blue-600">• تاریخ به صورت شمسی (1440/01/02)</p>
                )}
              </div>
              <Button
                variant="outline"
                onClick={downloadSample}
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              >
                <Download className="h-4 w-4" />
                دانلود فایل نمونه
              </Button>
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">آپلود فایل CSV</h2>
            </div>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} disabled={isProcessing} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-lg text-blue-600">فایل را اینجا رها کنید...</p>
              ) : (
                <div>
                  <p className="text-lg text-gray-600 mb-2">
                    {isProcessing ? 'در حال پردازش...' : 'فایل CSV را اینجا بکشید یا کلیک کنید'}
                  </p>
                  <p className="text-sm text-gray-500">
                    فقط فایل‌های CSV پذیرفته می‌شوند (حداکثر حجم: 10MB)
                  </p>
                </div>
              )}
            </div>

            {/* Upload Status */}
            {uploadStatus === 'validated' && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-blue-800 font-medium">فایل معتبر است و آماده آپلود</p>
                    <p className="text-blue-600 text-sm">
                      فایل: {uploadedFile?.name} ({csvData.length} ردیف)
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleUploadToServer}
                    disabled={isUploading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isUploading ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {isUploading ? 'در حال آپلود...' : 'ارسال به سرور'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearData}
                    disabled={isUploading}
                    className="text-gray-600 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                    لغو
                  </Button>
                </div>
              </div>
            )}

            {uploadStatus === 'uploading' && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
                <Loader className="h-5 w-5 text-yellow-600 animate-spin" />
                <div className="flex-1">
                  <p className="text-yellow-800 font-medium">در حال ارسال فایل به سرور...</p>
                  <p className="text-yellow-600 text-sm">
                    لطفاً منتظر بمانید، این عملیات ممکن است چند دقیقه طول بکشد
                  </p>
                </div>
              </div>
            )}

            {uploadStatus === 'success' && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-green-800 font-medium">فایل با موفقیت آپلود و پردازش شد</p>
                    <p className="text-green-600 text-sm">
                      فایل: {uploadedFile?.name} ({csvData.length} ردیف)
                    </p>
                  </div>
                </div>
                {uploadResult && (
                  <div className="bg-white p-3 rounded border border-green-200 mb-3">
                    <h4 className="font-medium text-gray-700 mb-2">نتایج پردازش:</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{uploadResult.added}</div>
                        <div className="text-gray-600">ردیف جدید</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{uploadResult.updated}</div>
                        <div className="text-gray-600">ردیف بروزرسانی</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">{uploadResult.skipped}</div>
                        <div className="text-gray-600">ردیف نادیده گرفته</div>
                      </div>
                    </div>
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={clearData}
                  className="text-gray-600 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                  پاک کردن
                </Button>
              </div>
            )}

            {uploadStatus === 'error' && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <p className="text-red-800 font-medium">خطا در آپلود فایل</p>
                  <p className="text-red-600 text-sm">{errorMessage}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={clearData}
                  className="text-gray-600 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                  پاک کردن
                </Button>
              </div>
            )}
          </div>

          {/* CSV Structure Guide */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              راهنمای ستون‌ها
            </h3>
            {companyType === 'private' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">اطلاعات کلی:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>fidder_id:</strong> شناسه خط تولید</li>
                    <li>• <strong>date:</strong> تاریخ (3/20/2024)</li>
                    <li>• <strong>is_off:</strong> 0 (روز کاری) یا 1 (تعطیل)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">مصرف ساعتی:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>H1 تا H24:</strong> مصرف هر ساعت روز</li>
                    <li>• مقادیر با اعشار مجاز</li>
                    <li>• واحد: مگاوات ساعت</li>
                    <li>• برای خطوط تولید کارخانه</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">اطلاعات کلی:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>کد فیدر:</strong> شناسه فیدر</li>
                    <li>• <strong>تاریخ:</strong> تاریخ شمسی (1440/01/02)</li>
                    <li>• <strong>تعطیلات:</strong> 0 (روز کاری) یا 1 (تعطیل)</li>
                    <li>• <strong>ناحیه:</strong> کد ناحیه</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">مصرف ساعتی:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>H1 تا H24:</strong> مصرف هر ساعت روز</li>
                    <li>• <strong>مجموع:</strong> کل مصرف روزانه</li>
                    <li>• مقادیر با اعشار مجاز</li>
                    <li>• واحد: مگاوات ساعت</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">تعرفه‌ها:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>خانگی:</strong> ضریب مصرف خانگی</li>
                    <li>• <strong>صنعتی:</strong> ضریب مصرف صنعتی</li>
                    <li>• <strong>کشاورزی:</strong> ضریب کشاورزی</li>
                    <li>• <strong>تجاری، روشنایی، اداری</strong></li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Data Preview */}
          {csvData.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">پیش‌نمایش داده‌های آپلود شده</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(csvData[0]).slice(0, 8).map(header => (
                        <th key={header} className="px-3 py-2 text-right text-gray-700 font-medium border">
                          {header}
                        </th>
                      ))}
                      <th className="px-3 py-2 text-right text-gray-700 font-medium border">...</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {csvData.slice(0, 5).map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {Object.values(row).slice(0, 8).map((value, i) => (
                          <td key={i} className="px-3 py-2 text-gray-900 border">
                            {value}
                          </td>
                        ))}
                        <td className="px-3 py-2 text-gray-500 border">...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {csvData.length > 5 && (
                <p className="text-sm text-gray-500 mt-4 text-center">
                  و {csvData.length - 5} ردیف دیگر...
                </p>
              )}
            </div>
          )}
        </div>
      </div>
  );
};

export default CsvUpload; 