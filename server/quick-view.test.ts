import { describe, expect, it } from "vitest";
import { getQuickViewPrice, needsQuickViewSizeSelection } from "../client/src/lib/quickView";

describe("Quick View helpers", () => {
  it("uses the base product price until a size is selected", () => {
    expect(getQuickViewPrice("4800.00")).toBe(4800);
    expect(getQuickViewPrice("4800.00", 5200)).toBe(5200);
  });

  it("requires a size only when the product offers sizes", () => {
    expect(needsQuickViewSizeSelection([], null)).toBe(false);
    expect(needsQuickViewSizeSelection([{ label: "Large", price: 5200 }], null)).toBe(true);
    expect(needsQuickViewSizeSelection([{ label: "Large", price: 5200 }], "Large")).toBe(false);
  });
});
