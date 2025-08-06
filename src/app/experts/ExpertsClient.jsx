'use client'
import React, { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '@/components/css/legendlibrary.css';
// import "leaflet-bing-layer"; // Commented out to prevent SSR window error; now loaded dynamically below
import '@/components/css/expertcss.css';
import Spinner from 'react-bootstrap/Spinner';

// Patch leaflet icon URLs
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
});

// Country configuration with IDs, colors, and coordinates
const countryConfigs = [
    {
      name: 'Fiji',
      id: 72,
      color: '#27ae60',
      center: [-18.1236, 178.4369]
    },
    {
      name: 'Tuvalu',
      id: 218,
      color: '#3498db',
      center: [-8.521176, 179.196192]
    },
    {
      name: 'Papua New Guinea',
      id: 167,
      color: '#e74c3c',
      center: [-6.314993, 143.955550]
    },
    {
      name: 'Solomon Islands',
      id: 193,
      color: '#9b59b6',
      center: [-9.645710, 160.156194]
    },
    {
      name: 'Vanuatu',
      id: 227,
      color: '#f1c40f',
      center: [-15.376706, 166.959158]
    },
    {
      name: 'Kiribati',
      id: 112,
      color: '#1abc9c',
      center: [1.4514, 172.9718] 
    },
    {
      name: 'Marshall Islands',
      id: 134,
      color: '#d35400',
      center: [7.131474, 171.184478]
    },
    {
      name: 'Micronesia (Federated States of)',
      id: 140,
      color: '#34495e',
      center: [6.887481, 158.215072]
    },
    {
      name: 'Nauru',
      id: 149,
      color: '#e67e22',
      center: [-0.522778, 166.931503]
    },
    {
      name: 'Palau',
      id: 164,
      color: '#e84393',
      center: [7.514980, 134.582520]
    },
    {
      name: 'Tonga',
      id: 212,
      color: '#0984e3',
      center: [-21.1790, -175.1982]
    },
    {
      name: 'Niue',
      id: 158,
      color: '#00b894',
      center: [-19.054445, -169.867233]
    },
    {
      name: 'Samoa',
      id: 183,
      color: '#6c5ce7',
      center: [-13.7590, -172.1046]
    },
];

const Experts = () => {
    const mapRef = useRef(null);
    const [basemap, setBasemap] = useState({ 
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', // Satellite default
        attribution: '&copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community' 
    });
    const [basemapOption, setBasemapOption] = useState('satellite'); // Default to satellite
    const [expertsData, setExpertsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedExperts, setSelectedExperts] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [filterText, setFilterText] = useState('');
    const markerClusterRef = useRef(null);
    const containerRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);

    // Normalize longitude to [-180, 180] range
    const normalizeLongitude = (lon) => {
        while (lon > 180) lon -= 360;
        while (lon < -180) lon += 360;
        return lon;
    };

    // Process expert coordinates to handle 180 meridian
    const processExpertCoordinates = (expert) => {
        const countryConfig = countryConfigs.find(c => 
            c.name.toLowerCase() === (expert.country || '').toLowerCase()
        ) || countryConfigs[0];

        let longitude = expert.longitude ? parseFloat(expert.longitude) : countryConfig.center[1];
        longitude = normalizeLongitude(longitude);

        return {
            ...expert,
            latitude: expert.latitude ? parseFloat(expert.latitude) : countryConfig.center[0],
            longitude: longitude,
            color: countryConfig.color,
            country: countryConfig.name
        };
    };

    const buildApiUrl = () => {
        let url = 'https://oceanexpert.org/api/v1/advancedSearch/search.json?';
        url += `type[]=experts&filter[]=Country+is&keywords[]=${countryConfigs[0].id}`;
        for (let i = 1; i < countryConfigs.length; i++) {
            url += `&toggle[]=OR&type[]=experts&filter[]=Country+is&keywords[]=${countryConfigs[i].id}`;
        }
        url += '&action=advSearch&limit=1000';
        return url;
    };

    const fetchExperts = async () => {
        try {
            setLoading(true);
            const response = await fetch(buildApiUrl());
            const data = await response.json();

            const processedExperts = data.results?.data.map(processExpertCoordinates) || [];
            setExpertsData(processedExperts);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    function lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
    }

    // --- Dynamically load markercluster on client only ---
    useEffect(() => {
        let isMounted = true;

        async function setupMapAndClusters() {
            if (typeof window === 'undefined' || !containerRef.current) return;

            // Dynamically import leaflet-bing-layer only on client
            await import('leaflet-bing-layer');

            // Only load markercluster if not already loaded
            if (!window.L.MarkerClusterGroup) {
                window.L = L;
                await import('leaflet.markercluster/dist/leaflet.markercluster.js');
                await import('leaflet.markercluster/dist/MarkerCluster.Default.css');
                await import('leaflet.markercluster/dist/MarkerCluster.css');
            }

            if (isMounted && !mapRef.current) {
                mapRef.current = L.map('map', {
                    zoom: 4,
                    center: [-8, 170.3053],
                    attributionControl: false
                });
                mapRef.current.attributionControl = L.control.attribution({
                    prefix: '<a href="https://www.spc.int/" target="_blank">SPC</a> | &copy; Pacific Community SPC'
                }).addTo(mapRef.current);

                L.tileLayer(basemap.url, { attribution: basemap.attribution }).addTo(mapRef.current);

                markerClusterRef.current = window.L.markerClusterGroup({
                    maxClusterRadius: 40,
                    spiderfyOnMaxZoom: true,
                    showCoverageOnHover: true,
                    zoomToBoundsOnClick: true
                });
                markerClusterRef.current.addTo(mapRef.current);
            }
        }

        setupMapAndClusters();

        return () => {
            isMounted = false;
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []); // Empty dependency array - only run once!

    // Separate effect for basemap changes
    useEffect(() => {
        if (mapRef.current && markerClusterRef.current) {
            // Add the new tile layer first
            const newTileLayer = L.tileLayer(basemap.url, { attribution: basemap.attribution });
            newTileLayer.addTo(mapRef.current);
            
            // Remove all other tile layers except the new one
            mapRef.current.eachLayer(layer => {
                if (layer instanceof L.TileLayer && layer !== newTileLayer) {
                    mapRef.current.removeLayer(layer);
                }
            });
            
            // Ensure marker cluster group is on the map
            if (!mapRef.current.hasLayer(markerClusterRef.current)) {
                mapRef.current.addLayer(markerClusterRef.current);
            }
            
            // Force refresh of markers
            setTimeout(() => {
                populateMarkers();
            }, 100);
        }
    }, [basemap]);

    // Add basemap switcher panel
    useEffect(() => {
        if (mapRef.current) {
            // Remove any existing custom control
            const existing = document.querySelector('.expert-basemap-panel');
            if (existing) existing.remove();

            const panel = L.DomUtil.create('div', 'expert-basemap-panel leaflet-bar');
            panel.style.position = 'absolute';
            panel.style.top = '20px';
            panel.style.right = '20px';
            panel.style.zIndex = 1001;
            panel.style.background = 'var(--color-surface)';
            panel.style.borderRadius = '8px';
            panel.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
            panel.style.padding = '8px 12px';
            panel.style.display = 'flex';
            panel.style.gap = '8px';
            panel.style.alignItems = 'center';

            const options = [
                { value: 'satellite', label: 'Satellite' },
                { value: 'osm', label: 'OpenStreetMap' },
                { value: 'opentopo', label: 'OpenTopoMap' }
            ];
            options.forEach(opt => {
                const btn = L.DomUtil.create('button', '', panel);
                btn.textContent = opt.label;
                btn.style.background = basemapOption === opt.value ? 'var(--color-primary)' : 'var(--color-surface)';
                btn.style.color = basemapOption === opt.value ? '#fff' : 'var(--color-text)';
                btn.style.border = 'none';
                btn.style.borderRadius = '6px';
                btn.style.padding = '4px 10px';
                btn.style.fontWeight = '500';
                btn.style.cursor = 'pointer';
                btn.style.transition = 'background 0.2s, color 0.2s';
                btn.onmouseenter = () => btn.style.background = 'var(--color-accent)';
                btn.onmouseleave = () => btn.style.background = basemapOption === opt.value ? 'var(--color-primary)' : 'var(--color-surface)';
                btn.onclick = () => {
                    setBasemapOption(opt.value);
                };
            });
            mapRef.current.getContainer().appendChild(panel);
        }
    }, [mapRef.current, basemapOption]);

    // Update basemap when option changes
    useEffect(() => {
        if (basemapOption === 'satellite') {
            setBasemap({
                url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                attribution: '&copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community'
            });
        } else if (basemapOption === 'osm') {
            setBasemap({
                url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                attribution: '&copy; OpenStreetMap contributors'
            });
        } else {
            setBasemap({
                url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
                attribution: '&copy; OpenTopoMap (CC-BY-SA)'
            });
        }
    }, [basemapOption]);

    // Create country cluster marker
    const createCountryMarker = (country, experts, avgLat, avgLng) => {
        const countryConfig = countryConfigs.find(c => c.name === country) || countryConfigs[0];
        const lighterColor = lightenColor(countryConfig.color, 15);

        const marker = L.marker([avgLat, avgLng], {
            icon: L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="position:relative;">
                         <div style="position:absolute;top:-5px;left:-5px;width:50px;height:50px;
                               background-color:${lighterColor};border-radius:50%;z-index:-1;"></div>
                         <div style="background-color:${countryConfig.color};color:white;border-radius:50%;
                               width:40px;height:40px;display:flex;align-items:center;
                               justify-content:center;font-weight:bold;">${experts.length}</div>
                       </div>`,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            }),
            expertData: experts
        });

        marker.on('click', () => {
            setSelectedExperts(experts);
            setSelectedCountry(country);
            setFilterText('');
        });

        return marker;
    };

    // Helper to populate marker cluster group
    const populateMarkers = () => {
        if (
            mapRef.current &&
            markerClusterRef.current &&
            expertsData.length > 0 &&
            window.L.MarkerClusterGroup // Only run if markercluster is loaded
        ) {
            markerClusterRef.current.clearLayers();

            const countryGroups = {};
            expertsData.forEach(expert => {
                const country = expert.country || 'Unknown';
                if (!countryGroups[country]) {
                    countryGroups[country] = [];
                }
                countryGroups[country].push(expert);
            });

            Object.entries(countryGroups).forEach(([country, experts]) => {
                const avgLat = experts.reduce((sum, e) => sum + e.latitude, 0) / experts.length;
                let avgLng = experts.reduce((sum, e) => sum + e.longitude, 0) / experts.length;
                avgLng = normalizeLongitude(avgLng);

                // Add primary marker
                const primaryMarker = createCountryMarker(country, experts, avgLat, avgLng);
                markerClusterRef.current.addLayer(primaryMarker);

                // Add secondary marker if near 180 meridian
                if (Math.abs(avgLng) > 150) {
                    const secondaryLng = avgLng > 0 ? avgLng - 360 : avgLng + 360;
                    const secondaryMarker = createCountryMarker(country, experts, avgLat, secondaryLng);
                    markerClusterRef.current.addLayer(secondaryMarker);
                }
            });
        }
    };

    useEffect(() => {
        fetchExperts();
    }, []);

    useEffect(() => {
        populateMarkers();
    }, [expertsData]);

    // Handle expert hover effects
    const handleExpertHover = (expert, isHovering) => {
        if (!mapRef.current) return;

        mapRef.current.eachLayer(layer => {
            if (layer.options.expertData?.id_ind === expert.id_ind) {
                const icon = isHovering ?
                    L.divIcon({
                        className: 'custom-div-icon',
                        html: `<div style="background-color:${expert.color};color:white;border-radius:50%;
                               width:50px;height:50px;display:flex;align-items:center;
                               justify-content:center;font-weight:bold;border:3px solid white;
                               box-shadow:0 0 10px rgba(0,0,0,0.5);">${expert.fname?.[0]}${expert.sname?.[0]}</div>`,
                        iconSize: [50, 50],
                        iconAnchor: [25, 25]
                    }) :
                    L.divIcon({
                        className: 'custom-div-icon',
                        html: `<div style="background-color:${expert.color};color:white;border-radius:50%;
                               width:40px;height:40px;display:flex;align-items:center;
                               justify-content:center;font-weight:bold;">${expert.fname?.[0]}${expert.sname?.[0]}</div>`,
                        iconSize: [40, 40],
                        iconAnchor: [20, 20]
                    });
                layer.setIcon(icon);
            }
        });
    };

    // Filter experts based on search text
    const filteredExperts = selectedExperts.filter(expert => {
        if (!filterText) return true;
        const searchStr = `${expert.fname || ''} ${expert.sname || ''}`.toLowerCase();
        return searchStr.includes(filterText.toLowerCase());
    });

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 1004);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div ref={containerRef} className="expert-container">
            {loading && (
                <div className="loading-overlay" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <Spinner animation="border" variant="primary"  />
                    <span style={{ color: '#2c3e50', fontSize: '1.1rem' }}>
                        Loading ocean experts data...
                    </span>
                </div>
            )}
            {error && (
                <div className="error-message">
                    Error: {error}
                </div>
            )}

            <div className="expert-main-content">
                {isMobile ? (
                  <>
                    <div id="map" className="map-container expert-map-container"></div>
                    <div className="side-panel mobile-bottom-panel">
                        <div className="panel-header">
                            <h4 className="panel-title">
                                {selectedCountry ? `${selectedCountry} Ocean Experts` : 'Pacific Ocean Experts'}
                            </h4>
                        </div>
                        {/* Add search input */}
                        {selectedExperts.length > 0 && (
                            <div className="search-container">
                                <input
                                    type="text"
                                    placeholder="Filter by name..."
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                    className="search-input"
                                />
                                {filterText && (
                                    <button 
                                        className="clear-search"
                                        onClick={() => setFilterText('')}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        )}
                        <div className="expert-list-container">
                            {selectedExperts.length > 0 ? (
                                <>
                                    {filteredExperts.length > 0 ? (
                                        <ul className="expert-list">
                                            {filteredExperts.map((expert, index) => (
                                                <li 
                                                    key={index} 
                                                    className="expert-item"
                                                    onClick={() => {
                                                        mapRef.current.setView([expert.latitude, expert.longitude], 10);
                                                    }}
                                                    onMouseEnter={() => handleExpertHover(expert, true)}
                                                    onMouseLeave={() => handleExpertHover(expert, false)}
                                                >
                                                    <div className="expert-content">
                                                        <div 
                                                            className="expert-avatar"
                                                            style={{ backgroundColor: expert.color }}
                                                        >
                                                            {expert.fname?.[0]}{expert.sname?.[0]}
                                                        </div>
                                                        <div className="expert-details">
                                                            <b className="expert-name">
                                                                {expert.fname} {expert.sname}
                                                            </b>
                                                            <div className="expert-institution">
                                                                {expert.inst_name || 'No institution specified'}
                                                            </div>
                                                            <div className="expert-meta">
                                                                <span>Country: {expert.country}</span>
                                                                <span className="divider">|</span>
                                                                <a 
                                                                    href={`https://oceanexpert.org/expert/${expert.id_ind}`} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="expert-link"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    View Profile
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="empty-state">
                                            No experts match your search criteria
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="empty-state">
                                    Click on a cluster to view experts
                                    <div className="source-link-container">
                                        Source: <a 
                                            href="https://oceanexpert.org/" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="source-link"
                                        >
                                            oceanexpert.org
                                        </a>
                                    </div>
                                    <div className="disclaimer-container">
                                        <h5>Disclaimer</h5>
                                        <p>
                                        Data and information provided on this site are provided "as is", without warranty of any kind, 
                                        either express or implied, including, without limitation, warranties of merchantability, 
                                        fitness for a particular purpose and non-infringement. The COSPPac Ocean Portal does not make 
                                        any warranties or representations as to the accuracy or completeness of any such materials. 
                                        The User specifically acknowledges and agrees that the use of this site is at the User's sole risk.
                                        </p>
                                    </div>
                                    </div>
                            )}
                        </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div id="map" className="map-container expert-map-container"></div>
                    <div className="side-panel">
                        <div className="panel-header">
                            <h4 className="panel-title">
                                {selectedCountry ? `${selectedCountry} Ocean Experts` : 'Pacific Ocean Experts'}
                            </h4>
                        </div>
                        {/* Add search input */}
                        {selectedExperts.length > 0 && (
                            <div className="search-container">
                                <input
                                    type="text"
                                    placeholder="Filter by name..."
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                    className="search-input"
                                />
                                {filterText && (
                                    <button 
                                        className="clear-search"
                                        onClick={() => setFilterText('')}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        )}
                        <div className="expert-list-container">
                            {selectedExperts.length > 0 ? (
                                <>
                                    {filteredExperts.length > 0 ? (
                                        <ul className="expert-list">
                                            {filteredExperts.map((expert, index) => (
                                                <li 
                                                    key={index} 
                                                    className="expert-item"
                                                    onClick={() => {
                                                        mapRef.current.setView([expert.latitude, expert.longitude], 10);
                                                    }}
                                                    onMouseEnter={() => handleExpertHover(expert, true)}
                                                    onMouseLeave={() => handleExpertHover(expert, false)}
                                                >
                                                    <div className="expert-content">
                                                        <div 
                                                            className="expert-avatar"
                                                            style={{ backgroundColor: expert.color }}
                                                        >
                                                            {expert.fname?.[0]}{expert.sname?.[0]}
                                                        </div>
                                                        <div className="expert-details">
                                                            <b className="expert-name">
                                                                {expert.fname} {expert.sname}
                                                            </b>
                                                            <div className="expert-institution">
                                                                {expert.inst_name || 'No institution specified'}
                                                            </div>
                                                            <div className="expert-meta">
                                                                <span>Country: {expert.country}</span>
                                                                <span className="divider">|</span>
                                                                <a 
                                                                    href={`https://oceanexpert.org/expert/${expert.id_ind}`} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="expert-link"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    View Profile
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="empty-state">
                                            No experts match your search criteria
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="empty-state">
                                    Click on a cluster to view experts
                                    <div className="source-link-container">
                                        Source: <a 
                                            href="https://oceanexpert.org/" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="source-link"
                                        >
                                            oceanexpert.org
                                        </a>
                                    </div>
                                    <div className="disclaimer-container">
                                        <h5>Disclaimer</h5>
                                        <p>
                                        Data and information provided on this site are provided "as is", without warranty of any kind, 
                                        either express or implied, including, without limitation, warranties of merchantability, 
                                        fitness for a particular purpose and non-infringement. The COSPPac Ocean Portal does not make 
                                        any warranties or representations as to the accuracy or completeness of any such materials. 
                                        The User specifically acknowledges and agrees that the use of this site is at the User's sole risk.
                                        </p>
                                    </div>
                                    </div>
                            )}
                        </div>
                    </div>
                  </>
                )}
            </div>
        </div>
    );
};

export default Experts; 