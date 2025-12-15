-- ============================================================================
-- OF-Assist Database Migrations - Complete
-- ============================================================================
-- All migrations have been applied to Supabase
-- This file serves as a reference for the database schema
-- Date: 2025-01-10
-- ============================================================================

-- Note: All tables, functions, triggers, and storage have been set up
-- This consolidated file is for reference only
-- Individual migrations have been run and are now complete

-- Tables Created:
-- 1. media_items - File uploads with metadata
-- 2. sfs_settings - Per-model SFS preferences  
-- 3. scheduled_sfs - Scheduled shoutout posts
-- 4. sfs_requests - Incoming collaboration requests
-- 5. notifications - User notifications
-- 6. promo_link_analytics - Daily analytics per promo link

-- Models table updated with:
-- - agency_id column for agency-model relationships

-- RPC Functions Created (7 total):
-- 1. get_agency_model_summary(agency_user_id)
-- 2. get_model_performance(model_user_id, start_date, end_date)
-- 3. calculate_smart_match_score(model_id_1, model_id_2)
-- 4. get_unread_notification_count(user_id_param)
-- 5. archive_old_notifications(days_old)
-- 6. get_scheduled_posts_due_soon(minutes_ahead)
-- 7. get_model_statistics(model_user_id)

-- Triggers Created (7 total):
-- 1. Auto-update updated_at timestamps
-- 2. Notify on new SFS requests
-- 3. Notify on smart matches
-- 4. Update promo link totals from analytics
-- 5. Sync model fan counts
-- 6. Notify on SFS request review
-- 7. Auto-create scheduled SFS from approved requests

-- Storage Buckets:
-- 1. media-uploads (100MB, private)
-- 2. profile-pictures (5MB, public)
-- 3. thumbnails (2MB, public)

-- Real-time enabled for:
-- - notifications, sfs_requests, scheduled_sfs, promo_links, models

-- ============================================================================
-- Status: ✅ All migrations applied successfully
-- ============================================================================

