// js/supabase.js
const SUPABASE_URL  = 'https://xmfmxsefqdpxcrkdczwf.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtZm14c2VmcWRweGNya2RjendmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2Njc5NjYsImV4cCI6MjA4OTI0Mzk2Nn0.vfASPprKgGfuLsMH_ZvqAT_WEeYBJh9zRgVEP-tNHhI'

const { createClient } = supabase
const db = createClient(SUPABASE_URL, SUPABASE_ANON)
