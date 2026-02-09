import { notFound } from "next/navigation";

import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import { IEvent } from "@/database/event.model";
import { getSimilarEventsBySlug } from "@/lib/actions/event.action";
import EventCard from "@/components/EventCard";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const EventDetailItem = ({
  icon,
  alt,
  label,
}: {
  icon: string;
  alt: string;
  label: string;
}) => (
  <div className="flex flex-row gap-2 items-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className="agenda">
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {tags.map((tag, index) => (
      <div className="pill" key={index}>
        {tag}
      </div>
    ))}
  </div>
);

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  let _id,
    description,
    image,
    overview,
    date,
    time,
    location,
    mode,
    agenda,
    audience,
    tags;

  try {
    const response = await fetch(`${BASE_URL}/api/events/${slug}`);
    if (!response.ok) {
      console.error(
        `Failed to fetch event ${slug}:`,
        response.status,
        await response.text(),
      );
      return notFound();
    }
    const data = await response.json();
    ({
      event: {
        _id,
        description,
        image,
        overview,
        date,
        time,
        location,
        mode,
        agenda,
        audience,
        tags,
      },
    } = data);
  } catch (err) {
    console.error("Failed to load event:", err);
    return notFound();
  }

  if (!description) return notFound();

  const bookings = 10;

  const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);
  return (
    <section id="event">
      <div className="header">
        <h1>Event description</h1>
        <p className="mt-2">{description}</p>
      </div>

      <div className="details">
        {/* Left side event content */}
        <div className="content">
          <Image
            src={image}
            alt="Event banner"
            height={800}
            width={800}
            className="banner"
          />

          <section className="flex-col gap-2">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className="flex-col gap-2">
            <h2>Event Details</h2>
            <EventDetailItem
              icon="/icons/calendar.svg"
              alt="calendar"
              label={date}
            />{" "}
            <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />{" "}
            <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />{" "}
            <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
            <EventDetailItem
              icon="/icons/audience.svg"
              alt="audience"
              label={audience}
            />
          </section>
          <EventAgenda agendaItems={agenda} />

          <section className="flex-col gap-2">
            <h2>About the organizer</h2>
          </section>
          <EventTags tags={tags} />
        </div>

        {/* right side booking form */}
        <aside className="booking">
          <div className="signup-card">
            <h2>book your spot</h2>
            {bookings > 0 ? (
              <p className="text-sm">
                Join {bookings} people who have already booked their spot
              </p>
            ) : (
              <p className="text-sm">Be the first to book your spot</p>
            )}
            <BookEvent eventId={String(_id)} slug={slug} />
          </div>
        </aside>
      </div>

      <div className="flex flex-col w-full gap-4 pt-20">
        <h2>Similar Events</h2>
        <div className="events">
          {similarEvents.length > 0 &&
            similarEvents.map((event: IEvent) => (
              <EventCard key={event.slug || event._id} {...event} />
            ))}
        </div>
      </div>
    </section>
  );
};

export default EventDetailsPage;
