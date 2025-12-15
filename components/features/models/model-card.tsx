import React from 'react';

interface Model {
  id: string;
  name: string;
  email: string;
  display_picture_url?: string;
  onlyfans_link?: string;
  telegram_link?: string;
  username?: string;
  price: number;
  fan_count: number;
  payout_percentage: number;
  subscription_type: string;
  status: string;
  language: string;
  timezone: string;
  is_verified: boolean;
  verification_date?: string;
  last_updated: string;
  created_at: string;
}

interface ModelCardProps {
  model: Model;
}

export const ModelCard: React.FC<ModelCardProps> = ({ model }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'free':
        return 'bg-gray-100 text-gray-800';
      case 'trial':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1),0px_1px_3px_0px_rgba(0,0,0,0.1)] hover:shadow-lg transition-shadow">
      {/* Header with Profile Picture and Verification */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {model.display_picture_url ? (
              <img 
                src={model.display_picture_url} 
                alt={model.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{model.name}</h3>
            {model.username && (
              <p className="text-sm text-gray-600">@{model.username}</p>
            )}
          </div>
        </div>
        {model.is_verified && (
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            Verified
          </span>
        )}
      </div>

      {/* Stats Section */}
      <div className="space-y-3 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Price:</span>
            <span className="ml-1 font-medium">${model.price}/mon</span>
          </div>
          <div>
            <span className="text-gray-500">Fans:</span>
            <span className="ml-1 font-medium">{model.fan_count.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-500">Payout:</span>
            <span className="ml-1 font-medium">{model.payout_percentage}%</span>
          </div>
          <div>
            <span className="text-gray-500">Language:</span>
            <span className="ml-1 font-medium">{model.language}</span>
          </div>
        </div>
      </div>

      {/* Status and Subscription Type */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubscriptionTypeColor(model.subscription_type)}`}>
          {model.subscription_type}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(model.status)}`}>
          {model.status}
        </span>
      </div>

      {/* Links */}
      <div className="space-y-2">
        {model.onlyfans_link && (
          <a 
            href={model.onlyfans_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:text-blue-800 truncate"
          >
            OnlyFans: {model.onlyfans_link}
          </a>
        )}
        {model.telegram_link && (
          <a 
            href={model.telegram_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-sm text-blue-600 hover:text-blue-800 truncate"
          >
            Telegram: {model.telegram_link}
          </a>
        )}
      </div>

      {/* Last Updated */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Last updated: {new Date(model.last_updated).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};
