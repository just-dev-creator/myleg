import type {VercelRequest, VercelResponse} from "@vercel/node";
import {connect} from "mongoose";
import {getUserFromRequest} from "./groups";
import userModel from "./userModel";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method === 'POST') {
    if (!process.env.mongodb_uri_account) {
      console.error('Missing mongodb uri')
      return response.status(500).json({
        status: 'failure'
      });
    }
    await connect(process.env.mongodb_uri_account);
    const user = getUserFromRequest(request, response);
    if (request.body.messaging === undefined || request.body.messaging === null) {
      return response.status(400).json({
        status: 'error',
        error: 'Missing messaging token'
      });
    }
    const token = request.body.messaging;
    const mongoUser = await userModel.findOne({
      email: user.email
    });
    if (mongoUser === null) {
      return response.status(400).json({
        status: 'error',
        error: 'User does not exist'
      });
    }
    if (token === false) {
      mongoUser.messagingToken = undefined;
    } else {
      mongoUser.messagingToken = token;
    }
    await mongoUser.save();
    return response.status(200).json({
      status: 'success'
    })
  }
  return response.status(405).json({
    status: 'error',
    error: 'Invalid method'
  })
}
