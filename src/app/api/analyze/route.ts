import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getImageUrl } from '@/lib/s3Client';

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const mealItemId = searchParams.get('mealItemId');

  if (!mealItemId) {
    return NextResponse.json(
      { error: 'mealItemId is required' },
      { status: 400 }
    );
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const mealItem = await prisma.mealItem.findUnique({
    where: {
      mealItemId,
      meal: {
        userId: user.id,
      },
    },
    include: {
      mealItemAnalysis: true,
    },
  });

  if (!mealItem) {
    return NextResponse.json({ error: 'mealItem not found' }, { status: 404 });
  }

  if (mealItem.mealItemAnalysis) {
    return NextResponse.json(
      { error: 'mealItemAnalysis already exists' },
      { status: 400 }
    );
  }

  // CloudFront URL로 이미지 가져오기
  const imageUrl = getImageUrl(mealItem.imageName);

  // 이미지 다운로드
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }

  const imageBlob = await imageResponse.blob();
  const imageFile = new File([imageBlob], mealItem.imageName, {
    type: imageBlob.type,
  });

  // FormData 생성
  const formData = new FormData();
  formData.append('file', imageFile);

  // AI API SSE 스트림 호출
  const aiResponse = await fetch(`${process.env.AI_API_URL}/analyze-stream`, {
    method: 'POST',
    body: formData,
  });

  if (!aiResponse.ok) {
    return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 });
  }

  if (!aiResponse.body) {
    return NextResponse.json(
      { error: 'No response body from AI API' },
      { status: 500 }
    );
  }

  const reader = aiResponse.body.getReader();
  const decoder = new TextDecoder();

  // SSE 스트림을 클라이언트로 프록시
  const stream = new ReadableStream({
    async start(controller) {
      let buffer = '';
      let analysisResult: any = null;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              try {
                const parsed = JSON.parse(data);

                // completed 이벤트에서 결과 저장
                if (parsed.status === 'completed' && parsed.result) {
                  analysisResult = parsed.result;
                }

                // 클라이언트로 전송
                controller.enqueue(
                  new TextEncoder().encode(`data: ${data}\n\n`)
                );
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }

        // 분석 완료 후 DB에 저장
        if (analysisResult) {
          await prisma.mealItemAnalysis.create({
            data: {
              mealItemId: mealItem.mealItemId,
              foodName: analysisResult.foodName,
              confidence: analysisResult.confidence,
              volumeMl: analysisResult.volumeMl,
              massG: analysisResult.massG,
              caloriesKcal: analysisResult.nutrition?.caloriesKcal,
              proteinG: analysisResult.nutrition?.proteinG,
              fatG: analysisResult.nutrition?.fatG,
              carbsG: analysisResult.nutrition?.carbsG,
              waterG: analysisResult.nutrition?.waterG,
              sugarsG: analysisResult.nutrition?.sugarsG,
              dietaryFiberG: analysisResult.nutrition?.dietaryFiberG,
              sodiumMg: analysisResult.nutrition?.sodiumMg,
              cholesterolMg: analysisResult.nutrition?.cholesterolMg,
              saturatedFatG: analysisResult.nutrition?.saturatedFatG,
              calciumMg: analysisResult.nutrition?.calciumMg,
              ironMg: analysisResult.nutrition?.ironMg,
              vitaminAUg: analysisResult.nutrition?.vitaminAUg,
              vitaminCMg: analysisResult.nutrition?.vitaminCMg,
            },
          });
        }

        try {
          controller.close();
        } catch {
          // Controller already closed, ignore
        }
      } catch (error) {
        console.error('Stream error:', error);
        try {
          controller.error(error);
        } catch {
          // Controller already closed, ignore
        }
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

export async function POST(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const mealItemId = searchParams.get('mealItemId');

  if (!mealItemId) {
    return NextResponse.json(
      { error: 'mealItemId is required' },
      { status: 400 }
    );
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const mealItem = await prisma.mealItem.findUnique({
    where: {
      mealItemId,
      meal: {
        userId: user.id,
      },
    },
    include: {
      mealItemAnalysis: true,
    },
  });

  if (!mealItem) {
    return NextResponse.json({ error: 'mealItem not found' }, { status: 404 });
  }

  if (mealItem.mealItemAnalysis) {
    return NextResponse.json(
      { error: 'mealItemAnalysis already exists' },
      { status: 400 }
    );
  }

  // CloudFront URL로 이미지 가져오기
  const imageUrl = getImageUrl(mealItem.imageName);

  // 이미지 다운로드
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }

  const imageBlob = await imageResponse.blob();
  const imageFile = new File([imageBlob], mealItem.imageName, {
    type: imageBlob.type,
  });

  // FormData 생성
  const formData = new FormData();
  formData.append('file', imageFile);

  // AI API SSE 스트림 호출
  const aiResponse = await fetch(`${process.env.AI_API_URL}/analyze-stream`, {
    method: 'POST',
    body: formData,
  });

  if (!aiResponse.ok) {
    return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 });
  }

  if (!aiResponse.body) {
    return NextResponse.json(
      { error: 'No response body from AI API' },
      { status: 500 }
    );
  }

  const reader = aiResponse.body.getReader();
  const decoder = new TextDecoder();

  // SSE 스트림을 클라이언트로 프록시
  const stream = new ReadableStream({
    async start(controller) {
      let buffer = '';
      let analysisResult: any = null;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              try {
                const parsed = JSON.parse(data);

                // completed 이벤트에서 결과 저장
                if (parsed.status === 'completed' && parsed.result) {
                  analysisResult = parsed.result;
                }

                // 클라이언트로 전송
                controller.enqueue(
                  new TextEncoder().encode(`data: ${data}\n\n`)
                );
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }

        // 분석 완료 후 DB에 저장
        if (analysisResult) {
          await prisma.mealItemAnalysis.create({
            data: {
              mealItemId: mealItem.mealItemId,
              foodName: analysisResult.foodName,
              confidence: analysisResult.confidence,
              volumeMl: analysisResult.volumeMl,
              massG: analysisResult.massG,
              caloriesKcal: analysisResult.nutrition?.caloriesKcal,
              proteinG: analysisResult.nutrition?.proteinG,
              fatG: analysisResult.nutrition?.fatG,
              carbsG: analysisResult.nutrition?.carbsG,
              waterG: analysisResult.nutrition?.waterG,
              sugarsG: analysisResult.nutrition?.sugarsG,
              dietaryFiberG: analysisResult.nutrition?.dietaryFiberG,
              sodiumMg: analysisResult.nutrition?.sodiumMg,
              cholesterolMg: analysisResult.nutrition?.cholesterolMg,
              saturatedFatG: analysisResult.nutrition?.saturatedFatG,
              calciumMg: analysisResult.nutrition?.calciumMg,
              ironMg: analysisResult.nutrition?.ironMg,
              vitaminAUg: analysisResult.nutrition?.vitaminAUg,
              vitaminCMg: analysisResult.nutrition?.vitaminCMg,
            },
          });
        }

        try {
          controller.close();
        } catch {
          // Controller already closed, ignore
        }
      } catch (error) {
        console.error('Stream error:', error);
        try {
          controller.error(error);
        } catch {
          // Controller already closed, ignore
        }
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
