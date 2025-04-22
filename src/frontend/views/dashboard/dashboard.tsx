/** @format */

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const DashboardView = () => {
  const [chromeProfiles, setChromeProfiles] = useState([]);
  const [seedingStatus, setSeedingStatus] = useState({
    totalComments: 0,
    errors: 0,
  });

  useEffect(() => {
    setChromeProfiles([
      { name: "Hồ sơ Chrome 1", status: "Đang hoạt động" },
      { name: "Hồ sơ Chrome 2", status: "Không hoạt động" },
    ]);
    setSeedingStatus({ totalComments: 120, errors: 2 });
  }, []);

  return (
    <div className="px-4 sm:px-8 py-6 space-y-10">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
        Trang Tổng Quan
      </h1>

      {/* Hồ sơ Chrome */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Hồ Sơ Tiktok Chrome
          </h2>
          <Link to="/chrome/create">
            <Button size="sm" className="flex items-center gap-1">
              <Plus size={16} />
              <span className="text-sm">Tạo mới</span>
            </Button>
          </Link>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {chromeProfiles.map((profile, index) => (
            <li
              key={index}
              className="flex justify-between items-center p-4 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition">
              <span className="text-sm font-medium text-gray-700">
                {profile.name}
              </span>
              <span
                className={`text-xs font-semibold ${
                  profile.status === "Đang hoạt động"
                    ? "text-green-600"
                    : "text-red-500"
                }`}>
                {profile.status}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Tình trạng seeding */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Tình Trạng Seeding
        </h2>
        <div className="p-4 bg-white rounded-lg shadow border border-gray-200 space-y-1 text-sm">
          <p className="text-gray-700">
            <span className="font-medium">Tổng bình luận đã gửi:</span>{" "}
            {seedingStatus.totalComments}
          </p>
          <p className="text-red-600">
            <span className="font-medium">Số lỗi:</span> {seedingStatus.errors}
          </p>
        </div>
      </section>
    </div>
  );
};

export default DashboardView;
