-- ============================================================
-- Migration 002: Database sync/cleanup for client "clienA"
-- Aligns portal DB records with the real Google Drive state.
-- ============================================================

SET @clienAUserId = 'user-6a6986c6a312b';

-- 1. Move ownership of folder "landing-page" to clienA
UPDATE folders
SET user_id = @clienAUserId, updated_at = NOW()
WHERE id = 'cf053bab-77ff-4df7-bff8-02906c6df7c7'
  AND provider_folder_id = '1v2tOSsLrU1F4oe1WdAocklEaMPajlWht';

-- 2. Re-point active files that lived under the stale "arwanagaming" folder to "landing-page"
UPDATE files
SET folder_id = 'cf053bab-77ff-4df7-bff8-02906c6df7c7'
WHERE user_id = @clienAUserId
  AND folder_id = 'df9d84cc-b326-4397-81ae-0ff5591a1948'
  AND status = 'active';

-- 3. Soft-delete / remove records that are gone from Google Drive
DELETE FROM folders
WHERE id IN (
    'f7e0726b-31eb-4c33-a152-da50895c2cc3',  -- test1
    '383158f7-9b1f-4184-b046-5708f1fb1c11'   -- test11
);

DELETE FROM folders
WHERE user_id = @clienAUserId AND deleted_at IS NOT NULL;

DELETE FROM files
WHERE user_id = @clienAUserId AND status = 'deleted';
