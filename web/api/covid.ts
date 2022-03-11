import type {VercelRequest, VercelResponse} from "@vercel/node";
import {getUserFromToken} from "./user";
import {connect, disconnect} from "mongoose";
import AbitModel from "./abitModel";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!request.headers.authorization) {
    response.status(401).json({
      status: 'error',
      error: 'Missing authorization'
    });
    return;
  }
  const token = request.headers.authorization.split(' ')[1];
  getUserFromToken(token, response);

  if (request.method === 'GET') {
    if (!request.query.group) {
      return response.status(400).json({
        status: 'error',
        error: 'Missing group'
      });
    }
    if (!process.env.mongodb_uri) {
      response.status(500).json({
        status: 'failure'
      });
      console.error('Missing mongodb uri')
      return;
    }
    await connect(process.env.mongodb_uri);
    const found = await AbitModel.findOne(
      {
        $sort: {
          date: -1
        },
        groups: {
          $all: [request.query.group]
        }
      }
    );
    await disconnect();
    return response.status(200).json({
      status: 'success',
      data: found !== null
    });
  } else {
    return response.status(405).json({
      status: 'error',
      error: 'Method not allowed'
    });
  }
}
