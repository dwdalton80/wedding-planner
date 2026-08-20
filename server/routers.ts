import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getPlannerState, restoreHoneymoonPlan, restoreWeddingPlan, updatePlannerItem, updatePlannerSettings } from "./db";

const settingsInput = z.object({
  weddingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guestCount: z.number().int().min(1).max(1000),
  weddingBudgetCents: z.number().int().min(0),
  honeymoonBudgetCents: z.number().int().min(0),
  venueCostPaidCents: z.number().int().min(0),
  venueName: z.literal("Cottonwood Barn"),
  venueCapacity: z.number().int().min(1).max(1000),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  planner: router({
    get: publicProcedure.query(() => getPlannerState()),
    updateSettings: publicProcedure.input(settingsInput).mutation(({ input }) => updatePlannerSettings(input)),
    updateItem: publicProcedure.input(z.object({ id: z.string().min(1).max(64), plannedCents: z.number().int().min(0), spentCents: z.number().int().min(0) })).mutation(({ input }) => updatePlannerItem(input.id, input.plannedCents, input.spentCents)),
    restoreWedding: publicProcedure.mutation(() => restoreWeddingPlan()),
    restoreHoneymoon: publicProcedure.mutation(() => restoreHoneymoonPlan()),
  }),
});

export type AppRouter = typeof appRouter;
