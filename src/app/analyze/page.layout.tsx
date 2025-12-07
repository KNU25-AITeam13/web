'use client';

import MainLayout from '@/components/MainLayout';
import { Meal, MealItem } from '@/generated/prisma/client';
import { IconCheck, IconFileAnalytics, IconLoader2 } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getImageUrl } from '@/lib/s3Client';
import Image from 'next/image';

import dayjs from 'dayjs';
import 'dayjs/locale/ko';

dayjs.locale('ko');

interface AnalyzePageLayoutProps {
  mealId: string;
  meal: Meal;
  mealItems: MealItem[];
}

interface AnalysisState {
  step: number;
  message: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
}

function AnalysisCard({
  mealItem,
  onStatusChange,
}: {
  mealItem: MealItem;
  onStatusChange: (status: AnalysisState['status']) => void;
}) {
  const [state, setState] = useState<AnalysisState>({
    step: 0,
    message: '분석 대기 중...',
    status: 'pending',
  });

  useEffect(() => {
    const eventSource = new EventSource(
      `/api/analyze?mealItemId=${mealItem.mealItemId}`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.status === 'in_progress') {
          const newState = {
            step: data.step,
            message: data.message,
            status: 'in_progress' as const,
          };
          setState(newState);
          onStatusChange(newState.status);
        } else if (data.status === 'completed') {
          const newState = {
            step: 4,
            message: '분석 완료!',
            status: 'completed' as const,
          };
          setState(newState);
          onStatusChange(newState.status);
          eventSource.close();
        } else if (data.status === 'error') {
          const newState = {
            step: 0,
            message: '분석 실패',
            status: 'error' as const,
          };
          setState(newState);
          onStatusChange(newState.status);
          eventSource.close();
        }
      } catch (error) {
        console.error('Failed to parse SSE data:', error);
      }
    };

    eventSource.onerror = () => {
      const newState = {
        step: 0,
        message: '연결 오류',
        status: 'error' as const,
      };
      setState(newState);
      onStatusChange(newState.status);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [mealItem.mealItemId, onStatusChange]);

  const imageUrl = getImageUrl(mealItem.imageName);

  return (
    <div className="bg-white rounded-xl p-4 shadow-md">
      <Image
        src={imageUrl}
        alt="음식 이미지"
        width={200}
        height={200}
        className="w-full h-40 object-cover rounded-lg mb-3"
      />

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {state.status === 'completed' ? (
            <IconCheck className="text-green-600" size={20} />
          ) : state.status === 'error' ? (
            <div className="w-5 h-5 rounded-full bg-red-500" />
          ) : (
            <IconLoader2 className="animate-spin text-primary-600" size={20} />
          )}
          <span className="text-sm font-semibold">{state.message}</span>
        </div>

        {state.status === 'in_progress' && (
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-1 flex-1 rounded-full transition-all ${
                  step <= state.step ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalyzePageLayout({
  mealId,
  meal,
  mealItems,
}: AnalyzePageLayoutProps) {
  const router = useRouter();
  const [statusMap, setStatusMap] = useState<
    Record<string, AnalysisState['status']>
  >({});

  const handleStatusChange = (
    mealItemId: string,
    status: AnalysisState['status']
  ) => {
    setStatusMap((prev) => ({ ...prev, [mealItemId]: status }));
  };

  useEffect(() => {
    const completedCount = Object.values(statusMap).filter(
      (status) => status === 'completed'
    ).length;

    if (completedCount === mealItems.length && mealItems.length > 0) {
      toast.success('분석이 완료되었습니다! 결과 페이지로 이동합니다.');
      setTimeout(
        () => router.push(`/meals/${dayjs(meal.date).format('YYYY-MM-DD')}`),
        2000
      );
    }
  }, [statusMap, mealItems.length, meal.date, router]);

  return (
    <MainLayout>
      <div className="container mx-auto px-36 py-16">
        <div className="text-center mb-12">
          <div className="text-primary-800 text-4xl font-extrabold flex items-center justify-center gap-2 pb-4">
            <IconFileAnalytics size={36} className="animate-bounce" />
            <span>AI 분석 중입니다...</span>
          </div>

          <div className="text-gray-500 font-regular">
            업로드하신 사진을 AI가 살펴보고 영양 정보를 분석하고 있어요, 조금만
            기다려주세요!
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mealItems.map((mealItem) => (
            <AnalysisCard
              key={mealItem.mealItemId}
              mealItem={mealItem}
              onStatusChange={(status) =>
                handleStatusChange(mealItem.mealItemId, status)
              }
            />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
