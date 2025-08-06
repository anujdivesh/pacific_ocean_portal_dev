import Accordion from 'react-bootstrap/Accordion';
import React, { useState } from 'react';
//import '@/components/css/accordionmetadata.css'
import SmallMap from '../map/small_map';
import { useAppSelector, useAppDispatch } from '@/app/GlobalRedux/hooks'
import { hideModal } from '@/app/GlobalRedux/Features/modal/modalSlice';
function AccordionMetadata() {
    const [open, setOpen] = useState(null);

  const dataset_list = useAppSelector(state => state.dataset_list.value)
  const dispatch = useAppDispatch();
    return (
        <>
         {dataset_list.length === 0 ? (
            <div style={{
             
                borderRadius: 16,
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                padding: '0',
                margin: '0',
                minHeight: 220,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text, #181c20)',
                width: '100%',
            }}>
                <div style={{ width: '100%' }}>
                    <SmallMap currentDataset={dataset_list}/>
                </div>
                <div className="item" style={{ fontSize: 18, color: '#64748b', margin: '1.5rem 0 0.5rem 0' }}>
                    Select a dataset to see a preview
                </div>
                <button
                    type="button"
                    className="btn btn-primary btn-sm rounded-pill mt-3 px-4 fw-semibold shadow-sm"
                    style={{ fontSize: 16, background: '#2563eb', border: 'none', transition: 'background 0.2s', color: '#ffffff' }}
                    onClick={()=>{ dispatch(hideModal())}}
                >
                    Go to the Map
                </button>
            </div>
        ) : 
        (
            <div style={{
              
                borderRadius: 16,
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                padding: '0',
                margin: '0',
                minHeight: 220,
                color: 'var(--color-text, #181c20)',
                width: '100%',
            }}>
                <div style={{ width: '100%' }}>
                    <SmallMap currentDataset={dataset_list}/>
                </div>
                <div style={{paddingLeft:10,paddingTop:8, fontSize:'14px'}}>
                    <p style={{ fontSize:'20px', fontWeight: 700, color: 'var(--color-primary, #2563eb)', marginBottom: 8 }}> {dataset_list.name.replace(/\[.*?\]/g, '').trim()}</p>
                    <p style={{ color: 'var(--color-secondary, #64748b)', marginBottom: 16 }}>{dataset_list.copyright}</p>
                {dataset_list.metadata_one_id !=="" ? ( 
                    <Accordion key={dataset_list.metadata_one_id} flush>
                    <Accordion.Item>
                    <Accordion.Header onClick={(e) => e.currentTarget.blur()} aria-expanded={open ===dataset_list.metadata_one_id}>{dataset_list.metadata_one_id}</Accordion.Header>
                        <Accordion.Body style={{paddingLeft:20, paddingRight:0, color: 'var(--color-text, #181c20)', background: 'var(--color-surface-alt, #f8f9fa)'}}>
                        <p style={{color: 'var(--color-text, #181c20)'}}>{dataset_list.metadata_one_value}</p>
                    </Accordion.Body>
                    </Accordion.Item>
                    </Accordion>
                    ): null}

                   {dataset_list.metadata_two_id !=="" ? ( 
                    <Accordion key={dataset_list.metadata_two_id} flush>
                    <Accordion.Item>
                    <Accordion.Header onClick={(e) => e.currentTarget.blur()} aria-expanded={open ===dataset_list.metadata_two_id}>{dataset_list.metadata_two_id}</Accordion.Header>
                        <Accordion.Body style={{paddingLeft:20, paddingRight:0, color: 'var(--color-text, #181c20)', background: 'var(--color-surface-alt, #f8f9fa)'}}>
                        <p style={{color: 'var(--color-text, #181c20)'}}>{dataset_list.metadata_two_value}</p>
                    </Accordion.Body>
                    </Accordion.Item>
                    </Accordion>
                    ): null}
                   {dataset_list.metadata_three_id !=="" ? ( 
                    <Accordion key={dataset_list.metadata_three_id} flush>
                    <Accordion.Item>
                    <Accordion.Header onClick={(e) => e.currentTarget.blur()} aria-expanded={open ===dataset_list.metadata_three_id}>{dataset_list.metadata_three_id}</Accordion.Header>
                        <Accordion.Body style={{paddingLeft:20, paddingRight:0, color: 'var(--color-text, #181c20)', background: 'var(--color-surface-alt, #f8f9fa)'}}>
                        <p style={{color: 'var(--color-text, #181c20)'}}>{dataset_list.metadata_three_value}</p>
                    </Accordion.Body>
                    </Accordion.Item>
                    </Accordion>
                    ): null}
                   {dataset_list.metadata_four_id !=="" ? ( 
                    <Accordion key={dataset_list.metadata_four_id} flush>
                    <Accordion.Item>
                    <Accordion.Header onClick={(e) => e.currentTarget.blur()} aria-expanded={open ===dataset_list.metadata_four_id}>{dataset_list.metadata_four_id}</Accordion.Header>
                        <Accordion.Body style={{paddingLeft:20, paddingRight:0, color: 'var(--color-text, #181c20)', background: 'var(--color-surface-alt, #f8f9fa)'}}>
                        <p style={{color: 'var(--color-text, #181c20)'}}>{dataset_list.metadata_four_value}</p>
                    </Accordion.Body>
                    </Accordion.Item>
                    </Accordion>
                    ): null}
                {dataset_list.metadata_five_id !=="" ? ( 
                    <Accordion key={dataset_list.metadata_five_id} flush>
                    <Accordion.Item>
                    <Accordion.Header onClick={(e) => e.currentTarget.blur()} aria-expanded={open === dataset_list.metadata_five_id}>{dataset_list.metadata_five_id}</Accordion.Header>
                        <Accordion.Body style={{paddingLeft:20, paddingRight:0, color: 'var(--color-text, #181c20)', background: 'var(--color-surface-alt, #f8f9fa)'}}>
                        <p style={{color: 'var(--color-text, #181c20)'}}>{dataset_list.metadata_five_value}</p>
                    </Accordion.Body>
                    </Accordion.Item>
                    </Accordion>
                    ): null}
                {dataset_list.metadata_six_id !=="" ? ( 
                    <Accordion key={dataset_list.metadata_six_id} flush>
                    <Accordion.Item>
                    <Accordion.Header onClick={(e) => e.currentTarget.blur()} aria-expanded={open ===dataset_list.metadata_six_id}>{dataset_list.metadata_six_id}</Accordion.Header>
                        <Accordion.Body style={{paddingLeft:20, paddingRight:0, color: 'var(--color-text, #181c20)', background: 'var(--color-surface-alt, #f8f9fa)'}}>
                        <p style={{color: 'var(--color-text, #181c20)'}}>{dataset_list.metadata_six_value}</p>
                    </Accordion.Body>
                    </Accordion.Item>
                    </Accordion>
                    ): null}
                </div>
                <hr className="custom-horizontal-divider" />
            </div>
        )}
        </>
      );
}

export default AccordionMetadata;