"use client"; // Ensure this is a Client Component
import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Spinner } from 'react-bootstrap';
import MyAccordion from './accordion';
import AccordionMetadata from './accordion_metadata';
import { get_url } from '@/components/json/urls';
import { useAppSelector } from "@/app/GlobalRedux/hooks";
import { FaRegCircle, FaDotCircle } from 'react-icons/fa';
//import '@/components/css/modal.css'; // Import your CSS file

const ExploreModal = ({ show, onClose, title, bodyContent }) => {
  const [theme, setTheme] = useState([]);
  const [selectedId, setSelectedId] = useState(null); // No theme selected by default
  const [data, setData] = useState(null); // Single state to store both the tailored and theme-based data
  const [loading, setLoading] = useState(false); // State for loading
  const [userId, setUserId] = useState(null); // State to store the userId (token)
  const [showTailoredContent, setShowTailoredContent] = useState(false); // Tailored content shown by default if logged in
  const [country, setCountry] = useState(null);
  const countryId = useAppSelector((state) => state.auth.country);

  // Fetch data based on the selectedId (theme-based data)
  const fetchData = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(get_url('root_menu', id));
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Fetch error: ", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch session to get the userId
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/session");
        const data = await response.json();
        setCountry(data.countryId)
        setUserId(data.userId); // Set userId when the session is fetched
      } catch (error) {
        console.error("Failed to fetch session:", error);
      }
    };
    fetchSession();
  }, [countryId,country]);

  // Fetch tailored menu data using the userId as the bearer token
  const fetchTailoredMenu = async (country) => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetch(get_url('tailored_menu')+"/?country_id="+country+"&format=json", {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userId}`,
        },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch tailored menu data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch theme data when the modal loads
  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await fetch(get_url('theme'));
        const data = await response.json();
        setTheme(data);
      } catch (error) {
        console.error('Error fetching themes:', error);
      }
    };

    fetchThemes();
  }, []);

  // When the userId is updated, ensure that "Tailored" is the only active button
  useEffect(() => {
    if (userId) {
      setShowTailoredContent(true); // Show tailored content by default
      setSelectedId(null); // Deselect any theme button
      fetchTailoredMenu(country); // Fetch tailored data for the user
    }
  }, [userId,country]);

  // Handle Tailored button click
  const handleTailoredClick = () => {
    setShowTailoredContent(true); // Show tailored content
    setSelectedId(null); // Deselect any theme button
    fetchTailoredMenu(country); // Fetch tailored menu data
  };

  // Handle theme button click
  const handleThemeClick = (id) => {
    setSelectedId(id); // Set the selected theme ID
    setShowTailoredContent(false); // Switch to theme-based content
    fetchData(id); // Fetch the data for the selected theme
  };

  // Set default selectedId to first theme if no tailored data or userId
  useEffect(() => {
    if (!userId && theme.length > 0 && selectedId === null) {
      setSelectedId(theme[0].id); // Set the first theme as selected by default
      fetchData(theme[0].id); // Fetch data for the first theme
    }
  }, [theme, userId, selectedId]);

  return (
    <>
      <style>{`
        .custom-modal.explore-modal .btn.rounded-pill {
          background: #fff !important;
          color: #519ac2 !important;
        }
        .custom-modal.explore-modal .btn.rounded-pill.active {
          background: #fff !important;
          color: #519ac2 !important;
          border-width: 2px !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(81,154,194,0.15);
        }
        body.dark-mode .custom-modal.explore-modal .btn.rounded-pill {
          background: #fff !important;
          color: #519ac2 !important;
       
        }
        body.dark-mode .custom-modal.explore-modal .btn.rounded-pill.active {
          background: #fff !important;
          color: #519ac2 !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(81,154,194,0.25);
        }
        }
      `}</style>
      <Modal show={show} onHide={onClose} centered scrollable size="xl" backdrop={false} className="custom-modal explore-modal">
        <Modal.Header closeButton className="custom-header2" style={{ background: '#519ac2', borderBottom: '1px solid #3c7693', paddingTop: '8px', paddingBottom: '8px', minHeight: 'unset', color: '#ffffff' }}>
          <Modal.Title style={{ fontSize: '18px', color:'#ffffff' }}>
          {/* Show the "Tailored" button only if the user is logged in */}
          {/*
            Temporarily disabled: Tailored Products pill (visible when userId exists)
            {userId && (
              <button
                className={`btn btn-sm rounded-pill ${showTailoredContent ? 'active' : 'btn-light'}`}
                style={{
                  padding: '8px',
                  backgroundColor: '#fff',
                  color: '#519ac2',
                  marginLeft: '4px',
                  border: showTailoredContent ? '2px solid #519ac2' : '1px solid #519ac2',
                  fontWeight: '500'
                }}
                onClick={handleTailoredClick}
              >
                &nbsp;Tailored Products&nbsp;
              </button>
            )}
          */}

          {/* Render the theme buttons */}
          {theme.map((themeItem) => (
            <button
              key={themeItem.id}
              className={`btn btn-sm rounded-pill ${selectedId === themeItem.id ? 'active' : 'btn-light'}`}
              style={{
                padding: '8px',
                backgroundColor: '#fff',
                color: '#519ac2',
                marginLeft: '4px',
                border: selectedId === themeItem.id ? '2px solid #519ac2' : '1px solid #519ac2',
                fontWeight: '500'
              }}
              onClick={() => handleThemeClick(themeItem.id)}
            >
              &nbsp;{themeItem.name} &nbsp;
            </button>
          ))}
        </Modal.Title>
      </Modal.Header>
             <Modal.Body style={{ padding: 0, margin: 0, width: '100%', background: '#ffffff', color: 'var(--color-text, #1e293b)' }}>
         <Row className="g-0">
           <Col md={4} className="scrollable-column" style={{ background: '#f8f8f8' }}>
             {loading ? (
               <Spinner animation="border" variant="primary" style={{ margin: 170 }} />
             ) : (
               <MyAccordion className="scrollable-content modal-accordion" dataset={data} />
             )}
           </Col>
           <Col md={8} className="scrollable-column" style={{ background: '#ffffff', padding: 0 }}>
             <AccordionMetadata />
           </Col>
         </Row>
       </Modal.Body>
      <Modal.Footer className="custom-header2" style={{ background: 'var(--color-surface, #fff)', borderTop: '1px solid var(--color-secondary, #e5e7eb)', paddingTop: '6px', paddingBottom: '6px', minHeight: 'unset' }}>
        <p style={{ fontSize: '11px', color: 'var(--color-secondary, #64748b)', margin: 0 }}>&copy; All Rights Reserved SPC </p>
      </Modal.Footer>
      </Modal>
    </>
  );
};

export default ExploreModal;