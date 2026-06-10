import { describe, expect, it } from "vitest";
import { libelleType } from "./constants";

describe("libelleType", () => {
  it("retourne le libelle des types connus", () => {
    expect(libelleType(1)).toBe("Congés payés");
    expect(libelleType(2)).toBe("RTT");
  });

  it("retourne un libelle de repli pour un type inconnu", () => {
    expect(libelleType(99)).toBe("Type 99");
  });
});
