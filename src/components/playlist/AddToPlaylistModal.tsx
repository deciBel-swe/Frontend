'use client';

import { X } from 'lucide-react';
import AddToPlaylistTab, { type AddToPlaylistTabProps } from '@/components/playlist/AddToPlaylistTab';
import CreatePlaylistTab, { type CreatePlaylistTabProps } from '@/components/playlist/CreatePlaylistTab';

export type ActiveTab = 'add' | 'create';

export type AddToPlaylistModalProps = {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  addTabProps: AddToPlaylistTabProps;
  createTabProps: CreatePlaylistTabProps;
};

export default function AddToPlaylistModal({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  addTabProps,
  createTabProps,
}: AddToPlaylistModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-bg-base border border-interactive-default rounded-lg shadow-[0_16px_48px_rgba(0,0,0,0.7)] w-full max-w-[540px] mx-4 max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 text-text-muted hover:text-text-primary transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex border-b border-interactive-default shrink-0">
          <ModalTab label="Add to playlist" active={activeTab === 'add'} onClick={() => onTabChange('add')} />
          <ModalTab label="Create a playlist" active={activeTab === 'create'} onClick={() => onTabChange('create')} />
        </div>

        <div className="overflow-y-auto flex-1">
          {activeTab === 'add'
            ? <AddToPlaylistTab {...addTabProps} />
            : <CreatePlaylistTab {...createTabProps} />
          }
        </div>
      </div>
    </div>
  );
}

function ModalTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        'relative px-5 py-4 text-[15px] font-extrabold transition-colors duration-150',
        active ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary',
      ].join(' ')}
    >
      {label}
      {active && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-text-primary" />}
    </button>
  );
}