import { type SchemaTypeDefinition } from "sanity";
import { user } from "./user";
import { booking } from "./booking";
import { destination } from "./destination";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [user, booking, destination],
};
