'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, UserPlusIcon, GiftIcon } from '@heroicons/react/24/outline';
import ReferralLinkGenerator from './ReferralLinkGenerator';

interface ReferralRequirementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentReferrals: number;
  requiredReferrals: number;
}

export default function ReferralRequirementDialog({
  isOpen,
  onClose,
  userId,
  currentReferrals,
  requiredReferrals
}: ReferralRequirementDialogProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const remainingReferrals = Math.max(0, requiredReferrals - currentReferrals);
  const progress = Math.min((currentReferrals / requiredReferrals) * 100, 100);

  useEffect(() => {
    if (isOpen) {
      fetchReferralStats();
    }
  }, [isOpen]);

  const fetchReferralStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/referrals/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlusIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Referral Requirement
              </h2>
              <p className="text-sm text-gray-500">
                Invite friends to unlock flash transactions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <h3 className="font-semibold text-yellow-800">Transaction Blocked</h3>
            </div>
            <p className="text-yellow-700 text-sm">
              FREE plan users need {requiredReferrals} referrals to access flash transactions. 
              This helps us manage server resources and ensures quality service for all users.
            </p>
          </div>

          {/* Progress Section */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <UserPlusIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-800">Referral Progress</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {currentReferrals}/{requiredReferrals}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${progress}%` }}
                >
                  {progress > 20 && (
                    <span className="text-xs text-white font-medium">
                      {Math.round(progress)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {remainingReferrals > 0 
                    ? `${remainingReferrals} more referrals needed`
                    : "Congratulations! You've met the requirement!"
                  }
                </span>
                {stats && stats.totalCommissionEarned > 0 && (
                  <span className="text-green-600 font-medium">
                    ${stats.totalCommissionEarned} earned
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <GiftIcon className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Your Benefits</h3>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Earn commission on each referral</li>
                <li>• Build passive income stream</li>
                <li>• Help friends join the platform</li>
                <li>• Unlock premium features</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <UserPlusIcon className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Why Required?</h3>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Advanced AI processing power</li>
                <li>• High-performance mining servers</li>
                <li>• Sophisticated blockchain algorithms</li>
                <li>• Premium infrastructure costs</li>
              </ul>
            </div>
          </div>

          {/* Statistics */}
          {stats && !loading && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Your Referral Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.totalReferrals}</div>
                  <div className="text-xs text-gray-500">Total Referrals</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.activeSubscriptionReferrals}</div>
                  <div className="text-xs text-gray-500">Active Subscribers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">${stats.totalCommissionEarned}</div>
                  <div className="text-xs text-gray-500">Commission Earned</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">{remainingReferrals}</div>
                  <div className="text-xs text-gray-500">Still Needed</div>
                </div>
              </div>
            </div>
          )}

          {/* Referral Link Generator */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <UserPlusIcon className="w-5 h-5 text-blue-600" />
              Share Your Referral Link
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <ReferralLinkGenerator userId={userId} />
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-6">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Share your link with friends and family to unlock flash transactions!
              </p>
              <p className="text-xs text-gray-500">
                Each successful signup brings you closer to accessing premium features.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Copy referral link to clipboard
                  if (stats?.referralLink) {
                    navigator.clipboard.writeText(stats.referralLink);
                    // You could add a toast notification here
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Copy Link & Share
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
