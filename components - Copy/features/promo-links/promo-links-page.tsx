'use client';

import React, { useState, useEffect } from 'react';
import { NewPromoLinkModal } from './new-promo-link-modal';
import { PromoLinkDetailsModal } from './promo-link-details-modal';
import { PlusIcon, SortArrowsIcon } from '@/components/ui/icons';
import { createClient } from '@/lib/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { PromoLinksDataTable } from './promo-links-listing/promo-data-table';
import { createColumns } from './promo-links-listing/promo-links-columns';
import { Tables } from '@/types_db';

type PromoLinks = Tables<'promo_links'>;

export const PromoLinksPage = () => {
  const [promoUrl, setPromoUrl] = useState('');
  const [showNewPromoModal, setShowNewPromoModal] = useState(false);
  const [promoLinks, setPromoLinks] = useState<PromoLinks[]>([]);
  const [isFetchingStats, setIsFetchingStats] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedPromoLink, setSelectedPromoLink] =
    useState<PromoLinks | null>(null);
  const [showPasteButton, setShowPasteButton] = useState(true);

  // ---------------------------------------
  // 1️⃣ FETCH USER + PROMO LINKS ON LOAD
  // ---------------------------------------
  useEffect(() => {
    const fetchInitial = async () => {
      const supabase = createClient();

      try {
        // Get authenticated user
        const { data: authRes } = await supabase.auth.getUser();
        setUser(authRes.user);

        // Fetch promo links from API
        const res = await fetch('/api/promo-links');
        const json = await res.json();

        if (json.success) {
          setPromoLinks(json.data); // Store list
        }
      } catch (e) {
        console.error('Initial Load Error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitial();
  }, []);

  // ---------------------------------------
  // 2️⃣ PASTE BUTTON
  // ---------------------------------------
  const handlePasteClick = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setPromoUrl(text);
      setShowPasteButton(false);
    } catch (err) {
      console.error('Clipboard error:', err);
    }
  };

  // ---------------------------------------
  // 3️⃣ FETCH STATS - DISABLED FOR NOW
  // ---------------------------------------
  const handleFetchStats = async () => {
    console.warn('Stats fetching will be added later.');
  };

  // ---------------------------------------
  // 4️⃣ TABLE COLUMNS
  // ---------------------------------------
  const columns = createColumns((promoLink: PromoLinks) =>
    setSelectedPromoLink(promoLink)
  );

  if (isLoading) {
    return (
      <div className="space-y-6 min-h-screen p-6 bg-[#FCFCFC]">
        <h1 className="text-2xl font-bold">Promo links</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen p-6 bg-[#FCFCFC]">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Promo links</h1>

        <Button
          color="primary"
          variant="solid"
          size="small"
          onClick={() => setShowNewPromoModal(true)}
          leading
          leadingIcon={<PlusIcon className="w-4 h-4" />}
        >
          New promo link
        </Button>
      </div>

      {/* INPUT */}
      <div className="py-6 rounded-lg">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Promo link
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={promoUrl}
            onChange={(e) => {
              setPromoUrl(e.target.value);
              if (!e.target.value.trim()) setShowPasteButton(true);
            }}
            placeholder="Enter promo link URL"
            className="w-1/2 h-12 px-3 border border-gray-300 rounded-xl"
          />
          {showPasteButton && (
            <Button color="gray" variant="soft" size="small" onClick={handlePasteClick}>
              Paste
            </Button>
          )}
        </div>

        <div className="mt-3">
          <Button
            color="primary"
            variant="soft"
            size="small"
            onClick={handleFetchStats}
            disabled={isFetchingStats || !promoUrl.trim()}
          >
            Fetch Stats
          </Button>
        </div>
      </div>

      {/* TABLE */}
      {promoLinks.length > 0 && (
        <PromoLinksDataTable
          columns={columns}
          data={promoLinks}
          onPromoLinkClick={(promoLink) => setSelectedPromoLink(promoLink)}
        />
      )}

      {/* CREATE MODAL */}
      {showNewPromoModal && (
        <NewPromoLinkModal
          isOpen={showNewPromoModal}
          onClose={() => setShowNewPromoModal(false)}
          onSubmit={async (newLink) => {
            try {
              const res = await fetch('/api/promo-links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLink)
              });
              const json = await res.json();

              if (!res.ok) {
                console.error('Failed to create promo link:', json);
                return;
              }

              // REFRESH LIST
              const refreshed = await fetch('/api/promo-links').then((r) =>
                r.json()
              );
              if (refreshed.success) setPromoLinks(refreshed.data);

              setShowNewPromoModal(false);
            } catch (e) {
              console.error('Create Error:', e);
            }
          }}
        />
      )}

      {/* DETAILS MODAL */}
      <PromoLinkDetailsModal
        isOpen={!!selectedPromoLink}
        onClose={() => setSelectedPromoLink(null)}
        promoLink={selectedPromoLink}
        onDeactivate={(promoLink) => {
          console.log('Deactivate →', promoLink);
        }}
      />
    </div>
  );
};
