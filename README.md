# PaluwagAN — Setup Guide

## Project Structure

```
paluwagan/
├── index.html              ← Login page
├── css/
│   └── style.css           ← Shared styles (all pages use this)
├── js/
│   ├── supabase.js         ← Your Supabase URL & key (edit this first!)
│   ├── auth.js             ← Login, logout, session helpers
│   └── layout.js           ← Shared sidebar & topbar
└── pages/
    ├── dashboard.html      ← Dashboard with live stats
    ├── contributions.html  ← Contribution tracker + record payment
    └── payouts.html        ← Payout rotation & schedule
```

---

## Step 1 — Set Up Supabase

1. Go to https://supabase.com and create a free project
2. Go to **Project Settings → API**
3. Copy your **Project URL** and **anon public key**
4. Open `js/supabase.js` and replace:

```js
const SUPABASE_URL  = 'https://your-project.supabase.co'   // ← paste here
const SUPABASE_ANON = 'your-anon-key-here'                  // ← paste here
```

---

## Step 2 — Create the Database Tables

Go to Supabase → **SQL Editor** and run this:

```sql
-- MEMBER
CREATE TABLE member (
  member_id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name     TEXT NOT NULL,
  contact_number TEXT UNIQUE,
  address       TEXT,
  date_joined   DATE DEFAULT CURRENT_DATE,
  status        TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE'))
);

-- PALUWAGAN GROUP
CREATE TABLE paluwagan_group (
  group_id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_name          TEXT NOT NULL,
  organizer_id        BIGINT REFERENCES member(member_id),
  pot_amount          NUMERIC(12,2),
  contribution_amount NUMERIC(12,2),
  total_members       INT,
  cycle_frequency     TEXT CHECK (cycle_frequency IN ('WEEKLY','MONTHLY')),
  start_date          DATE,
  end_date            DATE,
  status              TEXT DEFAULT 'ONGOING' CHECK (status IN ('ONGOING','COMPLETED','CANCELLED'))
);

-- GROUP MEMBER
CREATE TABLE group_member (
  group_member_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id        BIGINT REFERENCES paluwagan_group(group_id),
  member_id       BIGINT REFERENCES member(member_id),
  payout_order    INT,
  date_joined_group DATE DEFAULT CURRENT_DATE,
  UNIQUE(group_id, payout_order)
);

-- CONTRIBUTION TRANSACTIONS
CREATE TABLE contribution_txn (
  transaction_id  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id        BIGINT REFERENCES paluwagan_group(group_id),
  member_id       BIGINT REFERENCES member(member_id),
  cycle_number    INT,
  amount_paid     NUMERIC(12,2) DEFAULT 0,
  date_paid       DATE,
  payment_method  TEXT CHECK (payment_method IN ('CASH','GCASH','BANK')),
  payment_status  TEXT DEFAULT 'PAID' CHECK (payment_status IN ('PAID','LATE','MISSED')),
  recorded_by     BIGINT
);

-- PAYOUT SCHEDULE
CREATE TABLE payout_schedule (
  payout_id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id        BIGINT REFERENCES paluwagan_group(group_id),
  member_id       BIGINT REFERENCES member(member_id),
  cycle_number    INT,
  scheduled_date  DATE,
  actual_date     DATE,
  amount_released NUMERIC(12,2) DEFAULT 0,
  payout_status   TEXT DEFAULT 'PENDING' CHECK (payout_status IN ('PENDING','RELEASED','OVERDUE'))
);

-- PENALTY
CREATE TABLE penalty (
  penalty_id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  transaction_id  BIGINT REFERENCES contribution_txn(transaction_id),
  member_id       BIGINT REFERENCES member(member_id),
  group_id        BIGINT REFERENCES paluwagan_group(group_id),
  penalty_amount  NUMERIC(10,2),
  reason          TEXT CHECK (reason IN ('LATE','MISSED')),
  date_imposed    DATE DEFAULT CURRENT_DATE,
  penalty_status  TEXT DEFAULT 'UNPAID' CHECK (penalty_status IN ('UNPAID','PAID'))
);

-- SYSTEM USER
CREATE TABLE system_user (
  user_id       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  member_id     BIGINT REFERENCES member(member_id),
  username      TEXT UNIQUE,
  password_hash TEXT,
  role          TEXT DEFAULT 'MEMBER' CHECK (role IN ('ADMIN','ORGANIZER','MEMBER'))
);
```

---

## Step 3 — Add Sample Data (Optional)

```sql
INSERT INTO member (full_name, contact_number, address) VALUES
  ('Maria Santos',   '09171234567', 'Quezon City'),
  ('Juan dela Cruz', '09289876543', 'Caloocan'),
  ('Ana Reyes',      '09351122334', 'Marikina'),
  ('Pedro Lim',      '09064455667', 'Pasig');

INSERT INTO paluwagan_group (group_name, organizer_id, pot_amount, contribution_amount, total_members, cycle_frequency, start_date, status)
VALUES ('Kapitbahay Savers', 1, 4000, 1000, 4, 'MONTHLY', '2024-02-01', 'ONGOING');

INSERT INTO group_member (group_id, member_id, payout_order) VALUES
  (1,1,1),(1,2,2),(1,3,3),(1,4,4);

INSERT INTO payout_schedule (group_id, member_id, cycle_number, scheduled_date, amount_released, payout_status) VALUES
  (1,1,1,'2024-02-01',4000,'RELEASED'),
  (1,2,2,'2024-03-01',4000,'RELEASED'),
  (1,3,3,'2024-04-01',4000,'PENDING'),
  (1,4,4,'2024-05-01',4000,'PENDING');
```

---

## Step 4 — Set Up Supabase Auth

1. Go to Supabase → **Authentication → Users**
2. Click **Add User** and create a test account (e.g. `maria@paluwagan.com` / `password123`)
3. Use those credentials on the login page

---

## Step 5 — Run the Project

Just open `index.html` in your browser — **no server needed** for local development.

For deployment, upload the whole folder to **GitHub Pages** (free).

---

## Pages Summary

| File | What it does |
|------|-------------|
| `index.html` | Login page with Supabase Auth |
| `pages/dashboard.html` | Live stats, recent activity, upcoming payouts |
| `pages/contributions.html` | View, filter, and record contribution payments |
| `pages/payouts.html` | Payout rotation tracker and schedule |
