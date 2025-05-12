// src/Layout.tsx
import { Outlet } from "react-router-dom";
import Header from "./Header"; // adjust the path if it's inside Play

export default function Layout() {
  return (
    <div>
      <Header />
      <main className="px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}