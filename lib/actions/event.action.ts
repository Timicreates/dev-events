"use server";

import Event from "@/database/event.model";
import connectDB from "@/lib/mongodb";

export const getSimilarEventsBySlug = async (slug: string) => {
  try {
    await connectDB();
    const event = await Event.findOne({ slug });
    if (!event) {
      // Event with provided slug not found — return empty array
      return [];
    }

    // Normalize agenda and tags into string arrays (handle nested JSON strings or comma-separated)
    const normalizeToArray = (value: any): string[] => {
      try {
        if (Array.isArray(value)) {
          if (value.length === 1 && typeof value[0] === "string") {
            const maybe = String(value[0]).trim();
            if (maybe.startsWith("[")) {
              try {
                const parsed = JSON.parse(maybe);
                if (Array.isArray(parsed))
                  return parsed.map((v) => String(v).trim()).filter(Boolean);
              } catch {}
            }
          }
          return value.map((v) => String(v).trim()).filter(Boolean);
        }

        if (typeof value === "string") {
          const s = value.trim();
          if (s.startsWith("[")) {
            try {
              const parsed = JSON.parse(s);
              if (Array.isArray(parsed))
                return parsed.map((v) => String(v).trim()).filter(Boolean);
            } catch {}
          }
          return s
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);
        }
      } catch (e) {
        // ignore
      }
      return [];
    };

    event.agenda = normalizeToArray(event.agenda);
    event.tags = normalizeToArray(event.tags);

    return await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags },
    }).lean();
  } catch {
    return [];
  }
};
