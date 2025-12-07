'use client';

import MainLayout from '@/components/MainLayout';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';
import {
  Meal,
  MealItem,
  MealItemAnalysis,
  User,
} from '@/generated/prisma/client';
import { IconChevronDown, IconTrash } from '@tabler/icons-react';
import clsx from 'clsx';
import dayjs from 'dayjs';
import Image from 'next/image';
import 'dayjs/locale/ko';
import axios from 'axios';
import Button from '@/components/Button';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
dayjs.locale('ko');

interface MealPageLayoutProps {
  user: User;
  mealDate: string;
  meals: (Meal & {
    mealItems: (MealItem & { mealItemAnalysis: MealItemAnalysis | null })[];
  })[];
  imageUrls: Record<string, string[]>;
}

export default function MealPageLayout({
  user,
  mealDate,
  meals,
  imageUrls,
}: MealPageLayoutProps) {
  const router = useRouter();

  const handlePublish = (mealId: string) => {
    axios.post('/api/articles', {
      mealId,
    });
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm('이 식사를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await axios.delete(`/api/meals?mealId=${mealId}`);
      toast.success('식사가 삭제되었습니다.');
      router.refresh();
    } catch (error) {
      toast.error('식사 삭제에 실패했습니다.');
      console.error(error);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-36 py-24 min-h-screen">
        <div className="text-primary-800 pb-8 border-b mb-8 flex justify-between">
          <div className="text-4xl font-bold">
            {dayjs(mealDate).format('YYYY년 MM월 DD일')}
          </div>
        </div>

        <div className="flex gap-8 w-full">
          <div className="grow">
            <div className="text-2xl font-semibold pb-4">이날의 식사들</div>

            <div className="flex flex-col items-start gap-2">
              {meals.map((meal) => {
                let typeStr = '';
                switch (meal.type) {
                  case 'breakfast':
                    typeStr = '아침';
                    break;
                  case 'lunch':
                    typeStr = '점심';
                    break;
                  case 'dinner':
                    typeStr = '저녁';
                    break;
                }

                const { mealItems } = meal;
                return (
                  <Disclosure
                    key={meal.mealId}
                    as="div"
                    className="bg-gray-100 w-full rounded-xl"
                  >
                    {({ open }) => (
                      <>
                        <div className="flex items-stretch">
                          <DisclosureButton className="px-6 py-4 flex justify-between grow">
                            <div className="text-left">
                              <div className="text-xl text-primary-800 font-bold pb-2">
                                {typeStr}
                              </div>
                              <div className="flex gap-4">
                                <div className="text-sm grow text-black/60">
                                  {mealItems.length}개의 음식
                                </div>
                              </div>
                            </div>
                            <div>
                              <IconChevronDown
                                className={clsx(
                                  open ? 'rotate-90' : '',
                                  'transition-all duration-200'
                                )}
                                size={28}
                              />
                            </div>
                          </DisclosureButton>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMeal(meal.mealId);
                            }}
                            className="px-4 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                            title="식사 삭제"
                          >
                            <IconTrash size={20} />
                          </button>
                        </div>

                        <DisclosurePanel
                          transition
                          className="origin-top transition duration-200 ease-out data-closed:-translate-y-6 data-closed:opacity-0 pb-6 px-6"
                        >
                          <div className="text-xl text-primary-800 font-semibold px-4 pb-4">
                            식품별 분석 정보
                          </div>

                          <div className="flex flex-col gap-6 px-4">
                            {mealItems.map((mealItem, index) => {
                              const { mealItemAnalysis } = mealItem;

                              return (
                                <div
                                  key={index}
                                  className="flex gap-12 items-center"
                                >
                                  <Image
                                    src={imageUrls[meal.mealId][index]}
                                    alt=""
                                    width={200}
                                    height={200}
                                    className="object-cover w-48 aspect-square border rounded-xl"
                                  />
                                  {mealItemAnalysis ? (
                                    <div className="w-full">
                                      <div className="flex gap-4 items-center">
                                        <div className="text-xl font-semibold">
                                          {mealItemAnalysis?.foodName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          정확도{' '}
                                          {(
                                            mealItemAnalysis?.confidence * 100
                                          ).toFixed(2)}
                                          %
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-7 gap-4 w-full py-6">
                                        <div className="col-span-1">
                                          <div className="text-black/60 text-sm">
                                            칼로리
                                          </div>
                                          <div className="font-medium">
                                            {mealItemAnalysis?.caloriesKcal?.toFixed(
                                              2
                                            ) ?? 'N/A'}{' '}
                                            kcal
                                          </div>
                                        </div>
                                        <div className="col-span-1">
                                          <div className="text-black/60 text-sm">
                                            탄수화물
                                          </div>
                                          <div className="font-medium">
                                            {mealItemAnalysis?.carbsG?.toFixed(
                                              2
                                            ) ?? 'N/A'}{' '}
                                            g
                                          </div>
                                        </div>
                                        <div className="col-span-1">
                                          <div className="text-black/60 text-sm">
                                            당류
                                          </div>
                                          <div className="font-medium">
                                            {mealItemAnalysis?.sugarsG?.toFixed(
                                              2
                                            ) ?? 'N/A'}{' '}
                                            g
                                          </div>
                                        </div>
                                        <div className="col-span-1">
                                          <div className="text-black/60 text-sm">
                                            지방
                                          </div>
                                          <div className="font-medium">
                                            {mealItemAnalysis?.fatG?.toFixed(
                                              2
                                            ) ?? 'N/A'}{' '}
                                            g
                                          </div>
                                        </div>
                                        <div className="col-span-1">
                                          <div className="text-black/60 text-sm">
                                            단백질
                                          </div>
                                          <div className="font-medium">
                                            {mealItemAnalysis?.proteinG?.toFixed(
                                              2
                                            ) ?? 'N/A'}{' '}
                                            g
                                          </div>
                                        </div>
                                        <div className="col-span-1">
                                          <div className="text-black/60 text-sm">
                                            칼슘
                                          </div>
                                          <div className="font-medium">
                                            {mealItemAnalysis?.calciumMg?.toFixed(
                                              2
                                            ) ?? 'N/A'}{' '}
                                            mg
                                          </div>
                                        </div>
                                        <div className="col-span-1">
                                          <div className="text-black/60 text-sm">
                                            나트륨
                                          </div>
                                          <div className="font-medium">
                                            {mealItemAnalysis?.sodiumMg?.toFixed(
                                              2
                                            ) ?? 'N/A'}{' '}
                                            mg
                                          </div>
                                        </div>
                                        <div className="col-span-1">
                                          <div className="text-black/60 text-sm">
                                            철분
                                          </div>
                                          <div className="font-medium">
                                            {mealItemAnalysis?.ironMg?.toFixed(
                                              2
                                            ) ?? 'N/A'}{' '}
                                            mg
                                          </div>
                                        </div>
                                        <div className="col-span-1">
                                          <div className="text-black/60 text-sm">
                                            콜레스테롤
                                          </div>
                                          <div className="font-medium">
                                            {mealItemAnalysis?.cholesterolMg?.toFixed(
                                              2
                                            ) ?? 'N/A'}{' '}
                                            mg
                                          </div>
                                        </div>
                                        <div className="col-span-1">
                                          <div className="text-black/60 text-sm">
                                            비타민A
                                          </div>
                                          <div className="font-medium">
                                            {mealItemAnalysis?.vitaminAUg?.toFixed(
                                              2
                                            ) ?? 'N/A'}{' '}
                                            μg
                                          </div>
                                        </div>
                                        <div className="col-span-1">
                                          <div className="text-black/60 text-sm">
                                            비타민C
                                          </div>
                                          <div className="font-medium">
                                            {mealItemAnalysis?.vitaminCMg?.toFixed(
                                              2
                                            ) ?? 'N/A'}{' '}
                                            mg
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="">
                                      <div className="text-xl font-bold">
                                        인식 실패
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* <div className="flex justify-end pt-6">
                            <Button
                              className="text-sm"
                              onClick={() => {
                                if (
                                  confirm(
                                    '이 식사를 게시할까요? 모든 사용자가 볼 수 있습니다.'
                                  )
                                ) {
                                  handlePublish(meal.mealId);
                                }
                              }}
                            >
                              게시글로 등록하기
                            </Button>
                          </div> */}
                        </DisclosurePanel>
                      </>
                    )}
                  </Disclosure>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
