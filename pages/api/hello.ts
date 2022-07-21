// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

interface Message {
  id: string;
  iccid: string;
  delivery_date: Date;
  expiry_date: Date;
  payload: string;
}
interface Data {
  messages?: Message[];
  errorMessage?: string;
}

const getAuthToken = async () => {
  const options = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${process.env.AUTH_TOKEN}`
    },
    body: JSON.stringify({ grant_type: 'client_credentials' })
  };
  const response = await fetch('https://api.1nce.com/management-api/oauth/token', options);
  const data = await response.json();

  return data;
};
const getData = async (token: string) => {
  const options = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    }
  };
  const iccid = '8988228066602768926';
  const response = await fetch(
    `https://api.1nce.com/management-api/v1/sims/${iccid}/sms?page=1&pageSize=100`,
    options,
  );
  const data = await response.json();

  return data;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { access_token } = await getAuthToken();

  if (access_token) {
    const data = await getData(access_token);

    res.status(200).json({ messages: [...Object.keys(data).map((i) => data[i])] })
  } else {
    res.status(400).json({ errorMessage: 'Something went wrong' });
  }
}
