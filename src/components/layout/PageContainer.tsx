import React from "react";

// Standardized page container for consistent margins/paddings
const PageContainer: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="px-6 py-10 w-full mx-auto">{children}</div>
);

export default PageContainer;
