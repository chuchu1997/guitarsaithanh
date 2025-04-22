/** @format */

import { Home, LayoutDashboard, Settings } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

export const AppSidebar = () => {
  return (
    <aside className="h-full w-64 bg-gray-900 text-white flex flex-col p-6 shadow-lg">
      <div className="text-2xl font-semibold mb-8 tracking-wide">
        Guitar Sài Thành Tool
      </div>

      <nav className="space-y-2">
        <SidebarItem icon={Home} label="Bảng điều kiển" to="/" />
        <SidebarItem
          icon={LayoutDashboard}
          label="Nick Tiktok (Chrome) "
          to="/chrome"
        />
        <SidebarItem icon={Settings} label="Live Stream " to="/livestream" />
        <SidebarItem
          icon={Settings}
          label="Âm thanh bè livestream "
          to="/sound"
        />
      </nav>

      <div className="mt-auto text-sm text-gray-400 pt-6 border-t border-gray-700">
        <p>© 2025 Nguyễn Cường Tool</p>
      </div>
    </aside>
  );
};

type SidebarItemProps = {
  icon: React.ElementType;
  label: string;
  to: string;
};

const SidebarItem = ({ icon: Icon, label, to }: SidebarItemProps) => {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200">
      <Icon className="w-5 h-5 text-gray-400" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};
