-- Migration: 202609210001_ontological_observation_log.sql
-- Description: Create Ontological Observation Log table with Append-Only public read policy.

CREATE TABLE IF NOT EXISTS public.ontological_observation_log (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    observed_at TEXT NOT NULL,          -- Thời điểm cập nhật (ví dụ: '2026-09-21')
    event_title TEXT NOT NULL,          -- Sự kiện trong thực tại
    content TEXT NOT NULL,              -- Nội dung & Phản ánh bản thể học
    notes TEXT DEFAULT '',              -- Ghi chú / Ngữ cảnh tham chiếu
    is_delayed BOOLEAN DEFAULT FALSE,   -- Trễ (> 7 ngày kể từ khi sự kiện xuất hiện công khai)?
    signature TEXT DEFAULT ''           -- Chữ ký PGP (tùy chọn)
);

-- Enable Row Level Security
ALTER TABLE public.ontological_observation_log ENABLE ROW LEVEL SECURITY;

-- Grant table-level SELECT privilege to anon and authenticated roles
GRANT SELECT ON public.ontological_observation_log TO anon, authenticated;

-- Policy: Allow public read-only access (anon and authenticated)
DROP POLICY IF EXISTS "Allow public read access" ON public.ontological_observation_log;
CREATE POLICY "Allow public read access"
ON public.ontological_observation_log
FOR SELECT
TO anon, authenticated
USING (true);

-- Comment on table and columns for documentation
COMMENT ON TABLE public.ontological_observation_log IS 'Sổ cái quan sát diễn tiến bản thể học Hiện Sinh (Append-Only; chỉ tác giả thao tác qua Supabase Dashboard)';
COMMENT ON COLUMN public.ontological_observation_log.observed_at IS 'Thời điểm cập nhật ghi nhận';
COMMENT ON COLUMN public.ontological_observation_log.event_title IS 'Tên sự kiện / biến cố thực tế';
COMMENT ON COLUMN public.ontological_observation_log.content IS 'Ý kiến chủ quan về sự làm rõ bản thể học';
COMMENT ON COLUMN public.ontological_observation_log.notes IS 'Ghi chú / nguồn thông tin tham chiếu';
COMMENT ON COLUMN public.ontological_observation_log.is_delayed IS 'Đánh dấu nếu cập nhật sau 7 ngày kể từ khi sự kiện xuất hiện công khai';
COMMENT ON COLUMN public.ontological_observation_log.signature IS 'Mã băm chữ ký PGP của tác giả (tùy chọn)';
