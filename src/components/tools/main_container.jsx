"use client";
import MapBox from "../map/get_map";
import React, { useEffect } from 'react';
import WelcomeModal from './welcomeModal'; 
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('../map/get_map'), { ssr: false });


export default function MainContainer() {

  useEffect(() => {
    // Only set default region if not already set
    if (!localStorage.getItem('selectedRegion')) {
      localStorage.setItem('selectedRegion', 1);
    }
  }, []);

return (
  <>
   <WelcomeModal />
 <MapComponent/>
  </>
);
}
