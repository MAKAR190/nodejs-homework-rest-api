const request = require("supertest");
const mongoose = require("mongoose");
const User = require("../model/User");
const app = require("../app");
describe("POST /api/users", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL_TEST);
    await User.deleteMany()
  });
  afterAll(async () => {
    await mongoose.connection.close();
  });
  test("SIGNUP", async () => {
    const response = await request(app).post("/api/users/signup").send({
      password: "mangoqweqwe",
      email: "hero@gmail.com",
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(typeof response.body.newUser.email).toBe("string");
    expect(typeof response.body.newUser.subscription).toBe("string");
  });
  test("LOGIN", async () => {
    const response = await request(app).post("/api/users/login").send({
      password: "mangoqweqwe",
      email: "hero@gmail.com",
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(typeof response.body.user.email).toBe("string");
    expect(typeof response.body.user.subscription).toBe("string");
  });
});
