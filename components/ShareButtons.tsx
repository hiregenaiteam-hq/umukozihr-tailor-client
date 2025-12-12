import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { share } from '@/lib/api';
import { 
  Share2, Copy, Check, Linkedin, Mail, 
  MessageCircle, Send, X, ExternalLink, Eye, Lock, Unlock
} from 'lucide-react';

interface ShareLinksData {
  profile_url: string;
  linkedin: string;
  twitter: string;
  whatsapp: string;
  telegram: string;
  email_subject: string;
  email_body: string;
  copy_text: string;
}

interface ShareSettingsData {
  is_public: boolean;
  username: string;
  profile_url: string;
  profile_views: number;
}

interface ShareButtonsProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export default function ShareButtons({ className = '', variant = 'full' }: ShareButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareLinks, setShareLinks] = useState<ShareLinksData | null>(null);
  const [settings, setSettings] = useState<ShareSettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadShareData = async () => {
    setIsLoading(true);
    try {
      const [linksResponse, settingsResponse] = await Promise.all([
        share.getLinks(),
        share.getSettings()
      ]);
      setShareLinks(linksResponse.data);
      setSettings(settingsResponse.data);
    } catch (error: any) {
      console.error('Failed to load share data:', error);
      if (error.response?.status === 404) {
        toast.error('Please complete your profile first');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    loadShareData();
  };

  const handleCopy = async () => {
    if (!shareLinks) return;
    try {
      await navigator.clipboard.writeText(shareLinks.copy_text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const handleTogglePrivacy = async () => {
    if (!settings) return;
    setIsUpdating(true);
    try {
      const response = await share.updateSettings(!settings.is_public);
      setSettings({
        ...settings,
        is_public: response.data.is_public,
        username: response.data.username,
        profile_url: response.data.profile_url
      });
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Failed to update privacy settings');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEmailShare = () => {
    if (!shareLinks) return;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(shareLinks.email_subject)}&body=${encodeURIComponent(shareLinks.email_body)}`;
    window.open(mailtoUrl, '_blank');
  };

  const shareButtons = [
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-[#0A66C2]',
      hoverColor: 'hover:bg-[#004182]',
      onClick: () => shareLinks && window.open(shareLinks.linkedin, '_blank')
    },
    {
      name: 'Twitter',
      icon: X,
      color: 'bg-black',
      hoverColor: 'hover:bg-gray-800',
      onClick: () => shareLinks && window.open(shareLinks.twitter, '_blank')
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366]',
      hoverColor: 'hover:bg-[#128C7E]',
      onClick: () => shareLinks && window.open(shareLinks.whatsapp, '_blank')
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-[#0088CC]',
      hoverColor: 'hover:bg-[#006699]',
      onClick: () => shareLinks && window.open(shareLinks.telegram, '_blank')
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gradient-to-r from-orange-500 to-amber-500',
      hoverColor: 'hover:from-orange-600 hover:to-amber-600',
      onClick: handleEmailShare
    }
  ];

  // Compact version - just a share button
  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={handleOpen}
          className={`btn-secondary flex items-center gap-2 ${className}`}
        >
          <Share2 className="h-4 w-4" />
          Share Profile
        </button>

        {/* Modal */}
        {isOpen && (
          <ShareModal
            shareLinks={shareLinks}
            settings={settings}
            isLoading={isLoading}
            copied={copied}
            isUpdating={isUpdating}
            shareButtons={shareButtons}
            onClose={() => setIsOpen(false)}
            onCopy={handleCopy}
            onTogglePrivacy={handleTogglePrivacy}
          />
        )}
      </>
    );
  }

  // Full version - card with share options
  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="neu-flat w-10 h-10 rounded-lg flex items-center justify-center">
            <Share2 className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Share Your Profile</h3>
            <p className="text-sm text-stone-400">Get discovered by recruiters</p>
          </div>
        </div>
        {settings && (
          <button
            onClick={handleTogglePrivacy}
            disabled={isUpdating}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              settings.is_public 
                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                : 'bg-stone-500/20 text-stone-400 hover:bg-stone-500/30'
            }`}
          >
            {settings.is_public ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            {isUpdating ? 'Updating...' : settings.is_public ? 'Public' : 'Private'}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-orange-500 border-t-transparent rounded-full" />
        </div>
      ) : settings && shareLinks ? (
        <>
          {/* Profile URL */}
          <div className="glass-subtle rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-stone-400 truncate flex-1">
                {settings.profile_url}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={settings.profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-white/5 rounded-lg transition"
                >
                  <ExternalLink className="h-4 w-4 text-stone-400" />
                </a>
                <button
                  onClick={handleCopy}
                  className="p-2 hover:bg-white/5 rounded-lg transition"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-stone-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          {settings.profile_views > 0 && (
            <div className="flex items-center gap-2 text-sm text-stone-400 mb-4">
              <Eye className="h-4 w-4" />
              <span>{settings.profile_views} profile views</span>
            </div>
          )}

          {/* Share Buttons */}
          {settings.is_public && (
            <div className="flex flex-wrap gap-2">
              {shareButtons.map((btn) => (
                <button
                  key={btn.name}
                  onClick={btn.onClick}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition ${btn.color} ${btn.hoverColor}`}
                >
                  <btn.icon className="h-4 w-4" />
                  {btn.name}
                </button>
              ))}
            </div>
          )}

          {!settings.is_public && (
            <p className="text-sm text-stone-500 text-center py-4">
              Make your profile public to share it with others
            </p>
          )}
        </>
      ) : (
        <button
          onClick={loadShareData}
          className="btn-secondary w-full"
        >
          Load Share Options
        </button>
      )}
    </div>
  );
}

// Share Modal Component
interface ShareModalProps {
  shareLinks: ShareLinksData | null;
  settings: ShareSettingsData | null;
  isLoading: boolean;
  copied: boolean;
  isUpdating: boolean;
  shareButtons: Array<{
    name: string;
    icon: React.ElementType;
    color: string;
    hoverColor: string;
    onClick: () => void;
  }>;
  onClose: () => void;
  onCopy: () => void;
  onTogglePrivacy: () => void;
}

function ShareModal({
  shareLinks,
  settings,
  isLoading,
  copied,
  isUpdating,
  shareButtons,
  onClose,
  onCopy,
  onTogglePrivacy
}: ShareModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative glass-card p-6 max-w-md w-full animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Share Your Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition"
          >
            <X className="h-5 w-5 text-stone-400" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full" />
          </div>
        ) : settings && shareLinks ? (
          <>
            {/* Privacy Toggle */}
            <div className="flex items-center justify-between mb-6 p-4 glass-subtle rounded-xl">
              <div>
                <p className="font-medium text-white">Profile Visibility</p>
                <p className="text-sm text-stone-400">
                  {settings.is_public ? 'Anyone can view your profile' : 'Only you can see your profile'}
                </p>
              </div>
              <button
                onClick={onTogglePrivacy}
                disabled={isUpdating}
                className={`relative w-12 h-6 rounded-full transition ${
                  settings.is_public ? 'bg-green-500' : 'bg-stone-600'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                    settings.is_public ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {settings.is_public ? (
              <>
                {/* Profile URL */}
                <div className="mb-6">
                  <label className="text-sm text-stone-400 mb-2 block">Your Profile URL</label>
                  <div className="glass-subtle rounded-lg p-3 flex items-center gap-2">
                    <span className="text-sm text-white truncate flex-1">
                      {settings.profile_url}
                    </span>
                    <button
                      onClick={onCopy}
                      className="btn-icon shrink-0"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Share Buttons Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {shareButtons.map((btn) => (
                    <button
                      key={btn.name}
                      onClick={btn.onClick}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-medium transition ${btn.color} ${btn.hoverColor}`}
                    >
                      <btn.icon className="h-5 w-5" />
                      {btn.name}
                    </button>
                  ))}
                </div>

                {/* Stats */}
                {settings.profile_views > 0 && (
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-sm text-stone-400">
                    <Eye className="h-4 w-4" />
                    <span>{settings.profile_views} people have viewed your profile</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <Lock className="h-12 w-12 text-stone-500 mx-auto mb-4" />
                <p className="text-stone-400">
                  Enable public profile to share with others
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-stone-400">
            Failed to load share options
          </div>
        )}
      </div>
    </div>
  );
}
