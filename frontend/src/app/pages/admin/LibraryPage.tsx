// src/app/library/page.tsx
'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid, List, Plus } from 'lucide-react';
import { LibraryHeader } from '../../components/adminComponents/library/LibraryHeader';
import { AIBanner } from '../../components/adminComponents/library/AIBanner';
import { ActivityChart } from '../../components/adminComponents/library/ActivityChart';
import { FormatStats } from '../../components/adminComponents/library/FormatStats';
import { DocumentCard } from '../../components/adminComponents/library/DocumentCard';
import { StorageWidget } from '../../components/adminComponents/library/StorageWidget';
import { RecentActivities } from '../../components/adminComponents/library/RecentActivities';
import { TrendingTags } from '../../components/adminComponents/library/TrendingTags';
import { QuickActions } from '../../components/adminComponents/library/QuickActions';
import { mockDocuments, mockActivities, storageStats, formatStats, trendingTags } from '../../utils/mockLibrary';
import type { Document } from '../../utils/types/library';

export function LibraryPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('all');

  const handleUpload = () => {
    console.log('Upload document');
  };

  const handleHistory = () => {
    console.log('View history');
  };

  const handleShare = () => {
    console.log('Share document');
  };

  const handleViewDocument = (doc: Document) => {
    console.log('View document:', doc);
    navigate(`/admin/library/${doc.id}`);
  };

  const handleDownloadDocument = (doc: Document) => {
    console.log('Download document:', doc);
  };

  const handleUpgrade = () => {
    console.log('Upgrade storage');
  };

  const handleViewAllActivities = () => {
    console.log('View all activities');
  };

  const handleTagClick = (tag: string) => {
    console.log('Tag clicked:', tag);
    setSearchQuery(tag);
  };

  const tabs = [
    { id: 'all', label: 'Tất cả tài liệu' },
    { id: 'pinned', label: 'Đã ghim', count: 12 },
    { id: 'shared', label: 'Được chia sẻ' },
    { id: 'mine', label: 'Của tôi' },
    { id: 'drafts', label: 'Bản nháp' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-[1600px] mx-auto px-8 py-10">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-10">
            <LibraryHeader
              onUpload={handleUpload}
              onHistory={handleHistory}
              onShare={handleShare}
            />

            <AIBanner />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ActivityChart />
              <FormatStats formats={formatStats} total={1240} />
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
              <nav className="flex gap-8 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-4 text-sm font-bold whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'text-purple-600 border-b-2 border-purple-600'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab.label}
                    {tab.count && (
                      <span className="ml-2 px-1.5 py-0.5 bg-slate-100 text-[10px] rounded-md">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200/60 shadow-sm flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-purple-600/10 transition-all text-sm font-medium placeholder:text-slate-400"
                  placeholder="Tìm kiếm theo tên, tag, tác giả..."
                />
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-bold rounded-xl transition-colors">
                  <Filter className="w-4 h-4" />
                  Lọc
                </button>
                <div className="h-6 w-px bg-slate-200 mx-1"></div>
                <select className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm font-semibold text-slate-600 focus:ring-1 focus:ring-purple-600/20 cursor-pointer outline-none">
                  <option>Sắp xếp: Mới nhất</option>
                  <option>Tên (A-Z)</option>
                  <option>Lượt tải</option>
                </select>
                <div className="flex bg-slate-100 p-1 rounded-xl ml-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white shadow-sm text-purple-600'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white shadow-sm text-purple-600'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Document Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onView={handleViewDocument}
                  onDownload={handleDownloadDocument}
                />
              ))}
            </div>

            {/* Load More */}
            <div className="flex justify-center pt-4">
              <button className="px-8 py-3 bg-white border border-slate-200 text-slate-500 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors">
                Xem thêm tài liệu
              </button>
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="hidden xl:block w-[400px] space-y-8 sticky top-24 h-fit">
            <StorageWidget stats={storageStats} onUpgrade={handleUpgrade} />
            <QuickActions />
            <RecentActivities activities={mockActivities} onViewAll={handleViewAllActivities} />
            <TrendingTags tags={trendingTags} onTagClick={handleTagClick} />
          </aside>
        </div>
      </div>

      {/* Mobile FAB */}
      <button className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-30">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}