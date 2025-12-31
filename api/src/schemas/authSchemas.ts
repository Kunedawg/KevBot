import { z } from "zod";

export function authSchemaFactory() {
  const postExchangeBodySchema = z.object({
    code: z.string({ required_error: "code is required" }).min(1),
  });

  return {
    postExchangeBodySchema,
  };
}
