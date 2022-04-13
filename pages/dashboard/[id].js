import Head from 'next/head';
import Layout from '../../components/layout';
import Link from 'next/link';
import Navbar from '../../components/navbar';
import { PrismaClient } from '@prisma/client';
import DashTabs from '../../components/dashtabs';
const prisma = new PrismaClient();

export async function getServerSideProps(context) {
  /* First we ask the database which superblocks we need to get the data from.
     The URL of the page looks like /dashboard/<CLASSROOM_ID> where CLASSROOM ID corresponds with classroomId in our database
     Each classroom object in our database has an array fccCertifications where each number in that array corresponds to a specific superblock
     certificationNumbers is this list which belongs to this specific classroom id
  */

  const certificationNumbers = await prisma.classroom.findUnique({
    where: {
      classroomId: context.params.id
    },
    select: {
      fccCertifications: true
    }
  });

  //base URL of freecodecamp's API
  const base_url = 'https://www.freecodecamp.org/mobile/';

  //url of alll the superblocks
  const superblocksres = await fetch(
    'https://www.freecodecamp.org/mobile/availableSuperblocks.json'
  );
  const superblocksreq = await superblocksres.json();

  //1 in the certification numbers will correspond with the first superblock name we get from freecodeCamp for example
  //we add the name that we get from the availableSuperBlocks to the base url to get the url that will give us the data from a specific superblock

  let urls = [];
  let names = [];
  let apiNames = [];
  // This will push the URLs needed as well as the human readable names of the courses to our dashtable & dashtabs component respectively
  for (let x in certificationNumbers['fccCertifications']) {
    urls.push(base_url + superblocksreq['superblocks'][0][x] + '.json');
    names.push(superblocksreq['superblocks'][1][x]);
    apiNames.push(superblocksreq['superblocks'][0][x]);
  }

  let jsonResponses = [];
  for (let i = 0; i < urls.length; i++) {
    let currUrl = await fetch(urls[i]);
    let currRes = await currUrl.json();
    jsonResponses.push(currRes);
  }
  let blocks = [];
  for (let i = 0; i < jsonResponses.length; i++) {
    let name = apiNames[i];
    blocks.push(jsonResponses[i][name]['blocks']);
  }
  let sortedBlocks = [];
  for (let i = 0; i < blocks.length; i++) {
    var currSort = [];
    for (let challenge of Object.keys(blocks[i])) {
      // This names our columns using human readable module names, and gives it a selector of the same name, but in dashed format.
      currSort.push([
        {
          name: blocks[i][challenge]['challenges']['name'],
          selector: challenge
        },
        blocks[i][challenge]['challenges']['order']
      ]);
    }
    // Sorts our columns based on the order that it holds in our block
    currSort.sort(function (a, b) {
      if (a[1] === b[1]) {
        return 0;
      } else {
        return a[1] < b[1] ? -1 : 1;
      }
    });
    const arrayColumn = (arr, n) => arr.map(x => x[n]);
    currSort = arrayColumn(currSort, 0);
    sortedBlocks.push(currSort);
  }
  //1 refers to the second element in our list
  //https://lage.us/Javascript-Sort-2d-Array-by-Column.html
  console.log(sortedBlocks);
  return {
    props: { columns: sortedBlocks, certificationNames: names }
  };
}

export default function Home({ columns, certificationNames }) {
  let tabNames = certificationNames;
  let columnNames = columns;
  return (
    <Layout>
      <Head>
        <title>Create Next App</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon.ico' />
        <Navbar>
          <Link href={'#'}>Back</Link>
          <Link href={'#'}>Menu</Link>
          <Link href={'#'}>Extra</Link>
        </Navbar>
      </Head>
      <DashTabs columns={columnNames} certificationNames={tabNames}></DashTabs>
    </Layout>
  );
}