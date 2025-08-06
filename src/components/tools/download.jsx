'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '@/app/GlobalRedux/hooks';

function Download({ height }) {
  const mapLayer = useAppSelector((state) => state.mapbox.layers);
  const lastlayer = useRef('');
  const currentId = useAppSelector((state) => state.offcanvas.currentId);
  const [copied, setCopied] = useState(false);

  function getLayerById(layersArray, id) {
    if (!layersArray || !id) return undefined;
    
    for (let i = 0; i < layersArray.length; i++) {
      const layer = layersArray[i];     
      if (layer.id === id || (layer.layer_information && layer.layer_information.id === id)) {
        return layer;
      }
    }
    return undefined; // Return undefined if not found
  }

  // Effect to handle coordinate updates and API requests only when valid coordinates are present
  useEffect(() => {
    // var selected_layer = getLayerById(mapLayer, currentId)
    // let url_map = selected_layer.layer_information.url;
    if (!mapLayer || !currentId) return;
    
    const selected_layer = getLayerById(mapLayer, currentId);
    
    // checking to see if its empty by it i mean selected layers
    if (!selected_layer || !selected_layer.layer_information) {
      console.error('No layer found or layer is missing layer_information');
      return;
    }
    
    const url_map = selected_layer.layer_information.url;
    
    // Add null check for url_map
    if (!url_map) {
      console.error('No URL found in layer information');
      return;
    }
    
    let firstItem;
    if (url_map.includes("ncWMS")) {
      if (url_map.includes('%')) {
        firstItem = url_map.split('%')[0];
        lastlayer.current = firstItem;
      } else {
        lastlayer.current = url_map;
      }
    } else {
      const newurl = url_map.replace('wms', 'dodsC') + ".html";
      lastlayer.current = newurl;
    }
  }, [mapLayer, currentId]);

  // Copy handler
  const handleCopy = () => {
    navigator.clipboard.writeText(lastlayer.current);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: `${height}px`, padding: '10px', backgroundColor: '#f4f4f4', borderRadius: '8px' }}>
        <div style={{ marginBottom: '10px' }}>
          <p style={{ fontSize: '15px', margin: 0, color: '#333' }}>
            <strong>Dataset Name:</strong> {mapLayer[mapLayer.length - 1]?.layer_information.layer_title}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <p style={{ fontSize: '15px', margin: 0, color: '#333', marginRight: '10px' }}>
            <strong>OpenDAP Connector:</strong>
          </p>
          <input
            type="text"
            value={lastlayer.current}
            disabled
            style={{
              padding: '5px 10px',
              fontSize: '14px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: '#e9e9e9',
              color: '#333',
              width: '80%',
              marginRight: '8px'
            }}
          />
          <button
            onClick={handleCopy}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: copied ? '#4caf50' : '#1976d2',
              color: '#fff',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        {/* Logos Section */}
      </div>
      <div style={{ display: 'flex', marginTop: '20px' }}>
        <img
          src="/python.jpg"
          alt="Logo 1"
          style={{
            marginTop: '-10px',
            width: '120px',
            height: '55px',
            marginRight: '10px'
          }}
        />
        <img
          src="/xarray.png"
          alt="Logo 2"
          style={{
            width: '120px',
            height: '30px',
          }}
        />
        <img
          src="/unidata.png"
          alt="Logo 3"
          style={{
            width: '120px',
            height: '30px',
          }}
        />
        <img
          src="/opendap.png"
          alt="Logo 6"
          style={{
            marginTop: -17,
            width: '155px',
            height: '60px',
          }}
        />
      </div>
    </>
  );
}

export default Download;