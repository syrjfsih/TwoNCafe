import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cryudpypulkelgfexjwi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyeXVkcHlwdWxrZWxnZmV4andpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MzQ3MDQsImV4cCI6MjA2NTIxMDcwNH0.SBPh4L7a2JZ1KGfgawxIGbzDsHEufXjKTH2LQIw9M1A';
export const supabase = createClient(supabaseUrl, supabaseKey);
