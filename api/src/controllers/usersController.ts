import { Request, Response } from "express";
import * as usersService from "../services/usersService";
import { i32IdSchema } from "../schemas/sharedSchemas";
import * as usersSchemas from "../schemas/usersSchemas";
import { StatusCodes } from "http-status-codes";
import { getAuthenticatedUser } from "../utils/getAuthenticatedUser";

export const getUsers = async (req: Request, res: Response) => {
  const query = usersSchemas.getUsersQuerySchema.parse(req.query);
  const users = await usersService.getUsers(query);
  res.status(StatusCodes.OK).json(users);
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = i32IdSchema.parse(req.params);
  const user = await usersService.getUserById(id);
  res.status(StatusCodes.OK).json(user);
};

export const getGreeting = async (req: Request, res: Response) => {
  const { id } = i32IdSchema.parse(req.params);
  const greeting = await usersService.getGreetingByUserId(id);
  res.status(StatusCodes.OK).json(greeting);
};

export const getFarewell = async (req: Request, res: Response) => {
  const { id } = i32IdSchema.parse(req.params);
  const farewell = await usersService.getFarewellByUserId(id);
  res.status(StatusCodes.OK).json(farewell);
};

export const patchUser = async (req: Request, res: Response) => {
  const { id } = i32IdSchema.parse(req.params);
  const { username } = usersSchemas.patchUserBodySchema.parse(req.body);
  const user = getAuthenticatedUser(req);
  const updatedUser = await usersService.patchUser(id, username, user.id);
  res.status(StatusCodes.CREATED).json(updatedUser);
};

export const putGreeting = async (req: Request, res: Response) => {
  const { id } = i32IdSchema.parse(req.params);
  const { greeting_track_id, greeting_playlist_id } = usersSchemas.putGreetingBodySchema.parse(req.body);
  const user = getAuthenticatedUser(req);
  const updatedGreeting = await usersService.putGreeting(id, greeting_track_id, greeting_playlist_id, user.id);
  res.status(StatusCodes.OK).json(updatedGreeting);
};

export const putFarewell = async (req: Request, res: Response) => {
  const { id } = i32IdSchema.parse(req.params);
  const { farewell_track_id, farewell_playlist_id } = usersSchemas.putFarewellBodySchema.parse(req.body);
  const user = getAuthenticatedUser(req);
  const updatedFarewell = await usersService.putFarewell(id, farewell_track_id, farewell_playlist_id, user.id);
  res.status(StatusCodes.OK).json(updatedFarewell);
};
