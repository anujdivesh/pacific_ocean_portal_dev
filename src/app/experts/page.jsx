'use client'
import dynamic from 'next/dynamic';
// Dynamically import the ExpertsClient component with SSR disabled to avoid window is not defined errors
const ExpertsClient = dynamic(() => import('./ExpertsClient'), { ssr: false });

export default function ExpertsPage() {
  return <ExpertsClient />;
}