-- Add new fields to the userdetails table to support Receiver Details Form Expansion
ALTER TABLE sama_ops.userdetails 
ADD COLUMN IF NOT EXISTS purpose_of_usage TEXT,
ADD COLUMN IF NOT EXISTS how_to_use TEXT,
ADD COLUMN IF NOT EXISTS expected_impact TEXT,
ADD COLUMN IF NOT EXISTS additional_info TEXT;
