"use client" // client side rendering 
import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, InputGroup, Form } from 'react-bootstrap';
import dynamic from 'next/dynamic';
import { useAppSelector, useAppDispatch } from '@/app/GlobalRedux/hooks'
import { hideModal,showModaler } from '@/app/GlobalRedux/Features/modal/modalSlice';
import MyWorkbench from '../tools/workbench';
import { setDataset } from '@/app/GlobalRedux/Features/dataset/dataSlice';
import { setAccordion } from '@/app/GlobalRedux/Features/accordion/accordionSlice';
import { showsideoffCanvas  } from '@/app/GlobalRedux/Features/sideoffcanvas/sideoffcanvasSlice';
import { setBounds, setCenter, setZoom } from '@/app/GlobalRedux/Features/map/mapSlice';
import SideOffCanvas from '../tools/side_offcanvas';
import {  hideoffCanvas  } from '@/app/GlobalRedux/Features/offcanvas/offcanvasSlice';
import { MdAddCircleOutline } from "react-icons/md";
import { CgMoreO } from "react-icons/cg";
import { FaSearch, FaShare } from "react-icons/fa";
import { get_url } from '@/components/json/urls';
import { setShortName } from "@/app/GlobalRedux/Features/country/countrySlice";
import ShareWorkbench from '../tools/shareWorkbench';

const ExploreModal = dynamic(() => import('@/components/tools/model'), {ssr: false})

const SideBar = () => {
    const _isMounted = useRef(true);

    const handleShowCanvas = () => {
      dispatch(showsideoffCanvas())
    };
    
    const handleShowShareModal = () => {
      setShowShareModal(true);
    };
    
    const handleHideShareModal = () => {
      setShowShareModal(false);
    };
    const isVisiblecanvas = useAppSelector((state) => state.sideoffcanvas.isVisible);
    const short_name = useAppSelector((state) => state.country.short_name);
    //const [showModal, setShowModal] = useState(false);
    const isVisible = useAppSelector((state) => state.modal.isVisible);
    const dispatch = useAppDispatch();
    
    // Station search state
    const [stationSearchId, setStationSearchId] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [showStationSearch, setShowStationSearch] = useState(false);
    
    // Share modal state
    const [showShareModal, setShowShareModal] = useState(false);
    
    // Autocomplete state
    const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([]);
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
    const autocompleteRef = useRef(null);

    // Get map layers to check if SOFAR is active
    const mapLayers = useAppSelector((state) => state.mapbox.layers);

    const handleShow = () => {
      dispatch(setAccordion(''))
      dispatch(setDataset([]))
      dispatch(showModaler());
      dispatch(hideoffCanvas());
      //setShowModal(true)
    };
    const handleClose = () => {
      dispatch(hideModal())
      //setShowModal(false)
    };

    // Check if SOFAR layers are active
    useEffect(() => {
      const hasSofarLayer = mapLayers.some(layer => 
        layer.layer_information?.layer_type === "SOFAR" && layer.layer_information?.enabled
      );
      setShowStationSearch(hasSofarLayer);
    }, [mapLayers]);

    // Function to get all available stations from the map
    const getAllStations = () => {
      const mapInstance = window.mapInstance;
      if (!mapInstance) {
        console.log('Map instance not available yet');
        return [];
      }

      const stationsMap = new Map(); // Use Map to prevent duplicates
      
      try {
        mapInstance.eachLayer((layer) => {
          // Handle marker cluster groups (SOFAR markers are typically in clusters)
          if (layer && typeof layer.eachLayer === 'function') {
            layer.eachLayer((marker) => {
              if (marker && marker.getLatLng && marker.options?.stationId) {
                const stationId = marker.options.stationId;
                
                // Skip if we already have this station
                if (stationsMap.has(stationId)) {
                  return;
                }
                
                // Get popup content to extract additional info
                let owner = "Unknown";
                let status = "Unknown";
                
                if (marker.getPopup) {
                  const popup = marker.getPopup();
                  if (popup && popup.getContent) {
                    const popupContent = popup.getContent();
                    if (popupContent) {
                      // Extract owner and status from popup content
                      const ownerMatch = popupContent.match(/Owner: ([^<]+)/);
                      const statusMatch = popupContent.match(/Status: ([^<]+)/);
                      if (ownerMatch) owner = ownerMatch[1];
                      if (statusMatch) status = statusMatch[1];
                    }
                  }
                }
                
                stationsMap.set(stationId, {
                  id: stationId,
                  owner: owner,
                  status: status,
                  marker: marker
                });
              }
            });
          }
          
          // Also check individual markers that might not be in clusters
          if (layer && layer.getLatLng && layer.options?.stationId) {
            const stationId = layer.options.stationId;
            
            if (!stationsMap.has(stationId)) {
              let owner = "Unknown";
              let status = "Unknown";
              
              if (layer.getPopup) {
                const popup = layer.getPopup();
                if (popup && popup.getContent) {
                  const popupContent = popup.getContent();
                  if (popupContent) {
                    const ownerMatch = popupContent.match(/Owner: ([^<]+)/);
                    const statusMatch = popupContent.match(/Status: ([^<]+)/);
                    if (ownerMatch) owner = ownerMatch[1];
                    if (statusMatch) status = statusMatch[1];
                  }
                }
              }
              
              stationsMap.set(stationId, {
                id: stationId,
                owner: owner,
                status: status,
                marker: layer
              });
            }
          }
        });
      } catch (error) {
        console.error('Error getting stations from map:', error);
      }
      
      return Array.from(stationsMap.values());
    };

    // Function to filter stations based on search input
    const filterStations = (searchTerm) => {
      if (!searchTerm.trim()) {
        setAutocompleteSuggestions([]);
        setShowAutocomplete(false);
        return;
      }

      const allStations = getAllStations();
      
      // If no stations found, show message
      if (allStations.length === 0) {
        setAutocompleteSuggestions([]);
        setShowAutocomplete(false);
        return;
      }
      
      const filtered = allStations.filter(station => 
        station.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.owner.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 10); // Limit to 10 suggestions

      setAutocompleteSuggestions(filtered);
      setShowAutocomplete(filtered.length > 0);
      setSelectedSuggestionIndex(-1);
    };

    // Handle input change with autocomplete
    const handleStationSearchChange = (e) => {
      const value = e.target.value;
      setStationSearchId(value);
      setSearchError('');
      filterStations(value);
    };

    // Handle keyboard navigation in autocomplete
    const handleStationSearchKeyDown = (e) => {
      if (!showAutocomplete) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => 
            prev < autocompleteSuggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedSuggestionIndex >= 0 && autocompleteSuggestions[selectedSuggestionIndex]) {
            selectStation(autocompleteSuggestions[selectedSuggestionIndex]);
          } else {
            handleStationSearch();
          }
          break;
        case 'Escape':
          setShowAutocomplete(false);
          setSelectedSuggestionIndex(-1);
          break;
      }
    };

    // Function to select a station from autocomplete
    const selectStation = (station) => {
      setStationSearchId(station.id);
      setShowAutocomplete(false);
      setSelectedSuggestionIndex(-1);
      
      // Navigate to the station
      const latlng = station.marker.getLatLng();
      
      // Pan map to station location
      dispatch(setCenter([latlng.lat, latlng.lng]));
      dispatch(setZoom(12));
      
      // Set bounds around the station
      const buffer = 0.1; // 0.1 degree buffer
      dispatch(setBounds({
        west: latlng.lng - buffer,
        east: latlng.lng + buffer,
        south: latlng.lat - buffer,
        north: latlng.lat + buffer,
      }));
      
      // Open the marker popup to highlight it
      if (station.marker.openPopup) {
        station.marker.openPopup();
      }
    };

    // Station search function - search existing markers on map
    const handleStationSearch = async () => {
      if (!stationSearchId.trim()) {
        setSearchError('Please enter a station ID');
        return;
      }

      setIsSearching(true);
      setSearchError('');

      try {
        // Get the map instance from the global scope
        const mapInstance = window.mapInstance;
        
        if (!mapInstance) {
          setSearchError('Map not available. Please try again.');
          return;
        }

        let foundMarker = null;
        const searchTerm = stationSearchId.trim().toLowerCase();

        // Search through all layers on the map
        mapInstance.eachLayer((layer) => {
          // Check if it's a marker cluster group (SOFAR markers are in clusters)
          if (layer && typeof layer.eachLayer === 'function') {
            layer.eachLayer((marker) => {
              if (marker && marker.getLatLng) {
                // Check marker options for station ID
                if (marker.options?.stationId) {
                  const markerStationId = marker.options.stationId.toLowerCase();
                  if (markerStationId.includes(searchTerm) || searchTerm.includes(markerStationId)) {
                    foundMarker = marker;
                  }
                }
                
                // Also check popup content for station info
                if (!foundMarker && marker.getPopup) {
                  const popup = marker.getPopup();
                  if (popup && popup.getContent) {
                    const popupContent = popup.getContent();
                    if (popupContent) {
                      // Extract station ID from popup content
                      const stationMatch = popupContent.match(/<strong>([^<]+)<\/strong>/);
                      if (stationMatch) {
                        const stationId = stationMatch[1].toLowerCase();
                        if (stationId.includes(searchTerm) || searchTerm.includes(stationId)) {
                          foundMarker = marker;
                        }
                      }
                    }
                  }
                }
              }
            });
          }
        });

        if (foundMarker) {
          const latlng = foundMarker.getLatLng();
          
          // Pan map to station location
          dispatch(setCenter([latlng.lat, latlng.lng]));
          dispatch(setZoom(12));
          
          // Set bounds around the station
          const buffer = 0.1; // 0.1 degree buffer
          dispatch(setBounds({
            west: latlng.lng - buffer,
            east: latlng.lng + buffer,
            south: latlng.lat - buffer,
            north: latlng.lat + buffer,
          }));
          
          // Open the marker popup to highlight it
          if (foundMarker.openPopup) {
            foundMarker.openPopup();
          }
          
          setStationSearchId('');
          setSearchError('');
          setShowAutocomplete(false);
        } else {
          setSearchError('Station not found on map. Please check the station ID.');
        }
        
      } catch (error) {
        console.error('Error searching for station:', error);
        setSearchError('Error searching for station. Please try again.');
      } finally {
        setIsSearching(false);
      }
    };

    const handleStationSearchKeyPress = (e) => {
      if (e.key === 'Enter') {
        handleStationSearch();
      }
    };

    // Close autocomplete when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
          setShowAutocomplete(false);
          setSelectedSuggestionIndex(-1);
        }
      };

      // Add event listener with passive option for better performance
      document.addEventListener('mousedown', handleClickOutside, { passive: true });
      document.addEventListener('touchstart', handleClickOutside, { passive: true });
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }, []);

    const [regions, setRegions] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState("1"); 
   // const [bounds, setBounds] = useState(null);
  
    // Fetch regions data from API
    useEffect(() => {
      // Example API URL - replace with your actual API endpoint
      fetch(get_url('country'))
        .then((response) => response.json())
        .then((data) => {
          const sortedData = [...data].sort((a, b) => a.long_name.localeCompare(b.long_name));
          setRegions(sortedData); // Set regions data to state
          const savedRegion = localStorage.getItem('selectedRegion'); // Check localStorage for saved region
          if (savedRegion) {
            // Check if the saved region exists in the fetched data
            const regionExists = data.find((region) => region.id.toString() === savedRegion);
            if (regionExists) {
              setSelectedRegion(savedRegion); // Set the region from localStorage if valid
              localStorage.setItem('selectedRegion', savedRegion);
              // Set bounds based on the saved region
              dispatch(setShortName(savedRegion));
              dispatch(
                setBounds({
                  west: regionExists.west_bound_longitude,
                  east: regionExists.east_bound_longitude,
                  south: regionExists.south_bound_latitude,
                  north: regionExists.north_bound_latitude,
                })
              );
            }
          }
        })
        .catch((error) => console.error('Error fetching regions:', error));
    }, [dispatch]);
  
    // Handle region selection
    const handleRegionChange = (e) => {
      dispatch(hideoffCanvas());
      const regionId = e.target.value;
      setSelectedRegion(regionId);
      localStorage.setItem('selectedRegion', regionId);
      dispatch(setShortName(regionId))
  
      // Find the selected region by its id
      const region = regions.find((region) => region.id === parseInt(regionId));
  
      if (region) {
        // Set the bounds for the selected region
        dispatch(
          setBounds({
            west: region.west_bound_longitude,
            east: region.east_bound_longitude,
            south: region.south_bound_latitude,
            north: region.north_bound_latitude,
          })
        );
      } else {
        dispatch(setBounds(null)); // Reset bounds if no valid region is selected
      }
      e.target.blur();
    };
  

  
  
  return (
    <div
      className="sidebar-responsive-wrapper"
      style={{
        marginRight: '3px',
        marginLeft: '3px',
        // Responsive: overlay on mobile
        position: 'relative',
        zIndex: 1200,
      }}
    >
        <Row  
        style={{paddingTop:'10px', margin: '0', paddingLeft: '0', paddingRight: '0'}} 
        className="sidebar-row">
        <Col md={12} style={{ paddingLeft: '0', paddingRight: '0' }}>
        <select
        className="form-select w-100 region-select region-select-override"
        aria-label="Select a region"
        value={selectedRegion}
        onChange={handleRegionChange}
     
       style={{  
         borderRadius: '20px',
         border: '1px solid rgb(58 59 62)',
         fontSize: '0.875rem',
         padding: '0.375rem 0.75rem',
         backgroundColor: 'white',
         color: '#212529'
       }}
      >
        {regions.map((region) => (
          <option key={region.id} value={region.id}>
            {region.long_name}
          </option>
        ))}
      </select>
        </Col>
        </Row>

                {/* Station Search Section - Only show when SOFAR layers are active */}
        {showStationSearch && (
          <Row style={{paddingTop:'10px', margin: '0', paddingLeft: '0', paddingRight: '0'}} className="station-search-row">
            <Col md={12} style={{ paddingLeft: '0', paddingRight: '0' }}>
              <div ref={autocompleteRef} style={{ position: 'relative', width: '100%' }}>
                <InputGroup style={{ border: '1px solid rgb(58 59 62)', borderRadius: '20px', overflow: 'visible', width: '100%' }}>
                  <Form.Control
                    type="text"
                    placeholder="Search by station ID"
                    value={stationSearchId}
                    onChange={handleStationSearchChange}
                    onKeyDown={handleStationSearchKeyDown}
                    onKeyPress={handleStationSearchKeyPress}
                    style={{ fontSize: '0.875rem', border: 'none', borderRadius: '0',left:'18px' }}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={handleStationSearch}
                    disabled={isSearching}
                    style={{ fontSize: '0.875rem', border: 'none', borderRadius: '0' }}
                  >
                    {isSearching ? (
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Searching...</span>
                      </div>
                    ) : (
                      <FaSearch size={14} />
                    )}
                  </Button>
                </InputGroup>
                {showAutocomplete && (
                  <div 
                    className="autocomplete-dropdown"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 9999,
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}
                  >
                    {autocompleteSuggestions.length === 0 ? (
                      <div className="text-center py-2">No results found.</div>
                    ) : (
                      autocompleteSuggestions.map((station, index) => (
                        <div
                          key={station.id}
                          className={`autocomplete-item ${index === selectedSuggestionIndex ? 'active' : ''}`}
                          onClick={() => selectStation(station)}
                          style={{ cursor: 'pointer' }}
                        >
                          <strong>{station.id}</strong>
                          <span>{station.owner} ({station.status})</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              {searchError && (
                <div className="text-danger small mt-1" style={{ fontSize: '0.75rem' }}>
                  {searchError}
                </div>
              )}
            </Col>
          </Row>
        )}

          <div className="d-flex justify-content-between sidebar-buttons" style={{paddingTop:'10px', gap: '6px'}}>
                                <Button
                                    variant="btn btn-primary btn-sm rounded-pill"
                                    style={{ padding: '8px 10px', color: 'white', width: '40%', fontSize: '0.85rem' }}
                                    className="explore-button"
                                    onClick={handleShow}
                                >
                                    <MdAddCircleOutline size={16}/>&nbsp;Explore Map Data
                                </Button>
                                <Button
    variant="btn btn-info btn-sm rounded-pill"
    style={{
        padding: '8px 10px',
        color: 'white',
        width: '30%',
        backgroundColor: '#C7D444',
        border: 'none',
        fontSize: '0.85rem'
    }}
    className="more-button"
    onClick={handleShowCanvas}
>
    <CgMoreO size={16} />&nbsp;More
</Button>
                                <Button
    variant="btn btn-success btn-sm rounded-pill"
    style={{
        padding: '8px 10px',
        color: 'white',
        width: '30%',
        backgroundColor: '#28a745',
        border: 'none',
        fontSize: '0.85rem'
    }}
    className="share-button"
    onClick={handleShowShareModal}
    title="Share Workbench"
>
    <FaShare size={16} />
</Button>

                            </div>
        

      <Row style={{paddingTop:10,marginRight:-6,marginLeft:-4}} className="workbench-row"> {/* Reduced negative margins for thinner sidebar */}
        <MyWorkbench/>
      </Row>
      <SideOffCanvas isVisible={isVisiblecanvas}/>
      <ExploreModal
       show={isVisible} 
       onClose={handleClose} 
       title="Data Catalogue" 
       bodyContent="This is the modal body content." 
       />
      <ShareWorkbench
        show={showShareModal}
        onHide={handleHideShareModal}
      />
    </div>
  );
};

export default SideBar;
