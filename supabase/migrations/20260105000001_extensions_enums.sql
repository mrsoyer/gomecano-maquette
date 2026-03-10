-- Session A: Extensions + Enums
-- Project: Gomecano (ymkdslderliwjuipeisz)
-- Created: 2026-01-05

-- ============================================
-- EXTENSIONS PostgreSQL (2)
-- ============================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- ENUMS (22 total)
-- ============================================

-- Auth & Users (2)
CREATE TYPE user_role AS ENUM ('client', 'mechanic', 'admin');
CREATE TYPE account_type AS ENUM ('b2c', 'b2b');

-- Services (2)
CREATE TYPE service_category AS ENUM (
  'entretien', 'freinage', 'pneus', 'distribution',
  'climatisation', 'mecanique', 'electricite',
  'carrosserie', 'diagnostic'
);

CREATE TYPE question_type AS ENUM (
  'text', 'number', 'select', 'radio', 'checkbox',
  'radio-icons', 'tire-dimension', 'tire-brand', 'date'
);

-- Vehicles (1)
CREATE TYPE fuel_type AS ENUM ('essence', 'diesel', 'electrique', 'hybride', 'gpl', 'gnv');

-- Appointments (3)
CREATE TYPE appointment_status AS ENUM (
  'pending', 'confirmed', 'assigned', 'en_route',
  'in_progress', 'completed', 'cancelled', 'no_show'
);

CREATE TYPE modification_type AS ENUM ('reschedule', 'change_service', 'change_address', 'cancel');

CREATE TYPE modification_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- Subscriptions (2)
CREATE TYPE subscription_plan_type AS ENUM ('free', 'premium', 'business', 'starter', 'professional', 'enterprise');

CREATE TYPE subscription_status AS ENUM ('active', 'trial', 'cancelled', 'expired');

-- B2B (3)
CREATE TYPE company_role AS ENUM ('owner', 'admin', 'fleet_manager', 'accountant', 'driver');

CREATE TYPE fleet_vehicle_status AS ENUM ('active', 'maintenance', 'retired');

CREATE TYPE vehicle_category AS ENUM ('utilitaire', 'commercial', 'service', 'direction');

-- Content (3)
CREATE TYPE blog_post_status AS ENUM ('draft', 'published', 'archived');

CREATE TYPE legal_page_type AS ENUM ('cgu', 'cgv', 'privacy', 'cookies', 'mentions');

CREATE TYPE testimonial_type AS ENUM ('b2c', 'b2b', 'mechanic');

-- Recruitment (5)
CREATE TYPE application_status AS ENUM ('new', 'screening', 'interview', 'technical_test', 'offer', 'hired', 'rejected');

CREATE TYPE interview_type AS ENUM ('phone', 'video', 'in_person', 'technical');

CREATE TYPE interview_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');

CREATE TYPE certification_type AS ENUM ('cap', 'bep', 'bts', 'certification', 'habilitation');

CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'expert');

-- Modules (3)
CREATE TYPE chatbot_author AS ENUM ('user', 'bot');

CREATE TYPE presence_status AS ENUM ('online', 'away', 'busy', 'offline');

CREATE TYPE part_quality AS ENUM ('original', 'premium', 'standard');

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to verify: SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname;
-- Expected: 22 enums
