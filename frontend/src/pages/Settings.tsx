import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Lock, Bell, Database, Palette, Shield, Save, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { useAuth } from '../context/AuthContext';

interface SettingsState {
  profile: {
    name: string;
    email: string;
    region: string;
    role: string;
  };
  notifications: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    dataUpdates: boolean;
    systemAlerts: boolean;
  };
  preferences: {
    darkMode: boolean;
    language: string;
    dateFormat: string;
    timezone: string;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordExpiry: boolean;
  };
}

const Settings: React.FC = () => {
  const { userEmail } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get user name from email
  const getUserName = (email: string | null): string => {
    if (!email) return 'کاربر'
    const name = email.split('@')[0]
    return name === 'techie' ? 'مهندس فنی' : name
  }

  // Get user role from email
  const getUserRole = (email: string | null): string => {
    if (!email) return 'کاربر'
    const name = email.split('@')[0]
    return name === 'techie' ? 'مهندس فنی' : 'کاربر سیستم'
  }
  
  const [settings, setSettings] = useState<SettingsState>({
    profile: {
      name: getUserName(userEmail),
      email: userEmail || '',
      region: 'تهران',
      role: getUserRole(userEmail)
    },
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      dataUpdates: true,
      systemAlerts: true
    },
    preferences: {
      darkMode: false,
      language: 'fa',
      dateFormat: 'shamsi',
      timezone: 'Asia/Tehran'
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: true
    }
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleSettingChange = (category: keyof SettingsState, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    // Save settings logic here
    console.log('Settings saved:', settings);
  };

  const tabs = [
    { id: 'profile', label: 'پروفایل', icon: User },
    { id: 'security', label: 'امنیت', icon: Shield },
    { id: 'notifications', label: 'اعلان‌ها', icon: Bell },
    { id: 'preferences', label: 'تنظیمات', icon: Palette }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <SettingsIcon className="h-8 w-8" />
            تنظیمات
          </h1>
          <p className="text-gray-600">
            تنظیمات حساب کاربری و سیستم را مدیریت کنید
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-right rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">اطلاعات پروفایل</h2>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          نام و نام خانوادگی
                        </label>
                        <input
                          type="text"
                          value={settings.profile.name}
                          onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ایمیل
                        </label>
                        <input
                          type="email"
                          value={settings.profile.email}
                          onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ناحیه
                        </label>
                        <select
                          value={settings.profile.region}
                          onChange={(e) => handleSettingChange('profile', 'region', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="تهران">تهران</option>
                          <option value="اصفهان">اصفهان</option>
                          <option value="شیراز">شیراز</option>
                          <option value="تبریز">تبریز</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          نقش
                        </label>
                        <input
                          type="text"
                          value={settings.profile.role}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">تنظیمات امنیتی</h2>
                  <div className="space-y-6">
                    {/* Security Options */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">احراز هویت دو مرحله‌ای</h4>
                          <p className="text-sm text-gray-500">امنیت بیشتر با احراز هویت دو مرحله‌ای</p>
                        </div>
                        <Switch
                          checked={settings.security.twoFactorAuth}
                          onCheckedChange={(checked: boolean) => handleSettingChange('security', 'twoFactorAuth', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">انقضای خودکار رمز عبور</h4>
                          <p className="text-sm text-gray-500">رمز عبور هر 3 ماه منقضی شود</p>
                        </div>
                        <Switch
                          checked={settings.security.passwordExpiry}
                          onCheckedChange={(checked: boolean) => handleSettingChange('security', 'passwordExpiry', checked)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          مدت زمان نشست (دقیقه)
                        </label>
                        <select
                          value={settings.security.sessionTimeout}
                          onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={15}>15 دقیقه</option>
                          <option value={30}>30 دقیقه</option>
                          <option value={60}>1 ساعت</option>
                          <option value={120}>2 ساعت</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">تنظیمات اعلان‌ها</h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">اعلان‌های ایمیل</h4>
                        <p className="text-sm text-gray-500">دریافت اعلان‌های مهم از طریق ایمیل</p>
                      </div>
                      <Switch
                        checked={settings.notifications.emailAlerts}
                        onCheckedChange={(checked: boolean) => handleSettingChange('notifications', 'emailAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">اعلان‌های پیامکی</h4>
                        <p className="text-sm text-gray-500">دریافت اعلان‌های فوری از طریق پیامک</p>
                      </div>
                      <Switch
                        checked={settings.notifications.smsAlerts}
                        onCheckedChange={(checked: boolean) => handleSettingChange('notifications', 'smsAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">به‌روزرسانی داده‌ها</h4>
                        <p className="text-sm text-gray-500">اعلان زمان به‌روزرسانی داده‌های جدید</p>
                      </div>
                      <Switch
                        checked={settings.notifications.dataUpdates}
                        onCheckedChange={(checked: boolean) => handleSettingChange('notifications', 'dataUpdates', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">هشدارهای سیستم</h4>
                        <p className="text-sm text-gray-500">اعلان خرابی‌ها و مشکلات سیستم</p>
                      </div>
                      <Switch
                        checked={settings.notifications.systemAlerts}
                        onCheckedChange={(checked: boolean) => handleSettingChange('notifications', 'systemAlerts', checked)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">تنظیمات عمومی</h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">حالت تاریک</h4>
                        <p className="text-sm text-gray-500">استفاده از تم تاریک برای رابط کاربری</p>
                      </div>
                      <Switch
                        checked={settings.preferences.darkMode}
                        onCheckedChange={(checked: boolean) => handleSettingChange('preferences', 'darkMode', checked)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        زبان سیستم
                      </label>
                      <select
                        value={settings.preferences.language}
                        onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="fa">فارسی</option>
                        <option value="en">انگلیسی</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        فرمت تاریخ
                      </label>
                      <select
                        value={settings.preferences.dateFormat}
                        onChange={(e) => handleSettingChange('preferences', 'dateFormat', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="shamsi">شمسی (1402/08/15)</option>
                        <option value="gregorian">میلادی (2023/11/06)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        منطقه زمانی
                      </label>
                      <select
                        value={settings.preferences.timezone}
                        onChange={(e) => handleSettingChange('preferences', 'timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Asia/Tehran">تهران (UTC+3:30)</option>
                        <option value="Asia/Dubai">امارات (UTC+4:00)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex gap-4">
                  <Button
                    variant="default"
                    onClick={handleSave}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    ذخیره تغییرات
                  </Button>
                  <Button variant="outline">
                    انصراف
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 