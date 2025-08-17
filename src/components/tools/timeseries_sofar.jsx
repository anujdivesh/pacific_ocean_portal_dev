'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Spinner, Form } from 'react-bootstrap'; 
import { Line } from 'react-chartjs-2'; 
import 'chart.js/auto'; 
import { useAppSelector } from '@/app/GlobalRedux/hooks';
import Lottie from "lottie-react";
import animationData from "@/components/lottie/live.json";
import { get_url } from '@/components/json/urls';

const fixedColors = [
  'rgb(255, 87, 51)',
  'rgb(153, 102, 255)', 
  'rgb(255, 206, 86)', 
  'rgb(54, 162, 235)', 
  'rgb(255, 99, 132)', 
  'rgb(75, 192, 192)', 
];

const getColorByIndex = (index) => {
  return fixedColors[index] || 'rgb(169, 169, 169)'; 
};

function TimeseriesSofar({ height }) {
  const mapLayer = useAppSelector((state) => state.mapbox.layers);
  const lastlayer = useRef(0);
  const { x, y, sizex, sizey, bbox, station,country_code } = useAppSelector((state) => state.coordinate.coordinates);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [enabledChart, setEnabledChart] = useState(true);
  const [liveMode, setLiveMode] = useState(false);
  const [dataLimit, setDataLimit] = useState(100);
  const refreshIntervalRef = useRef(null);

  const isCoordinatesValid = station !== null;
  const isActive = y === 'TRUE';

  function getValueByKey(key) {
    const keyValuePairs = {
        'SPC': 'c3abab55e2e549f02fdb683bd936c7',
        'FMS': 'b9f2c081116e70f44152dd9aa45dcb',
        'KMS': 'e62e5e58efac587d2c7eb4a1d938b0',
        'SamoaMet': 'e5c7ab12898f4414c0acf817b4bbde',
        'TongaMet': '743acb9023dec1ef847d5651596352',
        'TMS': '99a920305541f1c38db611ebab95ba',
        'NMS':'2a348598f294c6b0ce5f7e41e5c0f5'
    };
    return keyValuePairs[key] || null;
  }

  function generateWaveDataUrl(spotterId, token) {
    // const baseUrl = "https://api.sofarocean.com/api/wave-data";
    const baseUrl = get_url('insitu-station');
  
    // console.log(`${baseUrl}/${spotterId.toString()}`)
    // const queryParams = new URLSearchParams({
    //     spotterId: spotterId,
    //     token: token,
    //     includeWindData: false,
    //     includeDirectionalMoments: true,
    //     includeSurfaceTempData: true,
    //     limit: dataLimit,
    //     includeTrack: true
    // });
    // return `${baseUrl}?${queryParams.toString()}`;
    return `${baseUrl}/${spotterId.toString()}?limit=1000`;
    // return `${baseUrl}`
  }

  const fetchWaveData = async (url, setDataFn) => {
    try {
      if (!url) {
        setDataFn([], []);
        return;
      }
   
      setIsLoading(true);
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const waveData = data.data;
      const dataLabels = data.data_labels ? data.data_labels.split(',') : [];
  
      // data.data.forEach((entry, idx) => {
      //   console.log(`Entry ${idx}:`, entry);
      // });
    
  // Find the time label 
  const timeLabel = dataLabels.find(label => label.trim().toLowerCase() === 'time');
  if (!timeLabel) {
    throw new Error('No "time" label found in data_labels');
  }
  //y-axis datasets
  const yLabels = dataLabels.filter(label => label.trim() !== timeLabel);

    // X-axis labels (format as UTC)
    const times = waveData.map(entry => {
      const time = entry[timeLabel];
      const date = new Date(time);      
      return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getFullYear()).slice(-2)}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    });
      // Y-axis datasets (dynamic)
      const datasets = yLabels.map(label => ({
        label: label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
        values: waveData.map(entry => entry[label])
      }));
      setDataFn(times, datasets);
  } catch (error) {
    console.log(`Error fetching wave data:`, error);
    setDataFn([], []);
  } finally {
    setIsLoading(false);
  }
};

  const fetchWaveDataV2 = async (url, setDataFn) => {
    try {
      if (!url) {
        setDataFn([], []);
        return;
      }
   
      setIsLoading(true);
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'omit', // Fixes CORS for public ERDDAP
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const features = data.features;

      const times = features.map(feature => feature.properties.time);
      const waveHeights = features.map(feature => feature.properties.waveHs);
      const peakPeriods = features.map(feature => feature.properties.waveTp);
      const meanDirections = features.map(feature => feature.properties.waveDp);

      const formattedTimes = times.map(time => {
        const date = new Date(time);
        return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getFullYear()).slice(-2)}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      });

      setDataFn(formattedTimes, [
        { values: waveHeights, label: 'Significant Wave Height (m)' },
        { values: peakPeriods, label: 'Peak Period (s)' },
        { values: meanDirections, label: 'Mean Direction (degrees)' }
      ]);
      
    } catch (error) {
      console.log(`Error fetching wave data:`, error);
      setDataFn([], []);
    } finally {
      setIsLoading(false);
    }
  };

  const setChartDataFn = (times, datasets) => {

    console.log("START LABEL AND VALUE>>>>>>>>>>>>>>>");

    console.log("<<<<<<<<<<< LABEL AND VALUE END");
    
    setChartData({
      labels: times,
      datasets: datasets.map((dataset, index) => {
        console.log(dataset)
        // Filter out -999 values by replacing them with null to create gaps
        const filteredValues = dataset.values.map(value => {
          // Check for -999 or similar missing data indicators
          if (value === -999 || value === "-999" || value === -999.0 || value === -999.9 || 
              value === null || value === undefined || 
              (typeof value === 'number' && isNaN(value))) {
            return null;
          }
          return value;
        });

        const baseConfig = {
          label: dataset.label,
          data: filteredValues,
          borderColor: getColorByIndex(index),
          backgroundColor: getColorByIndex(index),
          fill: false,
          tension: 0.4,
          cubicInterpolationMode: 'monotone',
          yAxisID: `y-axis-${index}`,
          spanGaps: false, // This ensures gaps are shown as breaks in the line
        };
  
        if (index === 2) {
          return {
            ...baseConfig,
            showLine: false,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointStyle: 'circle',
          };
        }
  
        return baseConfig;
      }),
    });
  };

  const toggleLiveMode = () => {
    if (isActive) {
      setLiveMode(!liveMode);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    if (!isNaN(newLimit)) {
      setDataLimit(Math.min(1000, Math.max(1, newLimit)));
    }
  };

  useEffect(() => {
    const layerInformation = mapLayer[mapLayer.length - 1]?.layer_information;
    if (country_code !== "PACIOOS"){
    
    if (isCoordinatesValid && mapLayer.length > 0) {
      const { timeseries_url } = layerInformation;
      
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
      
      var token = getValueByKey(x);
      const waveDataUrl = generateWaveDataUrl(station, token);
      
      fetchWaveData(waveDataUrl, setChartDataFn);

      if (liveMode && isActive) {
        refreshIntervalRef.current = setInterval(() => {
          fetchWaveData(waveDataUrl, setChartDataFn);
        }, 1800000);
      }

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }
  else{
    if (isCoordinatesValid && mapLayer.length > 0) {
    const now = new Date();

    // Calculate start date (7 days back)
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 5);
    
    // Format dates in YYYY-MM-DDThh:mm:ssZ format
    const formatDate = (date) => {
        return date.toISOString().slice(0, 19) + 'Z';
    };
    
    const baseUrl = 'https://erddap.cdip.ucsd.edu/erddap/tabledap/wave_agg.geoJson';
    const parameters = 'station_id,time,waveHs,waveTp,waveTa,waveDp,latitude,longitude';
    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(now);
    const waveFlagPrimary = 1;

    // Construct URL with variables
    const url = `${baseUrl}?${parameters}&station_id="${station}"&time>=${startDateStr}&time<=${endDateStr}&waveFlagPrimary=${waveFlagPrimary}`;

    fetchWaveDataV2(url, setChartDataFn);

      if (liveMode && isActive) {
        refreshIntervalRef.current = setInterval(() => {
          fetchWaveDataV2(url, setChartDataFn);
        }, 1800000);
      }

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };

  }

  }
  }, [isCoordinatesValid, enabledChart, mapLayer, station,country_code, liveMode, isActive, dataLimit]);

  if (isLoading) {
    return (
      <div style={{ 
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
      }}>
        <Spinner animation="border" role="status" variant="primary"/>
        <span style={{ marginLeft: '10px', fontSize: '18px' }}>Fetching data from API...</span>
      </div>
    );
  }

  if (!isCoordinatesValid || !station) {
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
      }}>
        <p style={{ fontSize: 16, color: 'var(--color-text, #333)' }}>Please select a station to view wave data.</p>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: `${height}px`,
      position: 'relative',
      background: 'var(--color-surface, #fff)',
      color: 'var(--color-text, #181c20)'
    }}>
      <div style={{ 
        height: '35px',
        display: 'flex', 
        alignItems: 'center',
        padding: '0 10px',
        backgroundColor: 'var(--color-surface, #f8f9fa)',
        borderBottom: '1px solid var(--color-secondary, #dee2e6)',
        flexShrink: 0,
        marginTop: '-10px',
        gap: '10px',
        color: 'var(--color-text, #181c20)'
      }}>
        <Form.Check 
          type="switch"
          id="live-mode-switch"
          label=""
          checked={liveMode}
          onChange={toggleLiveMode}
          disabled={!isActive}
          style={{ 
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            transform: 'scale(1.2)',
            opacity: isActive ? 1 : 0.6
          }}
        />
        
        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text, #181c20)' }}>
          {liveMode && isActive ? (
            <>
              <Lottie
                animationData={animationData}
                style={{ width: 20, height: 20, marginRight: '-4px',marginTop:'-8px' }}
                loop={true}
              />
              <i className="fas fa-circle" style={{ fontSize: '12px', color: '#28a745', marginRight: '5px' }}></i>
            </>
          ) : (
            <i className="fas fa-circle" style={{ 
              fontSize: '12px', 
              color: isActive ? '#ccc' : '#ff6b6b',
              marginRight: '5px' 
            }}></i>
          )}
          <span style={{ 
            fontSize: '12px',
            color: !isActive ? '#ff6b6b' : 'var(--color-text, #181c20)'
          }}>
            {isActive 
              ? `Live Mode ${liveMode ? '(Active - 30 min updates)' : '(Inactive)'}`
              : 'Live Mode Disabled (Station Inactive)'}
          </span>
        </div>

        <div style={{  display: 'flex', alignItems: 'center', color: 'var(--color-text, #181c20)' }}>
          <span style={{ fontSize: '12px', marginRight: '5px' }}>Data Points:</span>
          <Form.Control
            type="number"
            value={dataLimit}
            onChange={handleLimitChange}
            min="1"
            max="1000"
            style={{ 
              width: '60px',
              height: '25px',
              fontSize: '12px',
              padding: '0 5px',
              background: 'var(--color-surface, #fff)',
              color: 'var(--color-text, #181c20)',
              border: '1px solid var(--color-secondary, #dee2e6)'
            }}
          />
        </div>
      </div>
      {/* <<<<<<<<<<Spotter ID Heading */}
      {/* <div style={{
        padding: '0 10px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6',
        fontWeight: 'bold',
        fontSize: '14px'
      }}>
        Spotter ID: {station}
      </div> */}
      {/* >>>>>>>>>>>END Spotter ID Heading */}
      <div style={{ 
        flex: 1,
        position: 'relative',
        minHeight: 0
      }}>
        {/* Dynamic y-axes logic */}
        {(() => {
          // Check if dark mode is active
          const isDarkMode = document.body.classList.contains('dark-mode');
          const textColor = isDarkMode ? '#ffffff' : '#333';
          const gridColor = isDarkMode ? '#4a5568' : '#e0e0e0';
          
          // Build y-axes dynamically based on datasets
          const yAxes = chartData.datasets.map((dataset, index) => ({
            id: `y-axis-${index}`,
            type: 'linear',
            display: true,
            position: 'right', 
            title: {
              display: true,
              text: dataset.label,
              color: textColor,
              font: {
                weight: 'normal'
              }
            },
            ticks: {
              color: textColor,
              font: {
                weight: 'normal'
              }
            },
            grid: {
              drawOnChartArea: index === 0, // only draw grid for the first axis
              color: gridColor,
            },
          }));

          // Build the scales object
          const scales = {
            x: {
              ticks: {
                display: true,
                maxRotation: 45,
                autoSkip: true,
                color: textColor,
                font: {
                  weight: 'normal'
                }
              },
              grid: {
                color: gridColor,
              },
            },
          };

          yAxes.forEach(axis => {
            scales[axis.id] = axis;
          });

          return (
            <Line
              data={chartData}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                scales: scales,
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                plugins: {
                  tooltip: {
                    backgroundColor: isDarkMode ? '#2d3748' : 'rgba(0,0,0,0.8)',
                    titleColor: isDarkMode ? '#ffffff' : '#fff',
                    bodyColor: isDarkMode ? '#ffffff' : '#fff',
                    borderColor: isDarkMode ? '#4a5568' : '#ccc',
                    borderWidth: 1,
                    callbacks: {
                      label: function(context) {
                        return `${context.dataset.label}: ${context.parsed.y}`;
                      }
                    }
                  },
                  legend: {
                    labels: {
                      color: textColor,
                      font: {
                        weight: 'normal'
                      }
                    }
                  }
                }
              }}
            />
          );
        })()}
      </div>
    </div>
  );
}

export default TimeseriesSofar;