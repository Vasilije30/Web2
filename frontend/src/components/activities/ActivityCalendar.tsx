import { format, getDay, parse, startOfWeek } from "date-fns";
import { srLatn as sr } from "date-fns/locale";
import { Calendar, dateFnsLocalizer, type View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { Activity } from "../../models/Activity";
import { activityStatusColors, type ActivityStatusKey } from "../../utils/labels";

const locales = { sr };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: sr }),
  getDay,
  locales,
});

interface ActivityEvent {
  title: string;
  start: Date;
  end: Date;
  activity: Activity;
}

function toEvent(activity: Activity): ActivityEvent {
  const start = new Date(`${activity.date}T${activity.time}`);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return { title: activity.name, start, end, activity };
}

interface ActivityCalendarProps {
  activities: Activity[];
  onSelectActivity: (activity: Activity) => void;
}

/** 24-časovni zapis vremena umesto podrazumevanog AM/PM iz react-big-calendar-a. */
const formats = {
  timeGutterFormat: "HH:mm",
  eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${format(start, "HH:mm")} – ${format(end, "HH:mm")}`,
  agendaTimeFormat: "HH:mm",
  agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${format(start, "HH:mm")} – ${format(end, "HH:mm")}`,
};

export default function ActivityCalendar({ activities, onSelectActivity }: ActivityCalendarProps) {
  const events = activities.map(toEvent);

  // Bez ovoga kalendar otvara tekuću nedelju, koja je najčešće daleko od datuma putovanja.
  const firstDate = activities
    .map((a) => a.date)
    .sort()
    .at(0);
  const defaultDate = firstDate ? new Date(`${firstDate}T00:00:00`) : new Date();

  return (
    <div className="calendar-frame">
      <Calendar
        localizer={localizer}
        culture="sr"
        events={events}
        formats={formats}
        defaultDate={defaultDate}
        startAccessor="start"
        endAccessor="end"
        defaultView={"week" as View}
        views={["month", "week", "day", "agenda"] as View[]}
        onSelectEvent={(event) => onSelectActivity((event as ActivityEvent).activity)}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: activityStatusColors[(event as ActivityEvent).activity.status as ActivityStatusKey],
          },
        })}
        messages={{
          month: "Mesec",
          week: "Nedelja",
          day: "Dan",
          agenda: "Agenda",
          today: "Danas",
          previous: "Nazad",
          next: "Napred",
          date: "Datum",
          time: "Vreme",
          event: "Aktivnost",
          noEventsInRange: "Nema aktivnosti u ovom periodu.",
          showMore: (total) => `+ još ${total}`,
        }}
      />
    </div>
  );
}
