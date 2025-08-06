'use client';
import React, { useState, useRef, useEffect } from 'react';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { hideoffCanvas } from '@/app/GlobalRedux/Features/offcanvas/offcanvasSlice';
import { useAppDispatch, useAppSelector } from '@/app/GlobalRedux/hooks';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import { Button } from 'react-bootstrap';
import 'chart.js/auto';
import Timeseries from './timeseries'; 
import Tabular from './tablular'; 
import DynamicImage from './getMap';
import Download from './download';
import TimeseriesWfs from './timeseries_wfs';
import TimeseriesSofar from './timeseries_sofar';
import TideImageComponent from './tide_image';
import Histogram from './histogram';

function BottomOffCanvas({ isVisible, id }) {
  const currentId = useAppSelector((state) => state.offcanvas.currentId);
  const mapLayer = useAppSelector((state) => state.mapbox.layers);
  const [layerType, setLayerType] = useState('');
  
  useEffect(() => {
    if (currentId === id) {
      // var layer_type = mapLayer[mapLayer.length - 1]?.layer_information.layer_type; // kunal thinking.. :P : i think what this does is gets last layer only 
      //24 == 24
      const selectedLayer = mapLayer.find(layer => 
        layer.id === currentId ||  
        (layer.layer_information && layer.layer_information.id === currentId)
      );
      
      if (selectedLayer && selectedLayer.layer_information) {
        let layer_type = selectedLayer.layer_information.layer_type;
        layer_type = layer_type.replace("_FORECAST", "");
        layer_type = layer_type.replace("_UGRID", "");
        setLayerType(layer_type);
      }
    }
  }, [mapLayer, currentId, id]);

  const data = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    datasets: [
      {
        label: 'Dataset',
        data: [65, 59, 80, 81, 56],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const dispatch = useAppDispatch();
  const [height, setHeight] = useState(470);
  const [selectedTab, setSelectedTab] = useState('tab4');
  const draggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  const handleClose = () => {
    dispatch(hideoffCanvas());
  };

  const handleMouseMove = (e) => {
    if (draggingRef.current) {
      const deltaY = e.clientY - startYRef.current;
      const newHeight = startHeightRef.current - deltaY;
      if (newHeight > 100) {
        setHeight(newHeight);
      }
    }
  };

  const handleMouseUp = () => {
    draggingRef.current = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  const handleMouseDown = (e) => {
    draggingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = height;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const renderTabsBasedOnLayerType = () => {
    switch (layerType) {
      case 'WMS':
        return (
          <Tabs activeKey={selectedTab} onSelect={(k) => setSelectedTab(k)} id="offcanvas-tabs" className="mb-3 custom-tabs">
            <Tab eventKey="tab4" title="Get Map">
              <DynamicImage height={height - 100} />
            </Tab>
            <Tab eventKey="tab2" title="Timeseries">
              <Timeseries height={height - 100} data={data} />
            </Tab>
            <Tab eventKey="tab5" title="Histogram">
              <Histogram height={height - 100} data={data} />
            </Tab>
            <Tab eventKey="tab1" title="Tabular">
              <Tabular
                labels={['Wind Speed', 'Wave Direction', 'Wave Height']}
                dateCount={24}
              />
            </Tab>
            <Tab eventKey="tab3" title="Download">
              <Download/>
            </Tab>
          </Tabs>
        );
      
      case 'WFS':
        return (
          <Tabs activeKey={selectedTab} onSelect={(k) => setSelectedTab(k)} id="offcanvas-tabs" className="mb-3 custom-tabs">
             <Tab eventKey="tab4" title="Timeseries">
                <TimeseriesWfs height={height - 100} data={data} /> {/* Subtracting space for header */}
              </Tab>
          </Tabs>
        );
      
      case 'SOFAR':
        return (
          <Tabs activeKey={selectedTab} onSelect={(k) => setSelectedTab(k)} id="offcanvas-tabs" className="mb-3 custom-tabs">
            <Tab eventKey="tab4" title="Timeseries">
              <TimeseriesSofar height={height - 100} data={data} /> 
            </Tab>
          </Tabs>
        );

        case 'TIDE':
          return (
            <Tabs activeKey={selectedTab} onSelect={(k) => setSelectedTab(k)} id="offcanvas-tabs" className="mb-3 custom-tabs">
              <Tab eventKey="tab4" title="Tide Chart">
                <TideImageComponent height={height - 100} data={data} /> 
              </Tab>
            </Tabs>
          );
      
      default:
        return null;
    }
  };

  return (
    <Offcanvas
      show={isVisible}
      onHide={handleClose}
      placement="bottom"
      className="offcanvas-bottom"
      backdrop={false}
      scroll={true}
      style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        height: `${height}px`,
      }}
    >
      <div
        style={{
          height: '8px',
          backgroundColor: '#ccc',
          cursor: 'ns-resize',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onMouseDown={handleMouseDown}
      >
        <div
          style={{
            width: '40px',
            height: '4px',
            backgroundColor: '#888',
            borderRadius: '4px',
          }}
        ></div>
      </div>

      <Button
        variant="link"
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 10,
          fontSize: '1.5rem',
          padding: '0',
          paddingRight: '10px'
        }}
      >
        <span>&times;</span>
      </Button>

      <Offcanvas.Body style={{ paddingTop: '3', borderRadius: 0 }}>
        {renderTabsBasedOnLayerType()}
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default BottomOffCanvas;