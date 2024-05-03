import { InferSelectModel } from "drizzle-orm";
import { stays } from "./schema";

export type Stay = InferSelectModel<typeof stays>;
