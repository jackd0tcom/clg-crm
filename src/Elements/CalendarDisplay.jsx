import { Calendar, momentLocalizer } from "react-big-calendar";
import { useState, useEffect } from "react";
import moment from "moment/moment";

const CalendarDisplay = ({ events, setEvents }) => {
  const localizer = momentLocalizer(moment);

  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
    />
  );
};
export default CalendarDisplay;
