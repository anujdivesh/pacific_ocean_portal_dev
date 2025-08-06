'use client';
import { configureStore } from '@reduxjs/toolkit'

import datasetReducer from '@/app/GlobalRedux/Features/dataset/dataSlice'
import modalReducer from '@/app/GlobalRedux/Features/modal/modalSlice'
import accordionReducer from '@/app/GlobalRedux/Features/accordion/accordionSlice'
import mapReducer from '@/app/GlobalRedux/Features/map/mapSlice'
import offcanvasReducer from '@/app/GlobalRedux/Features/offcanvas/offcanvasSlice'
import sideoffcanvasReducer from '@/app/GlobalRedux/Features/sideoffcanvas/sideoffcanvasSlice';
import countryReducer from '@/app/GlobalRedux/Features/country/countrySlice';
import coordinateReducer from '@/app/GlobalRedux/Features/coordinate/mapSlice'
import authReducer from '@/app/GlobalRedux/Features/auth/authSlice'

export const store = configureStore({
    reducer: {
        dataset_list:datasetReducer,
        modal: modalReducer,
        accordion: accordionReducer,
        mapbox: mapReducer,
        offcanvas:offcanvasReducer,
        sideoffcanvas:sideoffcanvasReducer,
        country:countryReducer,
        coordinate:coordinateReducer,
        auth: authReducer,
    }
})

/*
export const makeStore = () => {
  return configureStore({
    reducer: {}
  })
}
*/
