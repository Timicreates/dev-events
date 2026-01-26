import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import { events } from "@/lib/constants";

const page = () => {
  return (
    <section className="">
      <h1 className="text-center ">
        The hub for every
        <br />
        Event You cant Miss
      </h1>
      <p className="text-center mt-5">Hackathons , Meetups , and conferences</p>
      <ExploreBtn />
      <div className="mt-20 space-y-7 md:px-12">
        <h3>Featured Events</h3>

        <ul className="events list-none">
          {events.map((event, index) => (
            <li className="" key={index}>
              <EventCard {...event} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
export default page;
