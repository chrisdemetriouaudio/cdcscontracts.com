-- CDCS Contracts booking system - initial schema

CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  ref TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
    -- pending | proposed | confirmed | declined | cancelled | expired
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  idempotency_key TEXT UNIQUE,

  req_mode TEXT NOT NULL,            -- 'date' | 'flexible' | 'asap'
  req_start_date TEXT,               -- ISO yyyy-mm-dd, set when req_mode = 'date'
  req_duration TEXT NOT NULL,        -- '1_day' | 'few_days' | '1_week' | 'longer' | 'not_sure'
  req_end_date TEXT,                 -- optional explicit end date
  req_specific_dates TEXT,           -- JSON array of ISO dates, optional
  req_weekends_included INTEGER,     -- 0/1/NULL
  req_start_time TEXT,               -- 'HH:MM' or 'tba'

  site_postcode TEXT NOT NULL,
  site_address TEXT,
  support_type TEXT NOT NULL,        -- carpenter_mate | joinery | refurb | fitout | other
  work_description TEXT NOT NULL,

  contact_name TEXT NOT NULL,
  company_name TEXT,
  contact_email TEXT NOT NULL,
  contact_mobile TEXT NOT NULL,

  site_contact TEXT,
  access_details TEXT,
  tools_ppe_needed TEXT,
  materials_arrangement TEXT,        -- supplied_on_site | collection_requested | discuss
  po_reference TEXT,

  confirmed_start_date TEXT,
  confirmed_end_date TEXT,
  confirmed_start_time TEXT,
  day_rate_pence INTEGER,
  agreed_hours TEXT,
  owner_notes TEXT,

  proposed_start_date TEXT,
  proposed_end_date TEXT,
  proposed_day_rate_pence INTEGER,
  proposed_message TEXT,

  decline_reason TEXT,

  review_token_hash TEXT,
  review_token_expires TEXT,
  accept_token_hash TEXT,
  accept_token_expires TEXT,
  calendar_token_hash TEXT,

  ip_hash TEXT
);

CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(confirmed_start_date, confirmed_end_date);
CREATE INDEX idx_bookings_created ON bookings(created_at);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES bookings(id),
  channel TEXT NOT NULL,             -- email_contractor_ack | email_owner_review | email_contractor_accept
                                      -- email_contractor_confirmed | email_contractor_declined | whatsapp_owner
  status TEXT NOT NULL DEFAULT 'pending', -- pending | sent | failed
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  payload TEXT,                      -- JSON snapshot used to re-send
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_booking ON notifications(booking_id);

CREATE TABLE availability_blocks (
  id TEXT PRIMARY KEY,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  reason TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE admin_sessions (
  token_hash TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE submission_log (
  ip_hash TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_submission_log_ip ON submission_log(ip_hash, created_at);
