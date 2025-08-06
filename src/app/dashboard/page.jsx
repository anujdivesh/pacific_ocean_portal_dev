'use client';
// CHECKPOINT: Shadow DOM implementation with Bootstrap CSS injection
// This version uses Shadow DOM to completely isolate widgets from global styles
// while injecting Bootstrap CSS to maintain proper widget appearance
// Date: Current implementation with fetch-based Bootstrap injection
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Container, Button, Form, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import '@/components/css/card.css';
import { useAppSelector } from '@/app/GlobalRedux/hooks'
import { get_url } from '@/components/json/urls';
import { FaArrowAltCircleLeft  } from "react-icons/fa";
import Link from 'next/link';
// Utility to load a script dynamically
function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
            script.remove();
            reject(`Failed to load ${src}`);
        };
        document.body.appendChild(script);
    });
}

function getWidgetGlobal(componentName) {
    const variants = [
        componentName,
        componentName.toLowerCase(),
        componentName.toUpperCase(),
        componentName.charAt(0).toUpperCase() + componentName.slice(1),
        componentName.charAt(0).toLowerCase() + componentName.slice(1)
    ];
    for (let name of variants) {
        if (window[name] !== undefined) {
            return window[name];
        }
    }
    return undefined;
}

function waitForWidgetGlobal(componentName, timeout = 2000, interval = 50) {
    const start = Date.now();
    return new Promise((resolve, reject) => {
        const check = () => {
            const w = getWidgetGlobal(componentName);
            if (w) {
                resolve(w);
            } else if (Date.now() - start > timeout) {
                reject(new Error('Widget global not found within timeout'));
            } else {
                setTimeout(check, interval);
            }
        };
        check();
    });
}

function getWidgetUrlAndGlobal(componentName) {
    const parts = componentName.split('/');
    if (parts.length === 2) {
        return {
            url: `/widgets/${parts[0]}/${parts[1]}.js`,
            global: parts[1]
        };
    }
    return {
        url: `/widgets/${componentName}.js`,
        global: componentName
    };
}

// This assumes your Navbar height is 64px. Adjust as needed.
const NAVBAR_HEIGHT = 56;

/**
 * Only show vertical scrollbar if vertical overflow is more than 16px.
 * Otherwise, hide it (no scroll for minor overflow).
 */
function FullPageWidget({ componentName, onBack }) {
    const [Widget, setWidget] = useState(null);
    const [error, setError] = useState(null);
    // const shadowHostRef = React.useRef(null);
    // const [shadowRoot, setShadowRoot] = useState(null);

    useEffect(() => {
        // Remove Shadow DOM setup
        // if (shadowHostRef.current && !shadowHostRef.current.shadowRoot) {
        //     const shadow = shadowHostRef.current.attachShadow({ mode: 'open' });
            
        //     // Fetch and inject Bootstrap CSS into the Shadow DOM
        //     fetch('https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css')
        //         .then(res => res.text())
        //         .then(css => {
        //             const style = document.createElement('style');
        //             style.textContent = css;
        //             shadow.appendChild(style);
        //         });

        //     const mountPoint = document.createElement('div');
        //     mountPoint.style.height = '100%';
        //     mountPoint.style.width = '100%';
        //     mountPoint.style.overflow = 'auto';
        //     mountPoint.style.boxSizing = 'border-box';
        //     shadow.appendChild(mountPoint);
        //     setShadowRoot(shadow);

        //     // Override DOM methods to work within Shadow DOM context
        //     const originalGetElementById = document.getElementById;
        //     const originalQuerySelector = document.querySelector;
        //     const originalQuerySelectorAll = document.querySelectorAll;

        //     // Override getElementById to search in Shadow DOM first
        //     document.getElementById = function(id) {
        //         const shadowElement = shadow.getElementById(id);
        //         if (shadowElement) {
        //             return shadowElement;
        //         }
        //         return originalGetElementById.call(document, id);
        //     };

        //     // Override querySelector to search in Shadow DOM first
        //     document.querySelector = function(selector) {
        //         const shadowElement = shadow.querySelector(selector);
        //         if (shadowElement) {
        //             return shadowElement;
        //         }
        //         return originalQuerySelector.call(document, selector);
        //     };

        //     // Override querySelectorAll to search in Shadow DOM first
        //     document.querySelectorAll = function(selector) {
        //         const shadowElements = shadow.querySelectorAll(selector);
        //         if (shadowElements.length > 0) {
        //             return shadowElements;
        //         }
        //         return originalQuerySelectorAll.call(document, selector);
        //     };

        //     // Store original methods for cleanup
        //     shadow._originalMethods = {
        //         getElementById: originalGetElementById,
        //         querySelector: originalQuerySelector,
        //         querySelectorAll: originalQuerySelectorAll
        //     };
        // }
    }, []);

    useEffect(() => {
        if (!componentName) return;
        // if (!componentName || !shadowRoot) return;

        let cancelled = false;
        setWidget(null);
        setError(null);

        async function loadAndSetWidget() {
            const { url: widgetUrl, global: globalName } = getWidgetUrlAndGlobal(componentName);
            try {
                await loadScript(widgetUrl);
                const w = await waitForWidgetGlobal(globalName, 2000, 50);

                if (cancelled) return;
                if (w && w.default) {
                    setWidget(() => w.default);
                } else if (typeof w === 'function' || (typeof w === 'object' && w !== null)) {
                    setWidget(() => w);
                } else {
                    setError('Widget not found or invalid format.');
                }
            } catch (err) {
                setError(
                    err.message === 'Widget global not found within timeout'
                        ? 'Widget loaded, but did not register a global variable in time.'
                        : 'Failed to load widget script.'
                );
            }
        }
        loadAndSetWidget();

        return () => {
            cancelled = true;
        };
    }, [componentName]);

    // Remove Shadow DOM cleanup
    // useEffect(() => {
    //     return () => {
    //         if (shadowRoot && shadowRoot._originalMethods) {
    //             document.getElementById = shadowRoot._originalMethods.getElementById;
    //             document.querySelector = shadowRoot._originalMethods.querySelector;
    //             document.querySelectorAll = shadowRoot._originalMethods.querySelectorAll;
    //         }
    //     };
    // }, [shadowRoot]);

    return (
        <div
            style={{
                position: 'fixed',
                top: NAVBAR_HEIGHT,
                left: 0,
                height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
                width: '100vw',
                background: '#fff',
                zIndex: 1200,
                padding: 0,
                margin: 0,
                overflow: 'hidden',
                boxSizing: 'border-box'
            }}
        >
          <Button 
                onClick={onBack}
                style={{
                    position: 'fixed',
                    top: 5,
                    left: '50%',
                   
                    zIndex: 1300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid var(--color-border, #e5e7eb)',
                    color: 'var(--color-primary, #2563eb)',
                    borderRadius: '12px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s ease',
                    minWidth: '160px'
                }}
                onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                }}
            >
                <FaArrowAltCircleLeft style={{ marginRight: '8px', fontSize: '16px' }} />
                Back to Dashboard
            </Button>

            {error && <div className="alert alert-danger" style={{ marginTop: 80 }}>{error}</div>}
            {!error && !Widget && <div style={{ marginTop: 80, textAlign: 'center' }}>Loading widget...</div>}

            {/* Remove Shadow DOM host, just render widget directly */}
            {/* <div ref={shadowHostRef} ...> ... </div> */}
            {Widget && (
                <div className="dashboard-widget-container" style={{ height: `calc(100vh - ${NAVBAR_HEIGHT}px)`, width: '100vw', minWidth: '100vw', boxSizing: 'border-box', overflow: 'hidden' }}>
                    <Widget height={`calc(100vh - ${NAVBAR_HEIGHT}px)`} width="100vw" />
                </div>
            )}
        </div>
    );
}

function Dashboard() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fullPageWidget, setFullPageWidget] = useState(null);

    const [search, setSearch] = useState('');

    const token = useAppSelector((state) => state.auth.token);
    const country = useAppSelector((state) => state.auth.country);
    const isLoggedin = useAppSelector((state) => state.auth.isLoggedin);

    useEffect(() => {
        const fetchDashboards = async () => {
            setLoading(true);
            setError(null);
            try {
                const publicUrl = get_url('root-path') + '/middleware/api/widget/?format=json';
                const publicRes = await fetch(publicUrl);
                if (!publicRes.ok) throw new Error('Failed to fetch public dashboards');
                const publicDashboards = await publicRes.json();

                let countryDashboards = [];
                if (isLoggedin && country) {
                    const countryUrl = get_url('root-path') + `/middleware/api/widget/?format=json&country_id=${country}`;
                    const headers = token ? { Authorization: `Bearer ${token}` } : {};
                    const countryRes = await fetch(countryUrl, { headers });
                    if (!countryRes.ok) throw new Error('Failed to fetch country dashboards');
                    countryDashboards = await countryRes.json();
                }

                const dashboardsById = {};
                [...publicDashboards, ...countryDashboards].forEach(d => { dashboardsById[d.id] = d; });
                setProjects(Object.values(dashboardsById));
            } catch (err) {
                setError(err.message || 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboards();
    }, [token, country, isLoggedin]);

    const filteredProjects = projects.filter(card =>
        card.display_title && card.display_title.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger mx-auto mt-5" style={{ maxWidth: '600px' }}>
                Error: {error}
            </div>
        );
    }

    if (fullPageWidget) {
        return (
            <FullPageWidget
                componentName={fullPageWidget}
                onBack={() => setFullPageWidget(null)}
            />
        );
    }

    return (
        <main className="py-4">
            <Container>
                <div className="mb-5">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
                        <Link href="/" style={{ display: 'inline-block', textDecoration: 'none' }}>
                            {/* Replace with your logo image or text as needed */}
                            {/* <img src="/COSPPac-Logo-Acronym-EDITED II.png" alt="Logo" style={{ height: '48px', cursor: 'pointer' }} /> */}
                        </Link>
                        <h1 className="display-9 mb-0">Dashboard Collections</h1>
                    </div>
                    <div className="d-flex justify-content-center">
                        <Form className="mt-3" autoComplete="off" onSubmit={e => e.preventDefault()} style={{ width: '100%' }}>
                            <InputGroup>
                                                            <InputGroup.Text
                                style={{
                                    background: 'var(--color-surface, #fff)',
                                    border: document.body.classList.contains('dark-mode') ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--color-secondary, #e5e7eb)',
                                    borderRight: 'none',
                                    paddingRight: 0,
                                    color: document.body.classList.contains('dark-mode') ? 'var(--color-secondary, #a1a1aa)' : 'var(--color-secondary, #64748b)',
                                    borderTopLeftRadius: 12,
                                    borderBottomLeftRadius: 12,
                                    borderTopRightRadius: 0,
                                    borderBottomRightRadius: 0,
                                    boxShadow: document.body.classList.contains('dark-mode') ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
                                }}
                            >
                                <FaSearch size={16} />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Search dashboards by title..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{
                                    border: document.body.classList.contains('dark-mode') ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--color-secondary, #e5e7eb)',
                                    borderLeft: 'none',
                                    borderTopLeftRadius: 0,
                                    borderBottomLeftRadius: 0,
                                    borderTopRightRadius: 12,
                                    borderBottomRightRadius: 12,
                                    boxShadow: document.body.classList.contains('dark-mode') ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
                                    paddingLeft: 16,
                                    paddingRight: 16,
                                    paddingTop: 12,
                                    paddingBottom: 12,
                                    fontSize: '16px',
                                    background: 'var(--color-surface, #fff)',
                                    color: 'var(--color-text, #1e293b)',
                                }}
                            />
                            </InputGroup>
                        </Form>
                    </div>
                </div>

                <div className="row g-4">
                    {filteredProjects.length === 0 && (
                        <div className="col-12">
                            <div className="alert alert-danger border border-danger text-danger text-center bg-transparent">
                                No dashboards match your search.
                            </div>
                        </div>
                    )}
                    {filteredProjects.map(card => (
                        <div key={card.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                            <div className="card h-100 shadow-sm border-0 overflow-hidden">
                                <div className="card-img-top overflow-hidden" style={{ height: '180px' }}>
                                    <img
                                        src={card.display_image_url}
                                        className="w-100 h-100 object-cover"
                                        alt={card.display_title}
                                    />
                                </div>
                                <div className="card-body d-flex flex-column">
                                    <h5 className="card-title fw-bold mb-3 text-truncate">
                                        {card.display_title}
                                    </h5>
                                    <div className="mb-3">
                                        <p className="mb-1 small text-muted">
                                            <span className="fw-semibold">Project:</span> {card.project.project_code}
                                        </p>
                                        <p className="mb-0 small text-muted">
                                            <span className="fw-semibold">Maintainer:</span> {card.maintainer}
                                        </p>
                                    </div>
                                    {card.component_name ? (
                                        <Button
                                            variant="primary"
                                            className="w-100 d-flex align-items-center justify-content-center py-2 mt-auto"
                                            style={{
                                                backgroundColor: '#4a6bff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onClick={() => setFullPageWidget(card.component_name)}
                                        >
                                            Explore Dashboard
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            className="w-100 d-flex align-items-center justify-content-center py-2 mt-auto"
                                            style={{
                                                border: 'none',
                                                borderRadius: '8px',
                                                transition: 'all 0.3s ease'
                                            }}
                                            disabled
                                        >
                                            No Dashboard Available
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
            <style>{`
                .dashboard-widget-container select,
                .dashboard-widget-container .accordion,
                .dashboard-widget-container .accordion * {
                  all: unset;
                  box-sizing: border-box;
                  font-family: inherit;
                }
                .dashboard-widget-container select {
                  appearance: auto;
                  padding: 0.5em 1em;
                  border: 1px solid #ccc;
                  background: #fff;
                  color: #222;
                  border-radius: 4px;
                  font-size: 1em;
                }
                .dashboard-widget-container .accordion {
                  /* Add your widget's accordion base styles here */
                }
            `}</style>
        </main>
    );
}

export default Dashboard;