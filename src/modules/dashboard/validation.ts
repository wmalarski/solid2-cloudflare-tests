import * as v from "valibot";
import { STATUS_IN_PROGRESS, STATUS_NEW, STATUS_REVIEWED } from "./constansts";

export const taskStatusSchema = v.union([
  v.literal(STATUS_NEW),
  v.literal(STATUS_IN_PROGRESS),
  v.literal(STATUS_REVIEWED),
]);
