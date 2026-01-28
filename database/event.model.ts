import mongoose, { Schema, model, models, Document } from "mongoose";

/**
 * TypeScript interface for Event document
 * Extends Mongoose Document to include schema fields
 */
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, "Event overview is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Event image is required"],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, "Event venue is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Event location is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Event date is required"],
      trim: true,
    },
    time: {
      type: String,
      required: [true, "Event time is required"],
      trim: true,
    },
    mode: {
      type: String,
      required: [true, "Event mode is required"],
      enum: {
        values: ["online", "offline", "hybrid"],
        message: "Mode must be online, offline, or hybrid",
      },
      trim: true,
    },
    audience: {
      type: String,
      required: [true, "Event audience is required"],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, "Event agenda is required"],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: "Agenda must contain at least one item",
      },
    },
    organizer: {
      type: String,
      required: [true, "Event organizer is required"],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, "Event tags are required"],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: "Tags must contain at least one item",
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Generate URL-friendly slug from title
 * Converts to lowercase, replaces spaces/special chars with hyphens
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Normalize date to ISO format (YYYY-MM-DD)
 * Accepts various date formats and converts to standard format
 */
function normalizeDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }
  return date.toISOString().split("T")[0];
}

/**
 * Normalize time to 24-hour format (HH:MM)
 * Ensures consistent time format across all events
 */
function normalizeTime(timeStr: string): string {
  // Check if already in HH:MM format
  const time24Regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (time24Regex.test(timeStr.trim())) {
    return timeStr.trim();
  }

  // Parse various time formats
  const date = new Date(`1970-01-01 ${timeStr}`);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid time format");
  }

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Pre-save hook: Generate slug, normalize date/time
 * Only regenerates slug if title has changed
 */
EventSchema.pre("save", function (next) {
  try {
    // Generate slug only if title is new or modified
    if (this.isModified("title")) {
      this.slug = generateSlug(this.title);
    }

    // Normalize date to ISO format
    if (this.isModified("date")) {
      this.date = normalizeDate(this.date);
    }

    // Normalize time to 24-hour format
    if (this.isModified("time")) {
      this.time = normalizeTime(this.time);
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

// Create unique index on slug for faster lookups
EventSchema.index({ slug: 1 }, { unique: true });

// Prevent model recompilation in Next.js hot reload
const Event = models.Event || model<IEvent>("Event", EventSchema);

export default Event;
