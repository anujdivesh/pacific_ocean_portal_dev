// StoreProviderWrapper.tsx
"use client"; // Ensures that this is a client-side component
import React, { ReactNode } from 'react';
import dynamic from 'next/dynamic';
interface StoreProviderWrapperProps {
  children: ReactNode;  // This makes sure 'children' can be anything that can be rendered (string, number, JSX, etc.)
}
// Dynamically import the StoreProvider with SSR disabled
const StoreProvider = dynamic(() => import('@/app/GlobalRedux/provider'), { ssr: false });

const StoreProviderWrapper: React.FC<StoreProviderWrapperProps> = ({ children }) => {
  return (
    <StoreProvider>
      {children}
    </StoreProvider>
  );
};

export default StoreProviderWrapper; // Export it as default
