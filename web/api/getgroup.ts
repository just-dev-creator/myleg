import type { VercelRequest, VercelResponse } from "@vercel/node";
import Constitution from "./substitution"
import {connect, disconnect } from "mongoose";
import {getUserFromToken} from "./user";
import UserModel from "./userModel";
import Substitution from "./substitution";
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
  const user = getUserFromToken(token, response);
  const req_group = request.query.group;
  let date: Date | boolean;
  let current_date: Date = new Date();
  current_date.setHours(0, 0, 0, 0);
  current_date.setTime(current_date.getTime() - current_date.getTimezoneOffset() * 60 * 1000);
  date = current_date;
  if (request.query.date) {
    if (request.query.date === 'all') {
      date = true;
    } else {
      try {
        const dateparts = request.query.date.toString().split('-');
        date = new Date(+dateparts[2], +dateparts[1] - 1, +dateparts[0]);
        date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
      } catch (e) {
        console.error(e);
        response.status(400).send('Malformed date');
      }
    }
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
  if (date === true) {
    const result = await Substitution.find({
      date: {
        $gte: current_date
      },
      group: {
        $all: [req_group.toString()]
      },
    });

    let abit: boolean | undefined;
    const abit_group = req_group.toString().match(/[0-9]{1,2}/);
    if (abit_group && abit_group.length !== 0) {
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
      abit = found !== null;
    }

    response.status(200).json({
      status: 'success',
      substitutions: result,
      covid: abit
    });
  } else {
    if (daysBetween(date, new Date()) > 14) {
      response.status(403).send('You are trying to view too old data. Please get in touch with' +
        ' me to get access to the full archive: justus@justcoding.tech');
    }
    try {
      const result = await Constitution.find({
        group: {
          $all: [req_group.toString()]
        },
        date: date
      }).sort('hour').lean();
      response.status(200).send(result)
    } catch (e) {
      console.error(e);
      response.status(400).send('Malformed request: Please review the date and group parameter. ')
      await disconnect()
      return
    }
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
