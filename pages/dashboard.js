import Head from 'next/head';
import Layout from '../components/layout';
import Link from 'next/link';
import Navbar from '../components/navbar';
import DashTable from '../components/dashtable';

export async function getServerSideProps() {
  let url = '';
  const res = await fetch(url);
  const req = await res.json();
  const blocks = req['responsive-web-design']['blocks'];
  let sortedBlocks = [];
  for (var block in blocks) {
    sortedBlocks.push([
      { name: block, selector: null },
      blocks[block]['challenges']['order']
    ]);
  }

  //1 refers to the second element in our list
  //https://lage.us/Javascript-Sort-2d-Array-by-Column.html

  sortedBlocks.sort(function (a, b) {
    if (a[1] === b[1]) {
      return 0;
    } else {
      return a[1] < b[1] ? -1 : 1;
    }
  });

  const arrayColumn = (arr, n) => arr.map(x => x[n]);

  return {
    props: { columns: arrayColumn(sortedBlocks, 0) }
  };
}

export default function Home({ columns }) {
  return (
    <Layout>
      <Head>
        <title>Create Next App</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon.ico' />
        <Navbar>
          <Link href={'/invite'}>Invite</Link>
          <Link href={'#'}>Menu</Link>
          <Link href={'#'}>Sign out</Link>
        </Navbar>
      </Head>
      <DashTable columns={columns} rows={null}></DashTable>
    </Layout>
  );
}
