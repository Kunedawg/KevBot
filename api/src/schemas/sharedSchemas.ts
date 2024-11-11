import { z } from "zod";

export const i32IdSchema = z.object({
  id: z.coerce.number().int().min(0).max(2_147_483_647),
});
