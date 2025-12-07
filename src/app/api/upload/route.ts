import { NextRequest, NextResponse } from 'next/server';
import { uploadSchema } from './schema';
import { v4 } from 'uuid';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { s3Client, BUCKET_NAME } from '@/lib/s3Client';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const formData = await request.formData();

  const { data, error } = uploadSchema.safeParse(formData);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  const { date, type, images } = data;

  if (images.length === 0) {
    return NextResponse.json(
      { message: '이미지를 업로드해주세요.' },
      { status: 400 }
    );
  }

  const fileNames: string[] = [];

  for (const image of images) {
    const fileExtension = image.name.split('.').pop();
    const fileName = `${v4()}.${fileExtension}`;
    fileNames.push(fileName);

    console.log(fileName);

    const buffer = Buffer.from(await image.arrayBuffer());

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `images/${fileName}`,
        Body: buffer,
        ContentType: image.type,
      })
    );
  }

  const meal = await prisma.meal.create({
    data: {
      userId: user.id,
      date: new Date(date),
      type,
    },
  });

  await prisma.mealItem.createMany({
    data: fileNames.map((fileName) => ({
      mealId: meal.mealId,
      imageName: fileName,
    })),
  });

  return NextResponse.json({ message: 'OK', data: meal });
}
