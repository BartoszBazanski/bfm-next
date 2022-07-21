import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useEffect, useState, useMemo } from 'react';
import { isArray } from 'lodash';
interface Message {
  id: string;
  iccid: string;
  delivery_date: Date;
  expiry_date: Date;
  payload: string;
}

const Home: NextPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const loadData = async () => {
    setLoading(true);
    const response = await fetch('/api/hello');
    const { messages } = await response.json();

    setLoading(false);
    setMessages(messages);
  };
  const parseDate = (dateString: Date): string => (
    new Date(dateString).toLocaleString()
  );
  const list = useMemo(() => {
    const dataObject: { [key: string]: string } = {};
    const pattern = `\\d{1,2}[_]\\d{1,2}`;
    const regexp = new RegExp(pattern, 'g');
    const getRegExp = (identifier: string): RegExp => (
      new RegExp(
        `(?<=(${identifier}:W:))\\d{1,2}[.]\\d{2}[(][+|-]\\d{1,2}[.]\\d{2}[)]`
      )
    );

    if (isArray(messages)) {
      messages.forEach((message) => {
        const matches = message.payload.match(regexp);

        if (matches) {
          matches.forEach((m) => {
            const data = message.payload.match(getRegExp(m));

            if (data) {
              dataObject[m] = data[0];
            }
          });
        }
      });
    }

    return dataObject;
  }, [messages])
  const parsePayload = (payload: string): string => {
    const pattern = `(?<=\\d{1,2}[_]\\d{1,2}(:W:))\\d{1,2}[.]\\d{2}[(][+|-]\\d{1,2}[.]\\d{2}[)]`;
    const regexp = new RegExp(pattern, 'g');
    const match = payload.match(regexp);

    if (match) {
      return match[0];
    }

    return 'Message not readable';
  };

  useEffect(() => {
    loadData();
  }, [])

  console.log(list);

  return (
    <div className={styles.container}>
      <Head>
        <title>Bee Farm Meter</title>
        <meta name="description" content="Simple App showing data from bee farm monitoring devices" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {loading && (
          <p>Loading...</p>
        )}
        {!loading && (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr key={message.id}>
                  <td>{message.id}</td>
                  <td>{parseDate(message.delivery_date)}</td>
                  <td>{parsePayload(message.payload)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}

export default Home
