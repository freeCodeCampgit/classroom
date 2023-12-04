import Head from 'next/head';
import Layout from '../../../components/layout';
import Link from 'next/link';
import prisma from '../../../prisma/prisma';
import Navbar from '../../../components/navbar';
import { getSession } from 'next-auth/react';
import GlobalDashboardTable from '../../../components/dashtable_v2';
import React from 'react';
import {
  createDashboardObject,
  getTotalChallenges,
  getDashedNamesURLs,
  getSuperBlockJsons,
  formattedStudentData,
  getCompletionTimestamps
} from '../../../util/api_proccesor';

export async function getServerSideProps(context) {
  //making sure User is the teacher of this classsroom's dashboard
  const userSession = await getSession(context);
  if (!userSession) {
    context.res.writeHead(302, { Location: '/' });
    context.res.end();
    return {};
  }

  const userEmail = await prisma.User.findMany({
    where: {
      email: userSession['user']['email']
    }
  });

  const classroomTeacherId = await prisma.classroom.findUnique({
    where: {
      classroomId: context.params.id
    },
    select: {
      classroomTeacherId: true
    }
  });

  if (
    classroomTeacherId == null ||
    userEmail[0].id == null ||
    userEmail[0].id !== classroomTeacherId['classroomTeacherId']
  ) {
    context.res.writeHead(302, { Location: '/classes' });
    context.res.end();
    return {};
  }

  const certificationNumbers = await prisma.classroom.findUnique({
    where: {
      classroomId: context.params.id
    },
    select: {
      fccCertifications: true
    }
  });

  let studentInfo = await formattedStudentData();

  let taskCompletionDates = getCompletionTimestamps(studentInfo);

  let classCertificationURLS = await getDashedNamesURLs(
    certificationNumbers.fccCertifications
  );

  let classCertificationDetails = await getSuperBlockJsons(
    classCertificationURLS
  );

  let certificationDashboardView = createDashboardObject(
    classCertificationDetails
  );

  let totalCourseTasks = getTotalChallenges(certificationDashboardView);

  return {
    props: {
      userSession,
      classroomId: context.params.id,
      studentData: studentInfo,
      totalCourseTasks: totalCourseTasks,
      taskCompletionDates: taskCompletionDates
    }
  };
}

export default function Home({
  userSession,
  studentData,
  classroomId,
  totalCourseTasks,
  taskCompletionDates
}) {
  return (
    <Layout>
      <Head>
        <title>Create Next App</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      {userSession && (
        <>
          <Navbar>
            <div className='border-solid border-2 pl-4 pr-4'>
              <Link href={'/classes'}>Classes</Link>
            </div>
            <div className='border-solid border-2 pl-4 pr-4'>
              <Link href={'/'}> Menu</Link>
            </div>
          </Navbar>
          <GlobalDashboardTable
            studentData={studentData}
            classroomId={classroomId}
            timestamps={taskCompletionDates}
            totalChallenges={totalCourseTasks}
          ></GlobalDashboardTable>
        </>
      )}
    </Layout>
  );
}
