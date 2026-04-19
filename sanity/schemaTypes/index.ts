import { type SchemaTypeDefinition } from "sanity";
import { user } from "./user";
import { booking } from "./booking";
import { destination } from "./destination";
import sentEmail from "./sentEmail";
export const schemaTypes = [user, booking, destination, sentEmail];
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [user, booking, destination, sentEmail],
};
