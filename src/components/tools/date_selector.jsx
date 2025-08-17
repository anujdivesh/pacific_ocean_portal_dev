import React,{useState,useEffect,useRef} from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
//import '@/components/css/datepicker.css';
import { updateMapLayer } from '@/app/GlobalRedux/Features/map/mapSlice';
import {  useAppDispatch } from '@/app/GlobalRedux/hooks';
import {getDateFromArray, formatDateToISOWithoutMilliseconds,getDay,formatDateToISOWithoutMilliseconds3Monthly} from '@/components/tools/helper';

import ReactDOM from 'react-dom';


function DateSelector({item,period,startDateStr,endDateStr}) {
  // Safety check to ensure item and layer_information exist
  if (!item || !item.layer_information) {
    console.warn('DateSelector: item or layer_information is undefined', item);
    return <div>Loading...</div>;
  }

  const PortalDatePicker = ({ children }) => {
    return ReactDOM.createPortal(children, document.body);
  };
  
  
  const dispatch = useAppDispatch();
  const _isMounted = useRef(true);
      const [startDateOrig, setStartDateOrig] = useState(new Date(item.layer_information?.timeIntervalStartOriginal || new Date()));
    const [endDateOrig, setEndDateOrig] = useState(new Date(item.layer_information?.timeIntervalEndOriginal || new Date()));

    const [startDate, setStartDate] = useState(startDateStr);
    const [endDate, setEndDate] = useState(endDateStr);
    const dateArray = useRef();
    var spec = item.layer_information?.specific_timestemps || null;
    var specifc_stemps = item.layer_information?.specific_timestemps && item.layer_information.specific_timestemps !== null ? item.layer_information.specific_timestemps.split(',') : null;
    var weekRange = item.layer_information?.interval_step && item.layer_information.interval_step !== null ? item.layer_information.interval_step.split(',') : null;


    const [currentDate, setCurrentDate] = useState();

      const today = new Date();
      const sevenDaysLater = new Date(today); // Copy the current date
      sevenDaysLater.setDate(today.getDate() + 7);

      const [starttoday, setstarttoday] = useState(today);
      const [end7day, setend7day] = useState(sevenDaysLater);

      const [startDate3, setStartDate3] = useState(startDateStr);
    const [endDate3, setEndDate3] = useState(endDateStr);
      const [startDate2, setStartDate2] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    
      const handleUpdateLayer = (id, updates) => {
        dispatch(updateMapLayer({ id, updates }));
      };

      // Function to handle date changes
      const handleChange = (date,item) => {
        if (item.layer_information.datetime_format === 'MONTHLY'){
          if (spec !== ""){
            var date = getDateFromArray(dateArray.current,date.getFullYear(), date.getMonth()+1);
            const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}:${String(date.getUTCSeconds()).padStart(2, '0')}.000Z`;
            var day = getDay(dateArray.current,date.getFullYear(), date.getMonth()+1)
           // console.log(dateArray.current,date.getFullYear(), date.getMonth(),day)
            setCurrentDate(date);
            //console.log(new Date(date.getFullYear(), date.getMonth(), day))
            
            handleUpdateLayer(item.id, {
              layer_information: {
                ...item.layer_information,
                timeIntervalEnd:dateString,
                zoomToLayer:false // Updated value
              }
            });
          }
          else{
            setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
            handleUpdateLayer(item.id, {
              layer_information: {
                ...item.layer_information,
                timeIntervalStart:formatDateToISOWithoutMilliseconds(new Date(date.getFullYear(), date.getMonth(), 1)),
                zoomToLayer:false // Updated value
              }
            });
          }
        }
        else if (item.layer_information.datetime_format === 'WEEKLY'){
          setCurrentDate(date)
          //setStartDate(date)
          
          handleUpdateLayer(item.id, {
            layer_information: {
              ...item.layer_information,
              timeIntervalStart:date,
              zoomToLayer:false // Updated value
            }
          });
        }
        else{
            setCurrentDate(date)
            
            handleUpdateLayer(item.id, {
              layer_information: {
                ...item.layer_information,
                timeIntervalEnd:formatDateToISOWithoutMilliseconds(date),
                zoomToLayer:false // Updated value
              }
            });
            
      
        }
     //   console.log(date)
      };

      const handleonchange3month = (date, item) => {
       // console.log(formatDateToISOWithoutMilliseconds3Monthly(date))
        
        handleUpdateLayer(item.id, {
          layer_information: {
            ...item.layer_information,
            timeIntervalEnd: formatDateToISOWithoutMilliseconds3Monthly(date),
            zoomToLayer: false
          }
        });
      };
      const customStyles = {
        popper: {
          zIndex: 9999, // Higher than other elements
        },
      };
      useEffect(() => {  
        if (_isMounted.current){

          if (item.layer_information.datetime_format === 'DAILY') {
            setStartDate(startDateStr)
            setEndDate(endDateStr)
            
            if (item.layer_information.layer_type == "WMS_FORECAST"){
              setCurrentDate(startDateStr)
            }
            else{
              setCurrentDate(endDateStr)
            }
           // console.log(endDateStr,startDateStr )
          }
          else if (item.layer_information.datetime_format === 'MONTHLY' || item.layer_information.datetime_format === '3MONTHLY') {
            var dateTimeArray;
            if (spec !== ""){
            dateTimeArray = spec.split(',').map(timestamp => new Date(timestamp.trim()));
            }
            dateArray.current = dateTimeArray;
            setStartDate(dateTimeArray[0])
            setEndDate(dateTimeArray[dateTimeArray.length - 1])
            //setCurrentDate(dateTimeArray[dateTimeArray.length - 1])
            if (item.layer_information.layer_type == "WMS_FORECAST"){
              setCurrentDate(dateTimeArray[0])
            }
            else{
              setCurrentDate(dateTimeArray[dateTimeArray.length - 1])
            }
          }
          else if (item.layer_information.datetime_format === 'WEEKLY_NRT'){
            var dateTimeArray;
            if (spec !== ""){
            dateTimeArray = spec.split(',').map(timestamp => new Date(timestamp.trim()));
            }
            dateArray.current = dateTimeArray;
            setStartDate(dateTimeArray[0])
            setEndDate(dateTimeArray[dateTimeArray.length - 1])
            //setCurrentDate(dateTimeArray[dateTimeArray.length - 1])
            if (item.layer_information.layer_type == "WMS_FORECAST"){
              setCurrentDate(dateTimeArray[0])
            }
            else{
              setCurrentDate(dateTimeArray[dateTimeArray.length - 1])
            }
          }
          else if (item.layer_information.datetime_format === 'HOURLY') {
            console.log(endDateStr)
            //setCurrentDate(endDateStr)
            setCurrentDate(new Date(endDateStr));

          }
          else if (item.layer_information.datetime_format === 'WEEKLY'){
           let dateWithoutZ = startDateStr.replace(/Z/g,'');

           let index = specifc_stemps.findIndex(date => date.trim() === dateWithoutZ.trim());
            setCurrentDate(specifc_stemps[index]);
          }

        }  
        return () => { _isMounted.current = false }; 
        },[]);

        const onChange = (dates,item) => {
         // console.log(dates)
          const [start, end] = dates;
          setstarttoday(start);
          setend7day(end);
          if (start != null && end != null){

          handleUpdateLayer(item.id, {
            layer_information: {
              ...item.layer_information,
              timeIntervalStart:formatDateToISOWithoutMilliseconds(start),
              timeIntervalEnd:formatDateToISOWithoutMilliseconds(end),
              zoomToLayer:false // Updated value
            }
          });
        }
        };

  //new
  let content;
  if (item.layer_information.datetime_format === 'DAILY') {
    content = <div>
  <DatePicker
    id="datepicker"
    selected={currentDate}
    showIcon
    onChange={(date) => handleChange(date,item)}
    minDate={startDate}
    maxDate={endDate}
    className="form-control"
    placeholderText="MM/DD/YYYY"
    popperContainer={PortalDatePicker}
    onClick={(e) => e.currentTarget.blur()}
  />
  </div>
  }else if (item.layer_information.datetime_format === 'SPECIFIC') {
    content = <DatePicker
    showIcon
    selected={dateTimeArray[0]}
    onChange={(date)=>handleChange(date,item)}
    includeDates={dateTimeArray}
    className="form-control form-control-sm"
    wrapperClassName="w-100"
    popperPlacement="bottom-start"
    popperContainer={PortalDatePicker}
    />;
  } else if (item.layer_information.datetime_format === 'MONTHLY') {
    content = 
    <DatePicker
    showIcon
        selected={currentDate}
        onChange={(date)=>handleChange(date,item)}
        onClick={(e) => e.currentTarget.blur()}
        dateFormat="yyyy/MM" // Display only month and year
        showMonthYearPicker // Show month and year picker
        showYearDropdown // Show year dropdown
        scrollableYearDropdown // Make the year dropdown scrollable
        yearDropdownItemNumber={15} // Number of years to display in dropdown
        minDate={startDate} // Set minimum date
        maxDate={endDate} // Set maximum date
        className="form-control form-control-sm"
        wrapperClassName="w-100"
        popperPlacement="bottom-start"
        popperContainer={PortalDatePicker}
      />;
  } /*else if (item.layer_information.datetime_format === '3MONTHLY') {
     // Check if dateArray.current exists and has items
  if (!dateArray.current || dateArray.current.length === 0) {
    content = <div>Loading dates...</div>;
  } else {
    content = (
      <div style={{ width: '80%' }}>
      <select 
      className="form-select form-select-sm rounded-pill"
      value={currentDate} 
      onChange={(e) => {
          const selectedDate = new Date(e.target.value);
          setCurrentDate(selectedDate);
          handleonchange3month(selectedDate, item);
      }}
  >
      {dateArray.current.map((date, index) => {
          const startDate = new Date(date);
          const endDate = new Date(startDate);
          endDate.setMonth(startDate.getMonth() + 2); // Add 3 months
          
          const startYear = startDate.getFullYear();
          const startMonth = startDate.toLocaleString('default', { month: 'short' });
          const endMonth = endDate.toLocaleString('default', { month: 'short' });
          
          return (
              <option key={index} value={date}>
                  {startYear}, {startMonth} - {endMonth}
              </option>
          );
      })}
  </select>
  </div>
    );
  }
}*/
else if (item.layer_information.datetime_format === '3MONTHLY') {
  // Check if dateArray.current exists and has items
  if (!dateArray.current || dateArray.current.length === 0) {
    content = <div>Loading dates...</div>;
  } else {
    // Extract unique years from dateArray
    const years = [...new Set(dateArray.current.map(date => new Date(date).getFullYear()))];
    
    // For 3-monthly intervals, we need to find unique 3-month periods
    // Group dates by year and starting month of 3-month period
    const monthPeriods = new Map();
    
    dateArray.current.forEach(date => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = d.getMonth();
      
      // Determine which 3-month period this month belongs to
      // 0-2 -> Jan-Mar (period 0), 3-5 -> Apr-Jun (period 3), etc.
      const periodStart = Math.floor(month / 3) * 3;
      const periodKey = `${year}-${periodStart}`;
      
      if (!monthPeriods.has(periodKey)) {
        monthPeriods.set(periodKey, {
          year: year,
          startMonth: periodStart,
          startMonthName: new Date(year, periodStart, 1).toLocaleString('default', { month: 'short' }),
          endMonthName: new Date(year, periodStart + 2, 1).toLocaleString('default', { month: 'short' })
        });
      }
    });

    // Convert to sorted array
    const sortedPeriods = Array.from(monthPeriods.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.startMonth - b.startMonth;
    });

    // Find current year and month from currentDate
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentPeriodStart = Math.floor(currentMonth / 3) * 3;

    content = (
      <div style={{ width: '80%', display: 'flex', gap: '5px', marginLeft: -20  }}>
        {/* Year Select */}
        <select 
          className="form-select form-select-sm rounded-pill"
          value={currentYear}
          style={{ minWidth: '80px' }}
          onChange={(e) => {
            const selectedYear = parseInt(e.target.value);
            const newDate = new Date(currentDate);
            newDate.setFullYear(selectedYear);
            
            // Find the first available period for this year
            const availablePeriod = sortedPeriods.find(p => p.year === selectedYear);
            if (availablePeriod) {
              newDate.setMonth(availablePeriod.startMonth);
            }
            
            setCurrentDate(newDate);
            handleonchange3month(newDate, item);
          }}
        >
          {years.map((year, index) => (
            <option key={`year-${index}`} value={year}>
              {year}
            </option>
          ))}
        </select>

        {/* 3-Month Period Select */}
        <select 
          className="form-select form-select-sm rounded-pill"
          value={currentPeriodStart}
          style={{ minWidth: '120px' }}
          onChange={(e) => {
            const selectedPeriodStart = parseInt(e.target.value);
            const newDate = new Date(currentDate);
            newDate.setMonth(selectedPeriodStart);
            setCurrentDate(newDate);
            handleonchange3month(newDate, item);
          }}
        >
          {sortedPeriods
            .filter(period => period.year === currentYear)
            .map((period, index) => (
              <option key={`period-${index}`} value={period.startMonth}>
                {period.startMonthName} - {period.endMonthName}
              </option>
            ))}
        </select>
      </div>
    );
  }
}

else if (item.layer_information.datetime_format === 'WEEKLY_NRT') {
  if (!dateArray.current || dateArray.current.length === 0) {
    content = <div>Loading dates...</div>;
  } else {
    // Extract unique years
    const years = [...new Set(dateArray.current.map(date => new Date(date).getFullYear()))];
    const currentYear = currentDate.getFullYear();

    // Filter dates for current year and sort them
    const datesInYear = dateArray.current
      .map(dateStr => new Date(dateStr))
      .filter(d => d.getFullYear() === currentYear)
      .sort((a, b) => a - b);

    // ISO week number function
    const getISOWeek = (date) => {
      const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = tmp.getUTCDay() || 7;
      tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
      return Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7);
    };

    // Format MM/DD
    const formatDate = (date) => {
      const m = date.getMonth() + 1;
      const d = date.getDate();
      return `${m.toString().padStart(2, '0')}/${d.toString().padStart(2, '0')}`;
    };

    // Build unique week numbers and corresponding start dates
    const weekMap = new Map();
    datesInYear.forEach(date => {
      const week = getISOWeek(date);
      if (!weekMap.has(week)) {
        weekMap.set(week, date);
      }
    });

    const weekOptions = Array.from(weekMap.entries()).map(([week, date]) => {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);
      return {
        week,
        value: startDate.toISOString(),
        label: `${formatDate(startDate)}-${formatDate(endDate)}`
      };
    });

    // Find the week option matching currentDate
    const currentWeek = getISOWeek(currentDate);
    const currentWeekOption = weekOptions.find(opt => getISOWeek(new Date(opt.value)) === currentWeek);

    content = (
      <div style={{ width: '80%', display: 'flex', gap: '5px', marginLeft: -20 }}>
        {/* Year Select */}
        <select
          className="form-select form-select-sm rounded-pill"
          value={currentYear}
          style={{ minWidth: '80px' }}
          onChange={(e) => {
            const selectedYear = parseInt(e.target.value, 10);
            // Pick the first week date in the new year as default
            const availableDate = dateArray.current
              .map(dateStr => new Date(dateStr))
              .find(d => d.getFullYear() === selectedYear);
            if (availableDate) {
              setCurrentDate(availableDate);
              handleonchange3month(availableDate, item);
            }
          }}
        >
          {years.map((year, index) => (
            <option key={`year-${index}`} value={year}>
              {year}
            </option>
          ))}
        </select>

        {/* Week Select */}
        <select
          className="form-select form-select-sm rounded-pill"
          value={currentWeekOption ? currentWeekOption.value : weekOptions[0]?.value || ''}
          style={{ minWidth: '130px' }}
          onChange={(e) => {
            const selectedDate = new Date(e.target.value);
            setCurrentDate(selectedDate);
            handleonchange3month(selectedDate, item);
          }}
        >
          {weekOptions.map((opt, idx) => (
            <option key={`week-${idx}`} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
}



  else if (item.layer_information.datetime_format === 'HOURLY') {
    content =  <DatePicker
    showIcon
    selected={currentDate}
    minDate={startDate ? new Date(startDate) : undefined}
    maxDate={endDate ? new Date(endDate) : undefined}
    onChange={(date)=>handleChange(date,item)}
    showTimeSelect
    timeIntervals={60}
    timeCaption="Hour"
    dateFormat="yyyy/MM/dd HH:00"
    timeFormat='HH:00'
    //includeDates={dateTimeArray}
    className="customInput rounded-pill"
    popperPlacement="bottom-start"
    popperContainer={PortalDatePicker}
  />;
  }
  else if (item.layer_information.datetime_format === 'WEEKLY'){
    content = (
      <div style={{ width: '80%' }}>
      <select className="form-select form-select-sm rounded-pill"
      value={currentDate} 
        onChange={(e) => handleChange(e.target.value,item)} 
        
      >
        {weekRange.map((item, index) => (
          <option key={index} value={specifc_stemps[index]}>
            {item} Week
          </option>
        ))}
      </select>
      </div>
    );
  }
  else if (item.layer_information.datetime_format === 'WFS_DAILY'){
    content = (
      
      <div style={{ paddingTop: 15, textAlign: 'center' }}>
         <p style={{ fontSize: 13, paddingLeft: 15,textAlign:'left' }}>Date Range:</p>
        <DatePicker
          selected={starttoday}
          onChange={(date)=>onChange(date,item)}
          minDate={startDateOrig}
          maxDate={endDateOrig}
          startDate={starttoday}
          endDate={end7day}
          selectsRange
          inline
          showDisabledMonthNavigation
          popperContainer={PortalDatePicker}
        />
      </div>
 
    );
  }
  
  else {
    content = <div>Default Content</div>;
  }


  
return (
  <div className="row align-items-center" style={{ marginTop: '-5px', marginBottom: '8px',paddingTop:8 }}>
    {item.layer_information.datetime_format !== 'WFS_DAILY' && (
      <div className="col-sm-4">
        <div className="date-selector-label">Date Range:</div>
      </div>
    )}
    <div className={item.layer_information.datetime_format === 'WFS_DAILY' ? 'col-sm-12' : 'col-sm-8'}>
      {content}
    </div>
  </div>
);

}
export default DateSelector;