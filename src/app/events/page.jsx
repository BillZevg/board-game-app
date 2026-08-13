import { prisma } from "@/lib/prisma";

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    include: {
      host: true,
      game: true,
    },
  });

  return (
    <div>
      <h1>Board Game Events</h1>
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            {event.title} - Host: {event.host.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
