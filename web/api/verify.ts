import type {VercelRequest, VercelResponse} from "@vercel/node";
import {getUserFromToken} from "./user";
import UserModel from "./userModel";
import {connect, disconnect} from "mongoose";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'GET') {
    return response.status(405).json({
      status: 'error',
      error: 'Method not allowed'
    });
  }
  if (!process.env.mongodb_uri_account) {
    response.status(500).json({
      status: 'failure'
    });
    console.error('Missing mongodb uri')
    return;
  }
  await connect(process.env.mongodb_uri_account);
  if (!request.query.token) {
    return response.status(400).redirect('/');
  }
  const user = await getUserFromToken(request.query.token.toString(), response);
  const mongoUser = await UserModel.findOne({
    email: user.email
  });
  mongoUser.verified = true;
  await mongoUser.save();
  await disconnect();
  return response.status(200).redirect('/');
}
