import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_NOTE_FONT_SIZE, loadNoteFontSize, resetNoteFontSize, saveNoteFontSize } from "@/lib/note-font-size";

describe("note font size", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("resets the note font size to the default value", () => {
    saveNoteFontSize({ scale: 150 });
    expect(loadNoteFontSize().scale).toBe(150);

    resetNoteFontSize();

    expect(loadNoteFontSize().scale).toBe(DEFAULT_NOTE_FONT_SIZE.scale);
  });
});
