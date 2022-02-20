const request = require("supertest");
const app = require("../app");
describe("POST /api/users", () => {
  test("SIGNUP", async () => {
    const response = await request(app).post("/api/users/signup").send({
      password: "mangoqweqwe",
      email: "goooo@gmail.com",
    });
    expect(response.statusCode).toBe(200);
    expect(typeof response.body.token).not.toBeFalsy();
    expect(typeof response.body.newUser.email).toBe("string");
    expect(typeof response.body.newUser.subscription).toBe("string");
  });
  test("LOGIN", async () => {
    const response = await request(app).post("/api/users/login").send({
      password: "mangoqweqwe",
      email: "goooo@gmail.com",
    });
    expect(response.statusCode).toBe(200);
    expect(typeof response.body.token).not.toBeFalsy();
    expect(typeof response.body.user.email).toBe("string");
    expect(typeof response.body.user.subscription).toBe("string");
  });
});
