"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/types_db";

type PromoLinks = Tables<"promo_links">;

interface PromoLinkDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoLink: PromoLinks | null;
  onDeactivate?: (promoLink: PromoLinks) => void;
}

export const PromoLinkDetailsModal: React.FC<
  PromoLinkDetailsModalProps
> = ({ isOpen, onClose, promoLink, onDeactivate }) => {
  if (!promoLink) return null;

  // -------------------------------
  // ⭐ NEW: Analytics state
  // -------------------------------
  const [analytics, setAnalytics] = React.useState<any[]>([]);
  const [summary, setSummary] = React.useState<any>(null);

  // -------------------------------
  // ⭐ NEW: Fetch analytics when modal opens
  // -------------------------------
  React.useEffect(() => {
    if (!promoLink) return;

    const load = async () => {
      const res = await fetch(`/api/promo-links/${promoLink.id}/analytics`);
      const json = await res.json();
      if (json.success) {
        setAnalytics(json.data.analytics || []);
        setSummary(json.data.summary || null);
      }
    };

    load();
  }, [promoLink]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const model = (promoLink as any).models;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="fixed right-0 top-5 h-[90vh] max-h-screen w-full sm:max-w-md p-0 gap-0 rounded-none sm:rounded-l-xl border-l border-[#CFDAF1] overflow-hidden"
        style={{ left: "auto", transform: "none" }}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* HEADER */}
          <DialogHeader className="flex-shrink-0 p-6 pb-0">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Promo link details
            </DialogTitle>
          </DialogHeader>

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-0">
            {/* MODEL */}
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Model:</span>
              <div className="flex items-center gap-2 text-sm text-gray-900">
                {model?.display_picture_url && (
                  <img
                    src={model.display_picture_url}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                )}
                <span>{model?.name || "—"}</span>
              </div>
            </div>

            {/* Promo Name */}
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Promo name:
              </span>
              <span className="text-sm text-gray-900">
                {promoLink.promo_name}
              </span>
            </div>

            {/* Platform */}
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Platform:
              </span>
              <span className="text-sm text-gray-900 capitalize">
                {promoLink.platform || "—"}
              </span>
            </div>

            {/* Short Code */}
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Code:</span>
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {promoLink.short_code || "—"}
              </span>
            </div>

            {/* URL */}
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">URL:</span>
              <a
                href={promoLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm underline max-w-[150px] truncate text-right"
              >
                {promoLink.url}
              </a>
            </div>

            {/* Fans gained */}
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Fans gained:
              </span>
              <span className="text-sm text-gray-900">
                {promoLink.fans_gained}
              </span>
            </div>

            {/* Renewals */}
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Renewals:
              </span>
              <span className="text-sm text-gray-900">
                {promoLink.renewals}
              </span>
            </div>

            {/* Revenue */}
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Revenue from renewals:
              </span>
              <span className="text-sm text-gray-900">
                ${promoLink.revenue_from_renewals?.toFixed(2)}
              </span>
            </div>

            {/* Spend-to-Sub */}
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Spend-to-sub ratio:
              </span>
              <span className="text-sm text-gray-900">
                ${promoLink.spend_to_sub_ratio?.toFixed(2)}
              </span>
            </div>

            {/* ROI */}
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">ROI:</span>
              <span className="text-sm text-gray-900">
                {promoLink.roi && promoLink.roi > 0 ? "+" : ""}
                {promoLink.roi?.toFixed(0)}%
              </span>
            </div>

            {/* Status */}
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <Badge
                status={
                  promoLink.status === "Active" ? "success" : "warning"
                }
                text={promoLink.status as string}
              />
            </div>

            {/* Creation Date */}
            <div className="flex justify-between items-center py-3">
              <span className="text-sm font-medium text-gray-700">
                Created:
              </span>
              <span className="text-sm text-gray-900">
                {formatDate(promoLink.created_at as any)}
              </span>
            </div>

            {/* ---------------------------------- */}
            {/* ⭐ NEW: Summary Section */}
            {/* ---------------------------------- */}
            {summary && (
              <>
                <h3 className="text-lg font-semibold mt-6">Summary</h3>

                <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                  <div className="p-3 bg-gray-100 rounded">
                    <strong>Total Clicks:</strong> {summary.total_clicks}
                  </div>
                  <div className="p-3 bg-gray-100 rounded">
                    <strong>Subs:</strong> {summary.total_conversions}
                  </div>
                  <div className="p-3 bg-gray-100 rounded">
                    <strong>New Fans:</strong> {summary.total_new_fans}
                  </div>
                  <div className="p-3 bg-gray-100 rounded">
                    <strong>Revenue:</strong> ${summary.total_revenue}
                  </div>
                  <div className="p-3 bg-gray-100 rounded">
                    <strong>Avg ROI:</strong> {summary.average_roi?.toFixed(2)}%
                  </div>
                </div>
              </>
            )}

            {/* ---------------------------------- */}
            {/* ⭐ NEW: Daily Breakdown Table */}
            {/* ---------------------------------- */}
            <h3 className="text-lg font-semibold mt-8 mb-2">
              Daily Breakdown
            </h3>

            <div className="max-h-60 overflow-y-auto border rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Clicks</th>
                    <th className="px-4 py-2 text-left">Subs</th>
                    <th className="px-4 py-2 text-left">New Fans</th>
                    <th className="px-4 py-2 text-left">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.map((row: any) => (
                    <tr key={row.date} className="border-t">
                      <td className="px-4 py-2">{row.date}</td>
                      <td className="px-4 py-2">{row.clicks}</td>
                      <td className="px-4 py-2">{row.conversions}</td>
                      <td className="px-4 py-2">{row.new_fans}</td>
                      <td className="px-4 py-2">${row.revenue?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FOOTER */}
          <DialogFooter className="flex-shrink-0 p-6 pt-0 border-gray-200">
            <Button
              onClick={() => onDeactivate?.(promoLink)}
              className="w-full"
              color="alert"
              size="medium"
              variant="solid"
            >
              Deactivate link
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
