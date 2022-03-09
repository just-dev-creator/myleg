import type { VercelRequest, VercelResponse } from "@vercel/node";
import Constitution from "./substitution"
import {connect, disconnect } from "mongoose";
import {getUserFromToken} from "./user";
import UserModel from "./userModel";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!request.headers.authorization) {
    response.status(401).json({
      status: 'error',
      error: 'Missing authorization'
    });
    return;
  }
  const token = request.headers.authorization.split(' ')[1];
  const user = getUserFromToken(token, response);
  const req_group = request.query.group;
  let date: Date = new Date();
  date.setHours(0, 0, 0, 0)
  if (request.query.date) {
    try {
      const dateparts = request.query.date.toString().split('-');
      date = new Date(+dateparts[2], +dateparts[1] - 1, +dateparts[0]);
    } catch (e) {
      console.error(e);
      response.status(400).send('Malformed date');
    }
  }
  date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  if (daysBetween(date, new Date()) > 14) {
    response.status(403).send('You are trying to view too old data. Please get in touch with' +
      ' me to get access to the full archive: justus@justcoding.tech');
  }
  if (!process.env.mongodb_uri) {
    response.status(500);
    console.error('Missing mongodb uri')
    return
  }
  await connect(process.env.mongodb_uri);
  if (!await isUserVerified(user)) {
    response.status(401).json({
      status: 'error',
      error: 'E-Mail not verified'
    });
    return;
  }
  try {
    const result = await Constitution.find({
      group: {
        $all: [req_group.toString()]
      },
      date: date,
      $sort: {date: -1, hour: 1}
    })
    response.status(200).send(result)
  } catch (e) {
    console.error(e);
    response.status(400).send('Malformed request: Please review the date and group parameter. ')
    await disconnect()
    return
  }
  await disconnect()
}

function daysBetween(startDate: Date, endDate: Date) {
  var millisecondsPerDay = 24 * 60 * 60 * 1000;
  return (endDate.getTime() - startDate.getTime()) / millisecondsPerDay;
}

async function isUserVerified(user: any): Promise<boolean> {
  const mongoUser = await UserModel.findOne({
    email: user.email
    }
  );
  if (mongoUser === null || mongoUser.verified === null) {
    return false;
  }
  return mongoUser.verified;
}
