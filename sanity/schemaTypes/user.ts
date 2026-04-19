import { defineField, defineType } from "sanity";

export const user = defineType({
  name: "user",
  type: "document",
  title: "User",
  fields: [
    defineField({
      name: "email",
      type: "string",
      title: "Email",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "password",
      type: "string",
      title: "Hashed Password",
      hidden: false,
    }),
    defineField({
      name: "username",
      type: "string",
      title: "Username",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "createdAt",
      type: "datetime",
      title: "Created At",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "profileImage",
      type: "image",
      title: "Profile Image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "isAdmin",
      title: "Is Admin",
      type: "boolean",
    }),
  ],
});
