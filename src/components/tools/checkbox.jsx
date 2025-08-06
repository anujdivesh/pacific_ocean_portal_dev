import React from 'react';
import { Form} from 'react-bootstrap';
import {  useAppDispatch } from '@/app/GlobalRedux/hooks'
import { updateMapLayer } from '@/app/GlobalRedux/Features/map/mapSlice';

function CheckBox({ item}) {

    const dispatch = useAppDispatch();

    const handleUpdateLayer = (id, updates) => {
        dispatch(updateMapLayer({ id, updates }));
      };
    // Toggle checkbox state
    const handleCheckboxChange = (event,item) => {
      handleUpdateLayer(item.id, {
        layer_information: {
          ...item.layer_information,
          enabled: event.target.checked // Updated value
        }
      });
    };


return(
    <Form.Check
    type="checkbox"
    id={`checkbox-${item.id}`}
    label={item.label} // Custom label or use item.label
    checked={item.layer_information.enabled}
    onClick={(e) => e.currentTarget.blur()}
    onChange={(e) => handleCheckboxChange(e,item)}
    style={{ marginRight: '1px',borderRadius:0,cursor:'pointer'}}
  />
  
)
}
export default CheckBox;