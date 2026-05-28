"use strict";
const OauthInfoReader = require("./OauthInfoReader");
describe("oauthInfo reader", () => {
  it("read google oauthInfo", () => {
    let reader = new OauthInfoReader();
    let target = reader.getGoogle();
    expect(target).not.toBeUndefined();
  });
});
