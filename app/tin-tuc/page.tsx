'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { OnboardingModal } from '@/components/OnboardingModal';
import { EducationNewsWidget } from '@/components/EducationNewsWidget';
import { DailyTipsWidget } from '@/components/DailyTipsWidget';
import { useStudyStorage } from '@/lib/useStudyStorage';
import { ArrowLeft, Newspaper, Sparkles, Flame, Radio } from 'lucide-react';

export default function TinTucPage() {
  const { profile, stats, liveLearnerCount, updateProfile, handleResetData } = useStudyStorage();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] selection:bg-rose-100 selection:text-rose-900">
      {/* Top Navbar */}
      <Navbar
        profile={profile}
        stats={stats}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onResetData={handleResetData}
        liveLearnerCount={liveLearnerCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-3 text-xs text-stone-500 mb-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-stone-900 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Về Tổng Quan</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-indigo-700">Tin Tức Báo Mới 2K9</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
              <Radio className="w-2.5 h-2.5 text-rose-600 animate-pulse" />
              Cập nhật trực tiếp
            </span>
          </div>
        </div>

        {/* Full Education News Portal */}
        <EducationNewsWidget isStandalonePage={true} />

        {/* Tips & Quotes */}
        <div className="mt-8">
          <DailyTipsWidget />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-stone-200/70 py-6 bg-white/60 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 font-medium text-stone-700">
            <span>Sĩ Tử 2027</span>
            <span>•</span>
            <Link href="/" className="hover:text-stone-900">Tổng quan</Link>
            <span>•</span>
            <Link href="/phong-hoc" className="hover:text-stone-900">Phòng học</Link>
            <span>•</span>
            <span className="text-indigo-700 font-semibold">Tin tức giáo dục</span>
          </div>
          <div className="text-stone-400">
            Nguồn tin chính thống từ Bộ GD&ĐT, VnExpress, Tuổi Trẻ, Thanh Niên & Dân Trí
          </div>
        </div>
      </footer>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        initialProfile={profile}
        onSave={updateProfile}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
}
