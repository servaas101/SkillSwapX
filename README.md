# SkillSwapX - User Identity Management

The foundation for a global talent development ecosystem. This project implements a secure, GDPR-compliant user identity system where users maintain lifetime ownership of their career data.

## Core Features

- User authentication with email/password
- User profile management 
- GDPR-compliant data handling
- Privacy controls and consent management
- Data access and deletion (right to be forgotten)

## Setup

1. Clone this repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL in `supabase/seed.sql` in the Supabase SQL editor
   - Add your Supabase URL and anon key to the `.env` file
5. Start the development server: `npm run dev`

## Technologies Used

- React with TypeScript
- Tailwind CSS for styling
- Supabase for authentication and database
- Zustand for state management
- React Router for navigation

## Database Schema

The foundation uses a minimal database schema with short column names for efficiency:

- **profiles**: User profile information
  - `id`: UUID primary key
  - `uid`: User ID (reference to auth.users)
  - `em`: Email
  - `fn`: First name
  - `ln`: Last name
  - `bio`: Biography
  - `img`: Profile image URL
  - `ph`: Phone
  - `loc`: Location
  - `cdt`: Created date
  - `udt`: Updated date
  - `set`: Settings (JSON)
  - `gdp`: GDPR consent flag
  - `gdl`: GDPR consent date

- **consent_logs**: GDPR compliance logs
  - `id`: UUID primary key
  - `uid`: User ID
  - `typ`: Type of consent action
  - `dat`: JSON data about the consent
  - `ts`: Timestamp
  - `ip`: IP address

## Security

The system implements Row Level Security (RLS) policies to ensure users can only access their own data. Custom functions handle sensitive operations like consent logging and data deletion.