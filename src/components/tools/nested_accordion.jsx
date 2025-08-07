
'use client';
import React, { useState, useEffect } from 'react';
import { Accordion, Spinner } from 'react-bootstrap';
//import '@/components/css/accordion.css';
// import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { IoMdAddCircleOutline, IoMdCheckmarkCircleOutline } from "react-icons/io";
import { useAppDispatch } from '@/app/GlobalRedux/hooks';
import { setDataset } from '@/app/GlobalRedux/Features/dataset/dataSlice';
import { setAccordion } from '@/app/GlobalRedux/Features/accordion/accordionSlice';

const NestedAccordion = ({ data, openIds }) => {
  const dispatch = useAppDispatch();
  const [activeItemId, setActiveItemId] = useState(null);
  const [sstAccordionOpen, setSstAccordionOpen] = useState(null); // now tracks label string instead of true/false

  const findPathToRoot = (node, targetId) => {
    if (node.content && node.content.some(item => item.id === targetId)) {
      return [node.id, targetId];
    }
    if (node.children) {
      for (const child of node.children) {
        const result = findPathToRoot(child, targetId);
        if (result) {
          return [node.id, ...result];
        }
      }
    }
    return null;
  };

  const findIdsPath = (data, targetId) => {
    for (const rootNode of data) {
      const result = findPathToRoot(rootNode, targetId);
      if (result) {
        return result.reverse();
      }
    }
    return null;
  };

  // Effect to automatically expand accordion when data changes and there's an active item
  useEffect(() => {
    if (data && data.length > 0 && activeItemId) {
      const pathToItem = findIdsPath(data, activeItemId);
      if (pathToItem && pathToItem.length > 0) {
        dispatch(setAccordion(activeItemId));
      }
    }
  }, [data, activeItemId, dispatch]);

  const handleClick = (contentItem) => {
    dispatch(setDataset(contentItem));
    setActiveItemId(contentItem.id);
    
    // Find the path to this item and update accordion state
    const pathToItem = findIdsPath(data, contentItem.id);
    if (pathToItem && pathToItem.length > 0) {
      // Set the accordion to open the path to this item
      dispatch(setAccordion(contentItem.id));
    }
  };

  const getActiveKeys = (items, openIds) => {
    const activeKeys = [];
    if (openIds === '0') {
      activeKeys.push('0');
    } else {
      const findActiveKeys = (items, targetId) => {
        items.forEach((item) => {
          if (item.id === targetId) {
            activeKeys.push(item.id);
          }
          if (item.children && item.children.length > 0) {
            if (item.children.some(child => child.id === targetId)) {
              activeKeys.push(item.id);
              activeKeys.push(targetId);
            } else {
              findActiveKeys(item.children, targetId);
            }
          }
        });
      };
      findActiveKeys(items, openIds);
    }
    return Array.from(new Set(activeKeys));
  };

  let activeKeys = [];
  if (data.length !== 0) {
    // First try to use openIds if provided
    if (openIds !== '') {
      activeKeys = findIdsPath(data, openIds);
    }
    // If no openIds or no path found, try to use activeItemId
    if ((!activeKeys || activeKeys.length === 0) && activeItemId) {
      activeKeys = findIdsPath(data, activeItemId);
    }
    if (activeKeys && activeKeys.length !== 0) {
      activeKeys.shift();
      activeKeys = activeKeys.reverse();
    }
  }

  const countItems = (item) => {
    let count = item.content ? item.content.length : 0;
    if (item.children) {
      item.children.forEach(child => {
        count += countItems(child);
      });
    }
    return count;
  };

  const renderContentItems = (contentItems, parentId) => {
    const grouped = {};
    const regularItems = [];

    contentItems.forEach(item => {
      const match = item.name.match(/\[(.*?)\]/);
      if (match) {
        const label = match[1].trim();
        if (!grouped[label]) {
          grouped[label] = [];
        }
        grouped[label].push(item);
      } else {
        regularItems.push(item);
      }
    });

    return (
      <>
        {/* Render grouped accordions */}
        {Object.entries(grouped).map(([label, items]) => (
          <div key={label} className="sst-accordion-wrapper">
            <Accordion
              activeKey={sstAccordionOpen === label ? label : ''}
              onSelect={() => setSstAccordionOpen(sstAccordionOpen === label ? null : label)}
              flush
            >
              <Accordion.Item 
                eventKey={label}
                style={{ 
                  borderRadius: 0, 
                  padding: 2, 
                  borderRight: '1px solid #ccc', 
                  borderBottom: '1px solid #ccc',
                }}
              >
                <Accordion.Header onClick={(e) => e.currentTarget.blur()}>
                  {label}
                  <span className="badge bg-light text-dark ms-2">{items.length}</span>
                </Accordion.Header>
                <Accordion.Body style={{ paddingLeft: 20, paddingRight: 0, backgroundColor: '#ffffff' }}>
                  {items.map((contentItem, itemIndex) => (
                    <div
                      className={`flex-container ${activeItemId === contentItem.id ? 'active' : ''}`}
                      key={`${contentItem.id}-${itemIndex}`}
                      onClick={() => handleClick(contentItem)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: activeItemId === contentItem.id ? '#d3f4ff' : 'transparent',
                        borderRadius: '4px',
                        padding: '2px',
                      }}
                    >
                      <div className="item">{contentItem.name.replace(/\[.*?\]/, '').trim()}</div>
                      <div className="item">
                        {activeItemId === contentItem.id ? (
                          <IoMdCheckmarkCircleOutline size={22} style={{ cursor: 'pointer', color: 'green' }} />
                        ) : (
                          <IoMdAddCircleOutline size={22} style={{ cursor: 'pointer' }} />
                        )}
                      </div>
                    </div>
                  ))}
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>
        ))}

        {/* Render regular items */}
        {regularItems.map((contentItem, itemIndex) => (
          <div
            className={`flex-container ${activeItemId === contentItem.id ? 'active' : ''}`}
            key={`${contentItem.id}-${itemIndex}`}
            onClick={() => handleClick(contentItem)}
            style={{
              cursor: 'pointer',
              backgroundColor: activeItemId === contentItem.id ? '#d3f4ff' : 'transparent',
              borderRadius: '4px',
              padding: '2px',
              marginTop: '2px'
            }}
          >
            <div className="item">{contentItem.name}</div>
            <div className="item">
              {activeItemId === contentItem.id ? (
                <IoMdCheckmarkCircleOutline size={22} style={{ cursor: 'pointer', color: 'green' }} />
              ) : (
                <IoMdAddCircleOutline size={22} style={{ cursor: 'pointer' }} />
              )}
            </div>
          </div>
        ))}
      </>
    );
  };

  const renderAccordionItems = (items) => {
    return items.map((item, index) => {
      const sortedContent = item.content 
        ? [...item.content].sort((a, b) => a.name.localeCompare(b.name))
        : [];

      return (
        <Accordion.Item eventKey={item.id} key={`${item.id}-${index}`} style={{ borderRadius: 0, padding: 2, borderRight: '1px solid #ccc', borderBottom: '1px solid #ccc' }}>
          <Accordion.Header onClick={(e) => e.currentTarget.blur()}>
            {item.display_title} 
            <span className="badge bg-light text-dark ms-2">
              {countItems(item)}
            </span>
          </Accordion.Header>
          <Accordion.Body style={{ paddingLeft: 20, paddingRight: 0, backgroundColor: '#ffffff' }}>
            {renderContentItems(sortedContent, item.id)}
            {item.children && item.children.length > 0 && (
              <Accordion flush defaultActiveKey={activeKeys}>
                {renderAccordionItems(item.children)}
              </Accordion>
            )}
          </Accordion.Body>
        </Accordion.Item>
      );
    });
  };

  return (
    <>
      {data.length === 0 ? (
        <Spinner animation="border" variant="primary" style={{ marginLeft: 150, marginTop: 50 }} />
      ) : (
        <Accordion flush defaultActiveKey={activeKeys}>
        
          {renderAccordionItems(data)}
        </Accordion>
      )}
    </>
  );
};

export default NestedAccordion;
