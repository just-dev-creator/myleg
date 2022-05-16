import type {VercelRequest, VercelResponse} from "@vercel/node";
import {getUserFromToken} from "./user";
import {createClient, SupabaseClient} from "@supabase/supabase-js";

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
    process.env.SUPABASE_TOKEN);


  if (request.method === 'GET') {
    if (request.query.url) {
      return response.status(200).send(await fetch(request.query.url.toString()));
    }
    if (!request.query.group) {
      return response.status(400).json({
        status: 'error',
        error: 'Missing group'
      });
    }
    await createDefaultFolders(supabase, request.query.group.toString())
    if (!request.query.subject) {
      const { data, error } = await supabase.storage.from('material').list(request.query.group.toString(), {
        limit: 100
      });
      if (error) {
        console.error(error);
        return response.status(500).json({
          status: 'failure'
        });
      }
      return response.status(200).json({
          status: 'success',
          data: data
        }
      );
    } else {
      if (!request.query.file) {
        const { data, error } = await supabase.storage.from('material').list(request.query.group + '/' +
          request.query.subject, {
          limit: 100
        });
        if (error) {
          console.error(error);
          return response.status(500).json({
            status: 'failure'
          });
        }
        return response.status(200).json({
            status: 'success',
            data: data
          }
        );
      }
      const { data, error } = await supabase.storage.from('material').createSignedUrl(request.query.group + '/' +
        request.query.subject + '/' + request.query.file, 60);
      if (error) {
        console.error(error);
        return response.status(500).json({
          status: 'failure'
        });
      }
      if (data) {
        data.signedURL = data.signedURL.replace(
          'https://myufqeudzfakufgienma.supabase.co/storage/v1/object/sign/material/',
          'https://myleg.vercel.app/api/download/');
      }
      return response.status(200).json({
        status: 'success',
        data: data
        });
    }
  }
  else {
    return response.status(405).json({
      status: 'error',
      error: 'Method not allowed'
    });
  }
}

async function createDefaultFolders(supabase: SupabaseClient, group: string) {
  const subjects: string[] = [];
  subjects.push('Latein');
  subjects.push('Franzoesisch');
  subjects.push('Russisch');
  subjects.push('Deutsch');
  subjects.push('Englisch');
  subjects.push('Mathematik');
  subjects.push('Biologie');
  subjects.push('Chemie');
  subjects.push('Physik');
  subjects.push('Geschichte');
  subjects.push('Politik-Wirtschaft');
  subjects.push('Musik');
  subjects.push('Kunst');
  subjects.push('Religion');
  subjects.push('Sport');
  for (let subject of subjects) {
    await supabase.storage.from('material')
      .upload(group + '/' + subject + '/.emptyFolderPlaceholder', Buffer.alloc(0));
  }
}
