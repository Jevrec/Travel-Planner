export default {
  name: "sentEmail",
  title: "Sent Email",
  type: "document",
  fields: [
    { name: "subject", title: "Subject", type: "string" },
    { name: "sentAt", title: "Sent At", type: "datetime" },
    { name: "recipientCount", title: "Recipient Count", type: "number" },
    { name: "status", title: "Status", type: "string" },
  ],
};