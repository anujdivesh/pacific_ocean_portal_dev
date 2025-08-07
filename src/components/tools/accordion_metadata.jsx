import Accordion from 'react-bootstrap/Accordion';
import React from 'react';
import SmallMap from '../map/small_map';
import { useAppSelector, useAppDispatch } from '@/app/GlobalRedux/hooks';
import { hideModal } from '@/app/GlobalRedux/Features/modal/modalSlice';

function AccordionMetadata() {
    const dataset_list = useAppSelector(state => state.dataset_list.value);
    const dispatch = useAppDispatch();

    if (dataset_list.length === 0) {
        return (
            <div className="text-center my-4">
                <div>
                    <SmallMap currentDataset={dataset_list} />
                </div>
                <div className="mt-3 mb-2">
                    Select a dataset to see a preview
                </div>
                <button type="button" className="btn btn-outline-secondary btn-sm rounded-pill w-10" 
                style={{padding:'8px', marginLeft:'5px'}} onClick={()=>{ dispatch(hideModal())}}>
                    &nbsp;Go to the Map&nbsp;
                    </button>
            </div>
        );
    }

    return (
        <div style={{ margin: 0, padding: 0 }}>
            <div style={{ margin: 0, padding: 0 }}>
                <SmallMap currentDataset={dataset_list} />
            </div>
            <div className="mt-3">
                <div className="fw-bold mb-2 mr-2" style={{marginLeft: '10px'}}>{dataset_list.name.replace(/\[.*?\]/g, '').trim()}</div>
                <div className="mb-3  mr-2" style={{marginLeft: '10px'}}>{dataset_list.copyright}</div>
                {dataset_list.metadata_one_id !== "" && (
                    <Accordion className="mb-2" defaultActiveKey="1">
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>{dataset_list.metadata_one_id}</Accordion.Header>
                            <Accordion.Body>
                                {dataset_list.metadata_one_value} 
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                )}
                {dataset_list.metadata_two_id !== "" && (
                    <Accordion className="mb-2" defaultActiveKey="2">
                        <Accordion.Item eventKey="2">
                            <Accordion.Header>{dataset_list.metadata_two_id}</Accordion.Header>
                            <Accordion.Body>
                                {dataset_list.metadata_two_value}
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                )}
                {dataset_list.metadata_three_id !== "" && (
                    <Accordion className="mb-2" defaultActiveKey="3">
                        <Accordion.Item eventKey="3">
                            <Accordion.Header>{dataset_list.metadata_three_id}</Accordion.Header>
                            <Accordion.Body>
                                {dataset_list.metadata_three_value}
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                )}
                {dataset_list.metadata_four_id !== "" && (
                    <Accordion className="mb-2" defaultActiveKey="4">
                        <Accordion.Item eventKey="4">
                            <Accordion.Header>{dataset_list.metadata_four_id}</Accordion.Header>
                            <Accordion.Body>
                                {dataset_list.metadata_four_value}
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                )}
                {dataset_list.metadata_five_id !== "" && (
                    <Accordion className="mb-2" defaultActiveKey="5">
                        <Accordion.Item eventKey="5">
                            <Accordion.Header>{dataset_list.metadata_five_id}</Accordion.Header>
                            <Accordion.Body>
                                {dataset_list.metadata_five_value}
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                )}
                {dataset_list.metadata_six_id !== "" && (
                    <Accordion className="mb-2" defaultActiveKey="6">
                        <Accordion.Item eventKey="6">
                            <Accordion.Header>{dataset_list.metadata_six_id}</Accordion.Header>
                            <Accordion.Body>
                                {dataset_list.metadata_six_value}
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                )}
            </div>
        </div>
    );
}

export default AccordionMetadata;