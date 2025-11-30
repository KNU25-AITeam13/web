'use client';

import { logoWhite } from '@/assets';
import links from '@/constants/links';
import { IconMail, IconPhone } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-primary-600 text-white py-12">
      <div className="container mx-auto px-36 flex flex-col lg:flex-row gap-12">
        <div className="lg:border-r lg:border-white/40 shrink-0 pr-12">
          <div className="text-2xl font-semibold pb-3 select-none">
            <Image src={logoWhite} alt="logo" height={52} />
          </div>
          <div className="text-sm font-light flex gap-2 pb-4">
            <span>2025-2 Artificial Intelligence</span>
            <span className="text-white/50">|</span>
            <span>Team 13</span>
          </div>

          <div className="pb-4 flex flex-col gap-1 text-sm"></div>

          <div className="text-sm font-light">
            © {new Date().getFullYear()} Mealog All rights reserved.
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 justify-between w-full">
          <div className="col-span-1 pb-6">
            <div className="pb-2">ABOUT</div>
            <Link href="/" className="text-sm font-light pb-1">
              서비스 소개
            </Link>
            <div className="text-sm font-light pb-1">공지사항</div>
          </div>
          <div className="col-span-1 pb-6">
            <div className="pb-2">SERVICES</div>
            <div className="text-sm font-light pb-1">게시판</div>
          </div>
          <div className="col-span-1 flex flex-col pb-6">
            <div className="pb-2">LINKS</div>
            <a href={links.github} className="text-sm font-light pb-1">
              팀 GitHub
            </a>
            <a href={links.web} className="text-sm font-light pb-1">
              웹 리포지토리
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
