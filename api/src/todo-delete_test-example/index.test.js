require("dotenv").config();
const baseURL = `http://${process.env.ADDRESS}:${process.env.PORT}`;
const fetch = require("cross-fetch");

describe("GET /", () => {
  it("should return 'Successful response.'", async () => {
    const res = await fetch(baseURL + "/");
    expect(res.status).toBe(200);
    data = await res.text();
    expect(data).toBe("Successful response.");
  });
});
