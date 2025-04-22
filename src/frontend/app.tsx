/** @format */

import "./index.css";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";

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

const root = createRoot(document.body);

root.render(
  <HashRouter>
    <div className="flex h-screen w-screen overflow-hidden">
      <aside className="w-64 bg-gray-900 text-white p-4">
        <AppSidebar />
      </aside>
      <main className="flex-1 bg-gray-100 p-6 overflow-auto">
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="chrome" element={<ChromeView />}>
            {/* Nested Routes */}
            <Route index element={<ChromeListView />} />
            <Route path="create" element={<ChromeCreateView />} />
            <Route
              path="edit/:id"
              element={<ChromeEditView></ChromeEditView>}
            />
          </Route>
          <Route path="/livestream" element={<LiveStreamView />} />

          <Route path="/sound" element={<SoundBoardView />}>
            <Route index element={<SoundListView />} />
            <Route path="create" element={<SoundBoardCreateView />}></Route>
            <Route path="edit/:id" element={<SoundboardEditView />}></Route>
          </Route>
        </Routes>
      </main>
    </div>
  </HashRouter>
);
