import { defineField, defineType } from "sanity";

export const booking = defineType({
  name: "booking",
  title: "Booking",
  type: "document",
  fields: [
    defineField({
      name: "customer",
      title: "Customer",
      type: "reference",
      to: [{ type: "user" }],
    }),
    defineField({
      name: "destination",
      title: "Destination",
      type: "reference",
      to: [{ type: "destination" }],
    }),
    defineField({
      name: "startDate",
      title: "Start Date",
      type: "datetime",
    }),
    defineField({
      name: "endDate",
      title: "End Date",
      type: "datetime",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: ["pending", "confirmed", "cancelled", "completed"],
      },
    }),
    defineField({
      name: "totalPrice",
      title: "Total Price (EUR)",
      type: "number",
    }),
    defineField({
      name: "guests",
      title: "Number of Guests",
      type: "number",
    }),
    defineField({
      name: "flightIncluded",
      title: "Flight Included",
      type: "boolean",
    }),
    defineField({
      name: "createdAt",
      title: "Created At",
      type: "datetime",
    }),
  ],
});
