import type {VercelRequest, VercelResponse} from "@vercel/node";
import {verify} from "jsonwebtoken";
import userModel from "./userModel";
import {connect, disconnect} from "mongoose";
import { getUserFromToken } from "./user";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method === 'GET') {
    if (!request.query.token) {
      response.status(400).json({
        status: 'error',
        error: 'Invalid token'
      });
    }
    const user = getUserFromToken(request.query.token.toString(), response);
    if (!process.env.mongodb_uri_account) {
      response.status(500);
      console.error('Missing mongodb uri')
      return
    }
    await connect(process.env.mongodb_uri_account);
    const mongoUser = await userModel.findOne({
      email: user.email
    });
    if (!mongoUser || !mongoUser.group) {
      return response.status(400).json({
        status: 'error',
        error: 'User does not exist'
      });
    }
    await disconnect();
    return response.status(200).json({
      status: 'success',
      group: mongoUser.group
    })
  } else {
    return response.status(403);
  }
}

export function getUserFromRequest(request: VercelRequest, response: VercelResponse): any {
  if (!request.body.token) {
    response.status(400).json({
      status: 'error',
      error: 'Invalid token'
    });
  }
  const { token } = request.body;
  if (!process.env.jwt_token) {
    console.error('Missing jwt key')
    return response.status(500);
  }
  return verify(token, process.env.jwt_token);
}
