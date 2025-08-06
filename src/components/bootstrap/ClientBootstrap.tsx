"use client"; // Mark this as a Client Component
import dynamic from 'next/dynamic';

// Dynamically import InstallBootstrap with SSR disabled
const InstallBootstrap = dynamic(() => import('@/components/bootstrap/InstallBootstrap'), {
  ssr: false, // Disable SSR for this component
});

export default function ClientBootstrap() {
  return <InstallBootstrap />;
}