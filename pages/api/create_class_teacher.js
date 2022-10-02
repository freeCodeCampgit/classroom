import prisma from '../../prisma/prisma';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

export default async function handle(req, res) {
  //unstable_getServerSession is recommended here: https://next-auth.js.org/configuration/nextjs
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!req.method == 'POST') {
    res.status(405).end();
  }

  if (!session) {
    res.status(403).end();
  }

  let users = await prisma.user.findMany({
    where: {
      role: 'TEACHER'
    },
    select: {
      email: true
    }
  });

  //if user is not teacher, reject request
  if (!users.map(x => x.email).includes(session.user.email)) {
    res.status(403).end();
  }

  const data = JSON.parse(req.body);

  const createClassInDB = await prisma.classroom.create({
    data: {
      classroomName: data['className'],
      description: data['description'],
      classroomTeacherId: data['classroomTeacherId'],
      fccCertifications: data['fccCertifications']
    }
  });

  res.json(createClassInDB);
}
