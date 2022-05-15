import type {VercelRequest, VercelResponse} from "@vercel/node";
import {connect, disconnect} from "mongoose";
import {default as UserModel, IUser} from "./userModel";
import {sign, verify} from "jsonwebtoken";
import {getUserFromRequest} from "./groups"
import { hash, compare } from "bcryptjs";
const sgMail = require('@sendgrid/mail');

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method === 'PUT') {
    if (!request.body.email || !request.body.password) {
      return response.status(400).json({
        status: 'error',
        error: 'Missing fields'
      }
      )
    }
    const email = request.body.email;
    const password = request.body.password;
    // Check if email is a valid email
    if (!email.match(/^([\w-]+(?:\.[\w-]+)*)@leg-uelzen\.de/)) {
      return response.status(400).json({
        status: 'error',
        error: 'field email is not an email.'
      })
    }
    if (password.length < 8) {
      return response.status(400).json({
        status: 'error',
        error: 'Password is too short'
      });
    }
    hash(password, 10, async (err: Error, hash: string) => {
      if (err) {
        return response.status(500).json({
          status: 'failure'
        });
      } else {
        try {
          if (!process.env.mongodb_uri_account) {
            response.status(500);
            console.error('Missing mongodb uri');
            return;
          }
          await connect(process.env.mongodb_uri_account);
          await new UserModel({
            email: email,
            password: hash.toString(),
            messaging: {}
          }).save();
          await disconnect();
          await sendVerificationMail(email, response);
          return response.status(201).json({
            status: 'success'
          });
        } catch (e) {
          if (e.code === 11000) {
            // Duplicate
            return response.status(400).json({
              status: 'error',
              error: 'Mail already registered.'
            });
          }
          console.error(e);
          return response.status(500).json({
            status: 'failure'
          });
        }
      }
    });
    return;
  }
  else if (request.method === 'GET') {
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
    const found: any = await UserModel.findOne({
      email: user.email
    }).lean();
    return response.status(200).json({
      status: 'success',
      user: {
        email: found.email,
        group: found.group,
      }
    })
  }
  else if (request.method === 'POST') {
    let { email, password } = request.body;
    if (!process.env.mongodb_uri_account) {
      response.status(500);
      console.error('Missing mongodb uri')
      return
    }
    await connect(process.env.mongodb_uri_account);
    const user: IUser = await UserModel.findOne({
      email: email
    }).lean();
    await disconnect();
    if (!user) {
      return response.status(400).json({
        status: 'error',
        error: 'Invalid username/password'
      })
    }
    if (await compare(password, user.password)) {
      if (!process.env.jwt_token) {
        console.error('Missing jwt key')
        return response.status(500);
      }
      const token = sign({
        id: (user as any)._id,
        email: user.email,
        group: user.group
      }, process.env.jwt_token, {
        expiresIn: '3d'
      });
      return response.status(200).json({
        status: 'success',
        token: token
      })
    } else {
      return response.status(400).json({
        status: 'error',
        error: 'Invalid username/password'
      })
    }
  }
  else if (request.method === 'PATCH') {
    if (!process.env.mongodb_uri_account) {
      response.status(500).json({
        status: 'failure'
      });
      console.error('Missing mongodb uri')
      return;
    }
    await connect(process.env.mongodb_uri_account);
    const user = getUserFromRequest(request, response);
    if (!request.body.user) {
      return response.status(400).json({
        status: 'error',
        error: 'Missing user'
      })
    }
    const newUser = request.body.user;
    const mongoUser = await UserModel.findOne({
      email: user.email
    });
    if (newUser.password !== '') {
      if (newUser.password.length < 9) {
        return response.status(200).json({
          status: 'error',
          error: 'Password is too short',
        })
      }
      mongoUser.password = await hash(newUser.password, 10);
    }
    if (newUser.group !== mongoUser.group) {
      mongoUser.group = newUser.group;
    }
    await mongoUser.save();
    await disconnect();
    return response.status(200).json({status: 'success'});
  }
  else {
    return response.status(405).json({
      status: 'error',
      error: 'Method not allowed',
      method: request.method
    })
  }
}

export function getUserFromToken(token: string, response: VercelResponse): any {
  if (!process.env.jwt_token) {
    console.error('Missing jwt key')
    return response.status(500);
  }
  return verify(token.toString(), process.env.jwt_token);
}

async function sendVerificationMail(email: string, response: VercelResponse) {
  if (!process.env.sendgrid) {
    console.error('Missing sendgrid key');
    return response.status(500).json({
      status: 'failure'
    });
  }
  if (!process.env.jwt_token) {
    console.error('Missing jwt key')
    return response.status(500);
  }
  const token = sign({
    email: email
  }, process.env.jwt_token, {
    expiresIn: '15m'
  });
  sgMail.setApiKey(process.env.sendgrid);
  const msg = {
    to: email,
    from: 'myleg@justcoding.tech',
    templateId: 'd-7dfbb005ba1746c78e2a4ddf9827a03a',
    dynamicTemplateData: {
      verification_url: 'https://myleg.vercel.app/api/verify?token=' + token
    }
  };
  await sgMail.send(msg, undefined, (err: any, result: any) => {
    if (err) {
      console.error(err);
    } else {
      console.log(result);
    }
  });
  return null;
}
