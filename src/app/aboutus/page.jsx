'use client';
import React from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const Aboutus = () => {
    const pathname = usePathname();
    
    // Donors data
    const donors = [
        {
            name: "Australian Government",
            logo: "/logos/AUSAID.png",
            description: "The Department of Foreign Affairs and Trade (DFAT) promotes and protects Australia's international interests to support our security and prosperity.",
            website: "https://www.dfat.gov.au/"
        },
        {
            name: "New Zealand Government",
            logo: "/logos/MFAT.png",
            description: "The Ministry acts in the world to build a safer, more prosperous and more sustainable future for New Zealanders.",
            website: "https://www.mfat.govt.nz/"
        }
    ];
    
    // Technical partners data
        const technicalPartners = [
        {
            name: "Bureau of Meteorology Australia (BOM)",
            logo: "/logos/Bureaulogo1.png",
            description: "The Bureau of Meteorology (BOM) is Australia's national weather, climate, and water agency. ",
            website: "http://www.bom.gov.au/"
        },
        {
            name: "Geoscience Australia (GA)",
            logo: "/logos/GA.png",
            description: "Geoscience Australia is a statutory agency that conducts geoscientific research and serves as a repository for Australian geographic and geological data. ",
            website: "https://www.ga.gov.au/"
        },
        {
            name: "National Institute of Water and Atmospheric Research (NIWA)",
            logo: "/logos/NIWAES.png",
            description: "NIWA, the National Institute of Water and Atmospheric Research, is a Crown Research Institute established in 1992.",
            website: "https://niwa.co.nz/"
        },
        {
            name: "Pacific Community (SPC)",
            logo: "/logos/SPC.png",
            description: "The principal scientific and technical organization in the Pacific region, supporting development since 1947.",
            website: "https://www.spc.int/"
        },
        {
            name: "Pacific Regional Environment Programme (SPREP)",
            logo: "/logos/SPREP.png",
            description: "SPREP is charged with protecting and managing the environment and natural resources of the Pacific.",
            website: "https://www.sprep.org/"
        }
    ];

    return (
        <div style={{ 
            height: 'calc(100vh - 60px)', 
            overflowY: 'auto', 
            overflowX: 'hidden',
            
            paddingBottom: '2rem'
        }}>
            <div className="w-100 py-3" style={{  marginTop: 0, paddingTop: '1rem' }}>
                <Container fluid>
                    <h2 className='text-center mb-0' style={{ color: 'var(--color-primary)', marginTop: 0, paddingTop: 0 }}>
                        About Us
                    </h2>
                </Container>
            </div>
            
            <Container fluid className='mt-4 px-0'>
                <div className='py-3 px-3' style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Intro Section */}
                    <Card className='mb-4 shadow-sm' style={{ background: 'var(--color-surface)', border: 'none' }}>
                        <Card.Body style={{ padding: '2rem' }}>
                            <p style={{ color: 'var(--color-text)', fontSize: '1.1rem', marginBottom: 0 }}>
                                The Pacific Ocean Portal is an online tool developed and maintained by the Climate and Oceans Support Program in the Pacific (COSPPac) and supported by the Australian and New Zealand Governments. The ocean portal provides access to historical, near real-time, and future ocean conditions, as well as in situ observations. It has been designed to meet the needs of a wide range of ocean stakeholders across the Pacific, providing customizable maps and graphs, and a vast array of data sets. For example, fisheries can use sea surface temperatures forecasts and daily chlorophyll maps to indicate areas of high biological activity, or the shipping sector can take the wave forecast data set into consideration to plan offshore shipping activities.
                            </p>
                            <p className='mt-3' style={{ color: 'var(--color-text)', fontSize: '1.1rem' }}>
                                While the development of the Pacific Ocean Portal has been significantly supported by COSPPac, the Pacific Community extends its gratitude to the various data providers and projects whose contributions have been instrumental in enabling access to their datasets and ensuring the delivery of oceanographic information for the region.
                            </p>
                        </Card.Body>
                    </Card>

                    {/* Disclaimer Section */}
                    <Card className='mb-5 shadow-sm' style={{ background: 'var(--color-surface)', border: 'none' }}>
                        <Card.Body style={{ padding: '2rem' }}>
                            <h5 className='mb-3' style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Disclaimer</h5>
                            <p style={{ color: 'var(--color-text)' }}>
                                Please note that all data sets available from the Pacific Ocean Portal are provided on an 'as is' basis, without warranty, representation or guarantee of any type as to any errors and omissions, or as to the content, accuracy, timeliness, completeness or fitness for any particular purpose or use. Information about data ownership is clearly outlined in the metadata for each dataset. If you find any information that you believe may be inaccurate, please contact the provider of this data, including information about methodology and technical material.
                            </p>
                            <p style={{ color: 'var(--color-text)' }}>
                                For assistance with the Portal's use and customization, please contact <a href="mailto:cosppac@spc.int" style={{ color: 'var(--color-accent)' }}>cosppac@spc.int</a>.
                            </p>
                            <p style={{ color: 'var(--color-text)' }}>
                                In addition, please note that the data products available from the portal are not intended to constitute advice and must not be used as a substitute for professional advice.
                            </p>
                        </Card.Body>
                    </Card>
                    
                    {/* Donors Section */}
                    <div className='mt-5'>
                        <h5 className='mb-4' style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Donors</h5>
                        <Row className='g-4'>
                            {donors.map((donor, index) => (
                                <Col key={index} md={6}>
                                    <Card className='h-100 shadow-sm' style={{ background: 'var(--color-surface)', border: 'none' }}>
                                        <Card.Body className='p-4'>
                                            <div className='d-flex'>
                                                <div style={{ width: '180px', height: '180px', position: 'relative', flexShrink: 0 }}>
                                                    <Image 
                                                        src={donor.logo} 
                                                        alt={donor.name}
                                                        fill
                                                        style={{ objectFit: 'contain' }}
                                                    />
                                                </div>
                                                <div className='ms-4'>
                                                    <h5 style={{ color: 'var(--color-text)', fontWeight: '600' }}>{donor.name}</h5>
                                                    <p className='mt-2 mb-3' style={{ color: 'var(--color-text)' }}>
                                                        {donor.description}
                                                    </p>
                                                    <Link 
                                                        href={donor.website} 
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className='text-decoration-none'
                                                        style={{ color: 'var(--color-accent)' }}
                                                    >
                                                        Visit website →
                                                    </Link>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                    
                    {/* Technical Partners Section */}
                    <div className='mt-5'>
                        <h5 className='mb-4' style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Technical Partners</h5>
                        <Row className='g-4'>
                            {technicalPartners.map((partner, index) => (
                                <Col key={index} md={6}>
                                    <Card className='h-100 shadow-sm' style={{ background: 'var(--color-surface)', border: 'none' }}>
                                        <Card.Body className='p-4'>
                                            <div className='d-flex'>
                                                <div style={{ width: '200px', height: '200px', position: 'relative', flexShrink: 0 }}>
                                                    <Image 
                                                        src={partner.logo} 
                                                        alt={partner.name}
                                                        fill
                                                        style={{ objectFit: 'contain' }}
                                                    />
                                                </div>
                                                <div className='ms-4'>
                                                    <h5 style={{ color: 'var(--color-text)', fontWeight: '600' }}>{partner.name}</h5>
                                                    <p className='mt-2 mb-3' style={{ color: 'var(--color-text)' }}>
                                                        {partner.description}
                                                    </p>
                                                    <Link 
                                                        href={partner.website} 
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className='text-decoration-none'
                                                        style={{ color: 'var(--color-accent)' }}
                                                    >
                                                        Visit website →
                                                    </Link>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default Aboutus;