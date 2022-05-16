import type {VercelRequest, VercelResponse} from "@vercel/node";
import {getUserFromToken} from "./user";
import {createClient} from "@supabase/supabase-js";
import { IncomingForm } from 'formidable';
import * as fs from "fs";
import { getType } from "mime";

export const config = {
  api: {
    bodyParser: false,
  }
};

// @ts-ignore
export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (!request.headers.authorization) {
    return response.status(401).json({
      status: 'error',
      error: 'Missing authorization'
    });
  }
  const token = request.headers.authorization.split(' ')[1];
  getUserFromToken(token, response);

  if (!process.env.SUPABASE_TOKEN || !process.env.SUPABASE_URL) {
    console.error('Missing supabase token');
    return response.status(500).json({
      status: 'failure'
    });
  }
  const supabase = createClient(process.env.SUPABASE_URL,
    process.env.SUPABASE_TOKEN)

  if (request.method === 'POST') {
    const form: any = await new Promise((resolve, reject) => {
      const form = new IncomingForm();
      form.parse(request, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    try {
      const file = form.files.file;
      const fileName = form.fields.name;
      const filePath = file.filepath;
      if (!request.query.group || !request.query.subject) {
        return response.status(400).json({
          status: 'error',
          error: 'missing group or subject'
        });
      }
      const { data } = await supabase.storage.from('material')
        .upload(request.query.group + '/' + request.query.subject + '/' + fileName, fs.readFileSync(filePath), {
          contentType: getType(fileName) || undefined
        });
      return response.status(200).json({
        status: 'success',
        data: data
      })
    } catch (e) {
      return response.status(500).json({
        status: 'failure'
      });
    }
  }
}
