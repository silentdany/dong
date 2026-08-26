import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ogBoard, ogDuel, ogListing, ogText } from "./links.ts";

describe("og urls", () => {
  it("puts board rows in the query so a new leader is a new url", () => {
    const url = ogBoard({
      kind: "all-time",
      takeTop: 20,
      rows: [
        { name: "Jonathan Wilke", cm: 15, target: "@jonathan_wilke" },
        { name: "Major Baguette", cm: 6, target: "@MajorBaguette" },
      ],
    });
    assert.match(url, /\/og\/board\?/);
    assert.match(url, /kind=all-time/);
    assert.match(url, /takeTop=20/);
    assert.match(url, /r=Jonathan\+Wilke%7E15%7E%40jonathan_wilke/);
    assert.match(url, /r=Major\+Baguette%7E6%7E%40MajorBaguette/);
  });

  it("keeps duel sides as named params, not a blob", () => {
    const url = ogDuel({
      a: { name: "Jonathan Wilke", cm: 15, target: "@jonathan_wilke" },
      b: { name: "Major Baguette", cm: 6, target: "@MajorBaguette" },
    });
    assert.equal(
      url,
      "/og/duel?a=Jonathan+Wilke&acm=15&ah=%40jonathan_wilke&b=Major+Baguette&bcm=6&bh=%40MajorBaguette",
    );
  });

  it("omits empty listing fields", () => {
    const url = ogListing({ name: "Jonathan Wilke", cm: 15, rank: 1 });
    assert.equal(url, "/og/listing?name=Jonathan+Wilke&cm=15&rank=1");
  });

  it("builds the typographic card", () => {
    const url = ogText({ tag: "Rules", title: "The rules", sub: "No costume. Pay." });
    assert.equal(url, "/og/text?tag=Rules&title=The+rules&sub=No+costume.+Pay.");
  });
});
