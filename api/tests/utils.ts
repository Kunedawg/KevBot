import { Express } from "express";
import request from "supertest";
import path from "path";

export async function i32IdCheck(requestBuilder: any) {
  let res = await requestBuilder("hello");
  expect(res.status).toBe(400);
  expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
  expect(res.body?.message).toMatch(/validation error.*nan/i);

  res = await requestBuilder(5.4);
  expect(res.status).toBe(400);
  expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
  expect(res.body?.message).toMatch(/validation error.*float/i);

  res = await requestBuilder(-5);
  expect(res.status).toBe(400);
  expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
  expect(res.body?.message).toMatch(/validation error.*greater.*0/i);

  res = await requestBuilder(3147483647);
  expect(res.status).toBe(400);
  expect(res.body).toEqual({ statusCode: 400, error: "Bad Request", message: expect.any(String) });
  expect(res.body?.message).toMatch(/validation error.*less.*2147483647/i);
}

export async function getLoginTokenAndTestResult(user: { username: string; password: string }, app: Express) {
  let res = await request(app).post("/v1/auth/login").send(user);
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ token: expect.any(String) });
  return res.body?.token;
}

export const fixturePath = (fileName: string) => path.join(__dirname, "fixtures", fileName);
