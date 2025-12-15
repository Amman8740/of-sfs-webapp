'use client';

import { useState } from 'react';
import { ProxiedImage } from '@/components/ui/proxied-image';
import { getProxiedImageUrl } from '@/lib/utils/image-proxy';

interface OnlyFansProfile {
  id: string;
  username: string;
  profile_image_url: string;
  cover_image_url: string;
  display_name: string;
  bio?: string;
}

/**
 * Complete example showing how to display OnlyFans images using weserv.nl proxy
 * This demonstrates the proxy functionality without requiring a specific Supabase table
 */
export default function SupabaseImageExample() {
  // Sample data - in real app, this would come from Supabase
  const [profiles, setProfiles] = useState<OnlyFansProfile[]>([
    {
      id: '1',
      username: 'example_creator',
      display_name: 'Example Creator',
      profile_image_url: 'https://thumbs.onlyfans.com/public/files/thumbs/c144/p/pf/pfg/pfgxqheeqydup6tojsxvcoc4punrdfpt1609967190/avatar.jpg',
      cover_image_url: 'https://public.onlyfans.com/files/s/sz/szs/szs3ij5cbrdj6w4dkqy875ibjqzoh47p1706040628/392983124/header.jpg',
      bio: 'This is a sample OnlyFans creator profile'
    }
  ]);

  const addSampleProfile = () => {
    const newProfile: OnlyFansProfile = {
      id: Date.now().toString(),
      username: `creator_${Date.now()}`,
      display_name: 'New Creator',
      profile_image_url: 'https://thumbs.onlyfans.com/public/files/thumbs/c144/p/pf/pfg/pfgxqheeqydup6tojsxvcoc4punrdfpt1609967190/avatar.jpg',
      cover_image_url: 'https://public.onlyfans.com/files/s/sz/szs/szs3ij5cbrdj6w4dkqy875ibjqzoh47p1706040628/392983124/header.jpg',
      bio: 'Another sample profile'
    };

    setProfiles(prev => [newProfile, ...prev]);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">OnlyFans Images with weserv.nl Proxy</h1>
        <p className="text-gray-600 mb-4">
          This example shows how to display OnlyFans images using weserv.nl proxy service.
          Images load reliably even when DNS resolution fails for thumbs.onlyfans.com.
        </p>

        <button
          onClick={addSampleProfile}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Sample Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile) => (
          <div key={profile.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Cover Image */}
            {profile.cover_image_url && (
              <div className="relative h-32">
                <ProxiedImage
                  src={profile.cover_image_url}
                  alt={`${profile.display_name} cover`}
                  width={400}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Profile Content */}
            <div className="p-4">
              {/* Profile Image */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <ProxiedImage
                    src={profile.profile_image_url}
                    alt={profile.display_name}
                    width={80}
                    height={80}
                    className="rounded-full border-4 border-white shadow-lg"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{profile.display_name}</h3>
                  <p className="text-gray-500">@{profile.username}</p>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-gray-700 text-sm mb-4">{profile.bio}</p>
              )}

              {/* URLs */}
              <div className="space-y-2 text-xs text-gray-500">
                <div>
                  <strong>Original Profile URL:</strong>
                  <br />
                  <code className="bg-gray-100 px-1 py-0.5 rounded text-xs break-all">
                    {profile.profile_image_url}
                  </code>
                </div>
                <div>
                  <strong>Proxied Profile URL:</strong>
                  <br />
                  <code className="bg-gray-100 px-1 py-0.5 rounded text-xs break-all">
                    {getProxiedImageUrl(profile.profile_image_url)}
                  </code>
                </div>
                {profile.cover_image_url && (
                  <>
                    <div>
                      <strong>Original Cover URL:</strong>
                      <br />
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-xs break-all">
                        {profile.cover_image_url}
                      </code>
                    </div>
                    <div>
                      <strong>Proxied Cover URL:</strong>
                      <br />
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-xs break-all">
                        {getProxiedImageUrl(profile.cover_image_url)}
                      </code>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Usage Instructions */}
      <div className="mt-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">How to Use</h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">1. Store URLs in Supabase</h3>
            <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-sm">
{`// Create table
CREATE TABLE onlyfans_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT,
  display_name TEXT,
  profile_image_url TEXT,
  cover_image_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

// Insert profile with OnlyFans URLs
const { data, error } = await supabase
  .from('onlyfans_profiles')
  .insert({
    username: 'creator_name',
    display_name: 'Creator Name',
    profile_image_url: 'https://thumbs.onlyfans.com/...',
    cover_image_url: 'https://public.onlyfans.com/...',
    bio: 'Creator bio'
  });`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold">2. Fetch and Display</h3>
            <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-sm">
{`// Fetch from Supabase
const { data: profiles } = await supabase
  .from('onlyfans_profiles')
  .select('*');

// Display with proxy
<ProxiedImage
  src={profile.profile_image_url}
  alt={profile.display_name}
  width={200}
  height={200}
  className="rounded-full"
/>`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold">3. Direct URL Conversion</h3>
            <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-sm">
{`import { getProxiedImageUrl } from '@/lib/utils/image-proxy';

// Convert any URL to proxied version
const proxiedUrl = getProxiedImageUrl(
  'https://thumbs.onlyfans.com/path/to/image.jpg',
  { width: 400, height: 400, quality: 85 }
);

// Use in regular img tag
<img src={proxiedUrl} alt="Image" />`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}