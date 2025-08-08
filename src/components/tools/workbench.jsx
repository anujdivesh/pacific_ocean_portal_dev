"use client"; // client-side rendering

import React, { useState, useRef, useEffect } from 'react';
import { Col, Card } from 'react-bootstrap';
import Accordion from 'react-bootstrap/Accordion';
import { useAppSelector, useAppDispatch } from '@/app/GlobalRedux/hooks';
import '@/components/css/workbench.css';
import ButtonGroupComp from './buttonGroup';
import BottomOffCanvas from './bottom_offcanvas';
import ColorScale from './color_scale';
import Legend from './legend';
import Opacity from './opacity';
import DateSelector from './date_selector';
import { addMapLayer,removeAllMapLayer,removeDuplicateLayers } from '@/app/GlobalRedux/Features/map/mapSlice';
import { hideoffCanvas } from '@/app/GlobalRedux/Features/offcanvas/offcanvasSlice';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import CheckBox from './checkbox';
import RangeSlider from './range_slider';
import { IoMdRemoveCircleOutline } from "react-icons/io";
import { get_url } from '@/components/json/urls';
import SofarTypeFilter from './sofarTypeFilter';
import { 
  getShareIdFromUrl, 
  loadSharedWorkbench, 
  restoreWorkbenchState, 
  cleanupShareUrl,
  hasShareParameter 
} from '../functions/shareUtils';

const MyWorkbench = () => {
  const dispatch = useAppDispatch();

  const initialLoadDone = useRef(false);
  // CustomToggle Component (for Accordion control)
  function CustomToggle({ children, eventKey, isOpen, onToggle }) {
    const decoratedOnClick = useAccordionButton(eventKey, () => {
      onToggle(eventKey);
    });

    return (
      <div
        onClick={decoratedOnClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          marginTop: -22,
          paddingLeft: 30,
          fontSize: 14,
        }}
      >
        <span>{children}</span>
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </div>
    );
  }

  const isVisible = useAppSelector((state) => state.offcanvas.isVisible);
  const mapLayer = useAppSelector((state) => state.mapbox.layers);
  const currentId = useAppSelector((state) => state.offcanvas.currentId);
  const _isMounted = useRef(true);
  const [openAccordions, setOpenAccordions] = useState(new Set());
  const [lastAddedId, setLastAddedId] = useState(null);

  // Clean up any existing duplicates when component mounts
  useEffect(() => {
    dispatch(removeDuplicateLayers());
  }, [dispatch]);

  // Check if layers exist in localStorage and dispatch them to Redux store
  useEffect(() => {
    if (_isMounted.current && !initialLoadDone.current) {
      async function loadLayers() {
        // Check if there's a share parameter in the URL
        if (hasShareParameter()) {
          // console.log('Share parameter detected in URL');
          const shareId = getShareIdFromUrl();
          // console.log('Share ID from URL:', shareId ? shareId.substring(0, 50) + '...' : 'null');
          const sharedState = loadSharedWorkbench(shareId);
          
          if (sharedState) {
            console.log('Loading shared workbench state...');
            const success = await restoreWorkbenchState(sharedState, dispatch);
            if (success) {
              // Clean up the URL after successful restoration
              cleanupShareUrl();
              // Show a success message (you could add a toast notification here)
              console.log('Shared workbench loaded successfully!');
            } else {
              console.error('Failed to restore shared workbench state');
            }
          } else {
            console.warn('No shared workbench found, loading default state');
            // Clean up the URL if no shared state found
            cleanupShareUrl();
            loadDefaultLayers();
          }
        } else {
          // Load default layers from localStorage
          loadDefaultLayers();
        }
        
        initialLoadDone.current = true;
      }

      async function loadDefaultLayers() {
        const savedLayers = localStorage.getItem('savedLayers');
        if (savedLayers) {
          const layers = JSON.parse(savedLayers).filter(
            (layer) => layer.layer_information.restricted === false
          );
          
          // Remove any existing layers to prevent duplicates
          dispatch(removeAllMapLayer());
          
          const updatedLayers = await Promise.all(
            layers.map(async (layer) => {
              const id = layer.layer_information.id;
              try {
                const response = await fetch(get_url('layer', id));
                if (!response.ok) throw new Error('API error');
                const updatedLayerInformation = await response.json();
                return { ...layer, layer_information: updatedLayerInformation };
              } catch {
                return layer;
              }
            })
          );
          updatedLayers.forEach((layer) => {
            layer.layer_information.enabled = false;
            dispatch(addMapLayer(layer));
          });
          // Keep all accordions closed during initial load
          setOpenAccordions(new Set());
        }
      }

      loadLayers();
    }

    return () => {
      _isMounted.current = false;
    };
  }, [dispatch]);
  
  // Open accordions for newly added layers (only after initial load)
  useEffect(() => {
    if (initialLoadDone.current && mapLayer.length > 0) {
      const lastLayer = mapLayer[mapLayer.length - 1];
  
      if (lastLayer.id !== lastAddedId) {
        setLastAddedId(lastLayer.id);
        setOpenAccordions(new Set([lastLayer.id])); // open only the new one
      }
    }
  }, [mapLayer, lastAddedId]);
  
  const handleToggle = (eventKey) => {
    const newOpenAccordions = new Set(openAccordions);
    if (newOpenAccordions.has(eventKey)) {
      newOpenAccordions.delete(eventKey);
    } else {
      newOpenAccordions.clear(); // Optional: make it always single open
      newOpenAccordions.add(eventKey);
    }
    setOpenAccordions(newOpenAccordions);
  };

  return (
    <>
      {mapLayer.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
          <div className="item" style={{ color: 'grey' }}>Your Workbench is empty</div>
        </div>
      ) : (
        <Col md={12} style={{ marginTop: -13, overflowY: 'auto' }}>
          <hr style={{ marginRight: -10, marginLeft: -12 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <p style={{ fontSize: '12px', marginTop: '-10px' }}>DATA SETS ({mapLayer.length})</p>
  <button 
    className="remove-all-button"
    onClick={() => {
      dispatch(removeAllMapLayer());
      // Also clear localStorage to prevent duplicates on reload
      localStorage.removeItem('savedLayers');
      // Hide bottom offcanvas and clear currentId to avoid stale references
      dispatch(hideoffCanvas());
    }}
  >
     <IoMdRemoveCircleOutline size={14} className="icon" />
    Remove All
  </button>
</div>
          <hr style={{ marginTop: -10, marginRight: -10, marginLeft: -12 }} />
          {mapLayer.map((item, index) => {
            const isOpen = openAccordions.has(item.id);
            var layer_Type = item.layer_information.layer_type;
            layer_Type = layer_Type.replace("_FORECAST", "");
            
            if (layer_Type === 'WMS' || layer_Type === 'WMS_UGRID') {
              return (
                <Accordion key={`${item.id}-${index}`} activeKey={isOpen ? item.id : null} style={{ paddingBottom: 4, border:0 }}>
                  <Card>
                    <Card.Header>
                      <CheckBox item={item} />
                      <CustomToggle 
                        eventKey={item.id}
                        isOpen={isOpen}
                        onToggle={handleToggle}
                      >
                        {item.layer_information.layer_title}
                      </CustomToggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey={item.id}>
                      <Card.Body style={{ paddingLeft: 0, paddingRight: 0 }}>
                        <ButtonGroupComp item={item} />
                        <Opacity item={item} id={item.id} />

                        {item.layer_information.is_timeseries ? (
                          <RangeSlider item={item} />
                        ) : (
                          <DateSelector
                            item={item}
                            period={'daily'}
                            startDateStr={item.layer_information.timeIntervalStart}
                            endDateStr={item.layer_information.timeIntervalEnd}
                          />
                        )}
                        <ColorScale item={item} />
                      </Card.Body>
                    </Accordion.Collapse>
                  </Card>
                </Accordion>
              );
            } else if (item.layer_information.layer_type === 'SOFAR') {
              return (
                <Accordion key={`${item.id}-${index}`} activeKey={isOpen ? item.id : null} style={{ paddingBottom: 4 }}>
                  <Card>
                
                    <Card.Header>
                      <CheckBox item={item} />
                      <CustomToggle 
                        eventKey={item.id}
                        isOpen={isOpen}
                        onToggle={handleToggle}
                      >
                        {item.layer_information.layer_title}
                      </CustomToggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey={item.id}>
                      <Card.Body style={{ paddingLeft: 0, paddingRight: 0 }}>
                        <ButtonGroupComp item={item} />
                        <SofarTypeFilter item={item} />
                      </Card.Body>
                    </Accordion.Collapse>
                  </Card>
                </Accordion>
              );
            } else if (item.layer_information.layer_type === 'TIDE') {
              return (
                <Accordion key={`${item.id}-${index}`} activeKey={isOpen ? item.id : null} style={{ paddingBottom: 4 }}>
                  <Card>
                    <Card.Header>
                      <CheckBox item={item} />
                      <CustomToggle 
                        eventKey={item.id}
                        isOpen={isOpen}
                        onToggle={handleToggle}
                      >
                        {item.layer_information.layer_title}
                      </CustomToggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey={item.id}>
                      <Card.Body style={{ paddingLeft: 0, paddingRight: 0 }}>
                        <ButtonGroupComp item={item} />
                      </Card.Body>
                    </Accordion.Collapse>
                  </Card>
                </Accordion>
              );
            } else {
              return (
                <Accordion key={`${item.id}-${index}`} activeKey={isOpen ? item.id : null} style={{ paddingBottom: 4 }}>
                  <Card>
                    <Card.Header>
                      <CheckBox item={item} />
                      <CustomToggle 
                        eventKey={item.id}
                        isOpen={isOpen}
                        onToggle={handleToggle}
                      >
                        {item.layer_information.layer_title}
                      </CustomToggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey={item.id}>
                      <Card.Body style={{ paddingLeft: 0, paddingRight: 0 }}>
                        <ButtonGroupComp item={item} />
                        <DateSelector
                          item={item}
                          period={'daily'}
                          startDateStr={item.layer_information.timeIntervalStart}
                          endDateStr={item.layer_information.timeIntervalEnd}
                        />
                      </Card.Body>
                    </Accordion.Collapse>
                  </Card>
                </Accordion>
              );
            }
          })}
        </Col>
      )}
    </>
  );
};

export default MyWorkbench;