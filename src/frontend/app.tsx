/** @format */

import "./index.css";
import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import DashboardView from "./views/dashboard/dashboard";
import { AppSidebar } from "./components/ui/app-sidebar";
import ChromeView from "./views/chrome/chrome";
import ChromeCreateView from "./views/chrome/create/chrome-create";
import ChromeEditView from "./views/chrome/edit/chrome-edit";
import ChromeListView from "./views/chrome/list/chrome-list";
import LiveStreamView from "./views/livestream/livestream";
import SoundBoardView from "./views/sound-board/sound-board";
import SoundListView from "./views/sound-board/list/sound-list";
import SoundBoardCreateView from "./views/sound-board/create/sound-board-create";
import SoundboardEditView from "./views/sound-board/edit/sound-board-edit";
import SettingView from "./views/setting/setting";
import useChromeStore from "./hooks/use-chromes";
import useLiveStreamStore from "./hooks/use-livestream";
import { LoadingOverlay } from "./components/loading-overlay";

// import useChromeStore from "./stores/use-chrome-store"; // đảm bảo import đúng path

const root = createRoot(document.body);

const App = () => {
  const chromeStore = useChromeStore();
  // const liveStreamStore = useLiveStreamStore();

  useEffect(() => {
    backend.onListenCloseChromeByUser((driverIdClose: string) => {
      chromeStore.closeChromeProfileManual(driverIdClose);
    });
  }, []);

  useEffect(() => {
    chromeStore.resetStateChromeProfile();
    // liveStreamStore.reset();
  }, []);

  return (
    <HashRouter>
      <div className="flex h-screen w-screen overflow-hidden">
        <Toaster />
        <LoadingOverlay />

        <aside className="w-64 bg-gray-900 text-white p-4">
          <AppSidebar />
        </aside>
        <main className="flex-1 bg-gray-100 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<DashboardView />} />
            <Route path="/chrome" element={<ChromeView />}>
              <Route index element={<ChromeListView />} />
              <Route path="create" element={<ChromeCreateView />} />
              <Route path="edit/:id" element={<ChromeEditView />} />
            </Route>
            <Route path="/livestream" element={<LiveStreamView />} />
            <Route path="/sound" element={<SoundBoardView />}>
              <Route index element={<SoundListView />} />
              <Route path="create" element={<SoundBoardCreateView />} />
              <Route path="edit/:id" element={<SoundboardEditView />} />
            </Route>
            <Route path="/setting" element={<SettingView />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

root.render(<App />);
