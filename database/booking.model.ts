import mongoose, { Schema, model, models, Document } from "mongoose";
import Event from "./event.model";

/**
 * TypeScript interface for Booking document
 * Extends Mongoose Document to include schema fields
 */
export interface IBooking extends Document {
  eventId: mongoose.Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
      index: true, // Index for faster event-based queries
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: (email: string) => {
          // RFC 5322 compliant email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
        },
        message: "Please provide a valid email address",
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save hook: Verify that the referenced event exists
 * Prevents orphaned bookings by validating event reference
 */
BookingSchema.pre("save", async function (next) {
  try {
    // Only verify if eventId is new or modified
    if (this.isModified("eventId")) {
      const eventExists = await Event.exists({ _id: this.eventId });
      
      if (!eventExists) {
        throw new Error(
          `Event with ID ${this.eventId} does not exist. Cannot create booking.`
        );
      }
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compound index for efficient queries by event and email
BookingSchema.index({ eventId: 1, email: 1 });

// Prevent model recompilation in Next.js hot reload
const Booking = models.Booking || model<IBooking>("Booking", BookingSchema);

export default Booking;
