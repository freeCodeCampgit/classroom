import Head from 'next/head';
import Layout from '../components/layout';
import Link from 'next/link';
import Navbar from '../components/navbar';

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Create Next App</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon.ico' />
        <Navbar>
          <li>
            <Link href={'/invite'}>Invite</Link>
          </li>
          <li>
            <Link href={'#'}>Menu</Link>
          </li>
          <li>
            <Link href={'#'}>Sign out</Link>
          </li>
        </Navbar>
      </Head>
    </Layout>
  );
}