import React from "react";

interface LayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ sidebar, children }) => (
  <div style={{ display: "flex", minHeight: "100vh" }}>
    <aside style={{ width: 240, background: "#f4f4f4", padding: 24, borderRight: "1px solid #ddd" }}>
      {sidebar}
    </aside>
    <main style={{ flex: 1, padding: 32, background: "#fafbfc" }}>
      {children}
    </main>
  </div>
);
