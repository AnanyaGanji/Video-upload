import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./Calendar.css"; // Assuming you have a separate CSS file for styles

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Calendar = ({ events }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [eventList, setEventList] = useState([]);
  const [dateSelected, setDateSelected] = useState("");
  useEffect(() => {
    initCalendar(currentMonth, currentYear);
  }, [currentMonth, currentYear]);

  const initCalendar = (month, year) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarDays = [];

    // Fill in the empty days
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="empty-cell"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = `${year}-${String(month + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;
      const hasEvent = events[dateString];
      calendarDays.push(
        <div
          key={day}
          className={`day-cell ${hasEvent ? "event" : ""}} ${year === new Date().getFullYear() &&
              month === new Date().getMonth() &&
              day === new Date().getDate()
              ? "marktoday"
              : ""
            }
          ${ 
            dateSelected && year === parseInt(dateSelected.split(",")[0]) && (month === parseInt(dateSelected.split(",")[1]))
            && day === parseInt(dateSelected.split(",")[2]) ? "mark-day" : ""
            }`
          }
          onClick={() => {
            showEvents(dateString)
            if(day !== new Date().getDate()){
              setDateSelected(`${year},${month},${day}`);
            }
            else{
              setDateSelected("");
            }
          }
          }
        >
          {day}
          {hasEvent && <div className="event-indicator"></div>}
        </div>
      );
    }
    return calendarDays;
  };

  const showEvents = (dateString) => {
    if (events[dateString]) {
      setEventList(events[dateString]);
    } else {
      setEventList([]);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="nav-button">
          <FaChevronLeft />
        </button>
        <h2 className="month-year">{`${months[currentMonth]} ${currentYear}`}</h2>
        <button onClick={handleNextMonth} className="nav-button">
          <FaChevronRight />
        </button>
      </div>
      <div className="calendar-grid">
        {daysOfWeek.map((day) => (
          <div key={day} className="day-name">
            {day}
          </div>
        ))}
        {initCalendar(currentMonth, currentYear)}
      </div>
      {eventList.length > 0 ? (
        <div className="event-list">
          <h3 className="event-title">Events</h3>
          {eventList.map((event, index) => (
            <div key={index} className="event-item fw-bold">
              {event.title}
            </div>
          ))}
        </div>
      ) : (
        <div className="event-list">
          <h3 className="event-title">Events</h3>
          <div className="event-item fw-bold">No events</div>
        </div>
      )}
    </div>
  );
};
Calendar.propTypes = {
  events: PropTypes.object.isRequired,
};

export default Calendar;
