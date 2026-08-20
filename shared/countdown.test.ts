import { describe, expect, it } from "vitest";
import { daysUntilDate } from "./countdown";

describe("daysUntilDate", () => {
  it("calculates remaining whole calendar days from the user’s local date", () => {
    expect(daysUntilDate("2027-07-11", new Date(2027, 6, 1, 19))).toBe(10);
  });

  it("returns zero for the wedding date and dates in the past", () => {
    expect(daysUntilDate("2027-07-11", new Date("2027-07-11T08:00:00-05:00"))).toBe(0);
    expect(daysUntilDate("2027-07-11", new Date("2027-07-12T08:00:00-05:00"))).toBe(0);
  });
});
