import { Request, Response } from "express";
import { i32IdSchema } from "../schemas/sharedSchemas";
import { StatusCodes } from "http-status-codes";
import { getAuthenticatedUser } from "../utils/getAuthenticatedUser";
import { UsersService } from "../services/usersService";
import { usersSchemasFactory } from "../schemas/usersSchemas";

export function usersControllerFactory(usersService: UsersService) {
  const usersSchemas = usersSchemasFactory();

  const getUsers = async (req: Request, res: Response) => {
    const query = usersSchemas.getUsersQuerySchema.parse(req.query);
    const users = await usersService.getUsers(query);
    res.status(StatusCodes.OK).json(users);
  };

  const getUserById = async (req: Request, res: Response) => {
    const { id } = i32IdSchema.parse(req.params);
    const user = await usersService.getUserById(id);
    res.status(StatusCodes.OK).json(user);
  };

  const getGreeting = async (req: Request, res: Response) => {
    const { id } = i32IdSchema.parse(req.params);
    const greeting = await usersService.getGreetingByUserId(id);
    res.status(StatusCodes.OK).json(greeting);
  };

  const getFarewell = async (req: Request, res: Response) => {
    const { id } = i32IdSchema.parse(req.params);
    const farewell = await usersService.getFarewellByUserId(id);
    res.status(StatusCodes.OK).json(farewell);
  };

  const patchUser = async (req: Request, res: Response) => {
    const { id } = i32IdSchema.parse(req.params);
    const parsedBody = usersSchemas.patchUserBodySchema.parse(req.body);
    const user = getAuthenticatedUser(req);
    const updatedUser = await usersService.patchUser(id, user.id, parsedBody);
    res.status(StatusCodes.OK).json(updatedUser);
  };

  const putGreeting = async (req: Request, res: Response) => {
    const { id } = i32IdSchema.parse(req.params);
    const { greeting_track_id, greeting_playlist_id } = usersSchemas.putGreetingBodySchema.parse(req.body);
    const user = getAuthenticatedUser(req);
    const updatedGreeting = await usersService.putGreeting(id, greeting_track_id, greeting_playlist_id, user.id);
    res.status(StatusCodes.OK).json(updatedGreeting);
  };

  const putFarewell = async (req: Request, res: Response) => {
    const { id } = i32IdSchema.parse(req.params);
    const { farewell_track_id, farewell_playlist_id } = usersSchemas.putFarewellBodySchema.parse(req.body);
    const user = getAuthenticatedUser(req);
    const updatedFarewell = await usersService.putFarewell(id, farewell_track_id, farewell_playlist_id, user.id);
    res.status(StatusCodes.OK).json(updatedFarewell);
  };

  return {
    getUsers,
    getUserById,
    getGreeting,
    getFarewell,
    patchUser,
    putGreeting,
    putFarewell,
  };
}
