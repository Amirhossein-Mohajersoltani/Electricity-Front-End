import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import {
  LayoutDashboard,
  TrendingUp,
  Activity,
  Menu,
  LogOut,
  Settings,
  Users,
  Upload,
  PieChart,
  ChevronRight,
  TrendingDown
} from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const { userEmail, logout, companyType } = useAuth();

  // Extract user name from email
  const getUserName = (email: string | null): string => {
    if (!email) return 'کاربر';
    const name = email.split('@')[0];
    if (name === 'techie') return 'مهندس توزیع برق';
    if (name === 'flour.company') return 'مدیر شرکت';
    return name;
  };

  // Get user emoji based on email
  const getUserEmoji = (email: string | null): string => {
    if (!email) return '👤';
    const name = email.split('@')[0];
    if (name === 'techie') return '👨‍💻';
    if (name === 'flour.company') return '🏭';
    return '👤';
  };

  const getCompanyBadge = (companyType: 'public' | 'private' | 'admin') => {
    if (companyType === 'private') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          شرکت خصوصی
        </span>
      );
    } else if (companyType === 'admin') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          پنل ادمین
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        شرکت عمومی
      </span>
    );
  };

  const getNavigation = (type: 'public' | 'private' | 'admin'): NavigationItem[] => {
    const baseNavigation: NavigationItem[] = [
      { name: "داشبورد کلی", href: "/dashboard", icon: LayoutDashboard },
      { name: "تحلیل مصرف انرژی", href: "/feeder-analysis", icon: Activity },
      { name: "مقایسه مصرف انرژی", href: "/energy-comparison", icon: TrendingUp },
    ];

    if (type === 'private') {
      return [
        ...baseNavigation,
        { name: "تحلیل محدودیت مصرف انرژی", href: "/consumption-limitation", icon: TrendingDown },
        { name: "آپلود اطلاعات", href: "/csv-upload", icon: Upload },
      ];
    }
    
    if (type === 'public') {
      return [
        ...baseNavigation,
        { name: "سهم تعرفه‌ها", href: "/tariff-share", icon: PieChart },
        { name: "تحلیل محدودیت مصرف انرژی", href: "/consumption-limitation", icon: TrendingDown },
        { name: "آپلود اطلاعات", href: "/csv-upload", icon: Upload },
      ];
    }
    
    if (type === 'admin') {
      return [
        ...baseNavigation,
        { name: "تحلیل محدودیت مصرف انرژی", href: "/consumption-limitation", icon: TrendingDown },
        { name: "آپلود اطلاعات", href: "/csv-upload", icon: Upload },
        { name: "مدیریت کاربران", href: "/user-management", icon: Users }, 
      ];
    }

    return baseNavigation; 
  };

  const navigation = getNavigation(companyType);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={cn(
        "fixed inset-y-0 right-0 z-50 w-80 bg-black text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 rounded-3xl m-3",
        sidebarOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6 justify-between">
          {/* Top Section */}
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex items-center justify-center">
              <h1 className="text-white text-xl font-bold text-center">
                سامانه تحلیل مصرف انرژی
              </h1>
            </div>

            <div className="h-px bg-white/20"></div>

            <div className="space-y-4">
              <p className="text-white/70 text-sm text-right" dir="rtl">منوی اصلی</p>

              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all",
                        isActive
                          ? "bg-white/10 text-white shadow-lg"
                          : "text-white hover:bg-white/5"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <Icon className="h-4 w-4" />
                        <span className="flex-1 text-right">{item.name}</span>
                        {isActive && (
                          <ChevronRight className="h-5 w-5 rotate-180" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center text-lg">
                  {getUserEmoji(userEmail)}
                </div>
                <div className="text-right flex-1">
                  <p className="font-semibold text-sm">{getUserName(userEmail)}</p>
                  <p className="text-white/80 text-xs">{userEmail}</p>
                  <div className="mt-1">
                    {getCompanyBadge(companyType)}
                  </div>
                </div>
              </div>

              <div className="h-px bg-white/20"></div>

              <div className="flex items-center justify-between" dir="rtl">
                <span className="text-white text-sm">تم روشن</span>
                <div className="flex items-center gap-2 bg-white/20 rounded-full p-1">
                  <Switch
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                    className="data-[state=checked]:bg-white data-[state=unchecked]:bg-transparent scale-75"
                  />
                </div>
              </div>

              <div className="h-px bg-white/20"></div>

              <div className="space-y-2">
                <Link
                  to="/settings"
                  className="w-full flex text-white hover:bg-white/10 h-auto py-2 px-3 rounded-xl transition-all text-sm"
                >
                  <div className="flex items-center gap-2 w-full">
                    <Settings className="h-4 w-4" />
                    <span className="flex-1 text-right">تنظیمات</span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex text-white hover:bg-white/10 h-auto py-2 px-3 rounded-xl transition-all text-sm"
                >
                  <div className="flex items-center gap-2 w-full">
                    <LogOut className="h-4 w-4" />
                    <span className="flex-1 text-right">خروج از سامانه</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 lg:mr-6">
        <div className="lg:hidden">
          <div className="flex items-center justify-between h-16 px-4 bg-white shadow-sm border-b">
            <Button
              variant="outline"
              className="p-2"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium text-gray-900">
              پورتال انرژی
            </h1>
            <div />
          </div>
        </div>

        <main className="flex-1 p-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;