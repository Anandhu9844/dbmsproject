# 🌴 My Cherthala - Hidden Gems Guide

A React + Supabase CRUD application for discovering and sharing hidden gems in Cherthala, Kerala. This app allows locals and students to contribute to a community-driven guide of authentic locations like toddy shops, temples, scenic spots, and traditional food places.

## Features

- **Users Management**: Add and manage contributors to the guide
- **Categories**: Organize locations by type (Toddy Shop, Temple, Scenery, etc.)
- **Locations**: Add detailed information about hidden gems with GPS coordinates
- **Reviews**: Rate and review locations with photos and detailed feedback

## Tech Stack

- **Frontend**: React 19 with Vite
- **UI Library**: Chakra UI
- **Database**: Supabase (PostgreSQL)
- **Routing**: React Router Dom
- **Styling**: CSS + Chakra UI components

## Database Schema

### Users Table
- `user_id` (Primary Key)
- `full_name` (VARCHAR(100))
- `email` (VARCHAR(100), Unique)
- `password_hash` (VARCHAR(255))
- `hometown` (VARCHAR(100))
- `join_date` (DATETIME)

### Categories Table
- `category_id` (Primary Key)
- `category_name` (VARCHAR(50), Unique)
- `description` (TEXT)
- `icon_url` (VARCHAR(255))

### Locations Table
- `location_id` (Primary Key)
- `location_name` (VARCHAR(255))
- `description` (TEXT)
- `address` (VARCHAR(255))
- `latitude` (DECIMAL(9,6))
- `longitude` (DECIMAL(9,6))
- `category_id` (Foreign Key)
- `added_by_id` (Foreign Key)
- `date_added` (DATETIME)

### Reviews Table
- `review_id` (Primary Key)
- `location_id` (Foreign Key)
- `user_id` (Foreign Key)
- `rating` (INT, 1-5)
- `review_text` (TEXT)
- `photo_url` (VARCHAR(255))
- `review_date` (DATETIME)

## Setup Instructions

### 1. Environment Setup
1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### 2. Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Create the four tables using the schema above
3. Set up Row Level Security (RLS) policies as needed
4. Get your project URL and anon key from the API settings

### 3. Install and Run
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage

1. **Users**: Start by adding users who will contribute to the guide
2. **Categories**: Create categories like "Toddy Shop", "Temple", "Beach", etc.
3. **Locations**: Add hidden gems with detailed descriptions and GPS coordinates
4. **Reviews**: Let users rate and review locations with photos

## Features Highlights

- **Smart Dropdowns**: Location and Review forms use dropdowns populated from Users and Categories tables
- **GPS Integration**: Click the map icon to open locations in Google Maps
- **Photo Support**: Add photos to reviews via URL
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Changes reflect immediately across the app
- **Toast Notifications**: User-friendly success/error messages

## Contributing

This is a community-driven project. Feel free to add your favorite hidden gems in Cherthala!

## License

MIT License - Feel free to use this for your own local community guides.