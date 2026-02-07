import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import { IEvent } from "@/database/event.model";
import { cacheLife } from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const page = async () => {
  "use cache";
  cacheLife("hours");

  try {
    const response = await fetch(`${BASE_URL}/api/events`);
    if (!response.ok) {
      console.error(
        "Failed to fetch events",
        response.status,
        await response.text(),
      );
      return (
        <section>
          <h1 className="text-center">Events unavailable</h1>
          <p className="text-center mt-5">
            Unable to load events at this time.
          </p>
        </section>
      );
    }

    const { events } = await response.json();

    // fall through to render with events

    return (
      <section className="">
        <h1 className="text-center ">
          The hub for every
          <br />
          Event You cant Miss
        </h1>
        <p className="text-center mt-5">
          Hackathons , Meetups , and conferences
        </p>
        <ExploreBtn />
        <div className="mt-20 space-y-7 md:px-12">
          <h3>Featured Events</h3>

          <ul className="events list-none">
            {events &&
              events.length > 0 &&
              events.map((event: IEvent, index: number) => (
                <li className="" key={index}>
                  <EventCard {...event} />
                </li>
              ))}
          </ul>
        </div>
      </section>
    );
  } catch (err) {
    console.error("Error loading events:", err);
    return (
      <section>
        <h1 className="text-center">Events unavailable</h1>
        <p className="text-center mt-5">
          An unexpected error occurred while loading events.
        </p>
      </section>
    );
  }
};
export default page;
