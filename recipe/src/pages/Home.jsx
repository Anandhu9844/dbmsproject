import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Star, MapPin, Calendar, User } from 'lucide-react';
import './Home.css';

export default function Home() {
  const [recentLocations, setRecentLocations] = useState([]);
  const [topReviews, setTopReviews] = useState([]);
  const [stats, setStats] = useState({
    totalLocations: 0,
    totalReviews: 0,
    totalUsers: 0,
    totalCategories: 0
  });
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      // Create timeout for all queries
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Home data fetch timeout')), 8000)
      );

      // Fetch all data in parallel with optimized queries
      const dataPromise = Promise.all([
        // Recent locations - only essential fields
        supabase
          .from('locations')
          .select(`
            location_id,
            location_name,
            description,
            address,
            date_added,
            categories(category_name),
            users(full_name, hometown)
          `)
          .order('date_added', { ascending: false })
          .limit(6),

        // Top reviews - only essential fields
        supabase
          .from('reviews')
          .select(`
            review_id,
            rating,
            review_text,
            review_date,
            locations(location_name),
            users(full_name, hometown)
          `)
          .eq('rating', 5)
          .order('review_date', { ascending: false })
          .limit(4),

        // Stats - use count queries
        supabase.from('locations').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('categories').select('*', { count: 'exact', head: true })
      ]);

      const [
        locationsRes, 
        reviewsRes, 
        locationsCount, 
        reviewsCount, 
        usersCount, 
        categoriesCount
      ] = await Promise.race([dataPromise, timeoutPromise]);

      // Handle results
      if (locationsRes.error) console.error('Locations error:', locationsRes.error);
      if (reviewsRes.error) console.error('Reviews error:', reviewsRes.error);

      setRecentLocations(locationsRes.data || []);
      setTopReviews(reviewsRes.data || []);
      setStats({
        totalLocations: locationsCount.count || 0,
        totalReviews: reviewsCount.count || 0,
        totalUsers: usersCount.count || 0,
        totalCategories: categoriesCount.count || 0
      });

    } catch (error) {
      console.error('Error fetching home data:', error);
      // Show empty state rather than blocking
      setRecentLocations([]);
      setTopReviews([]);
      setStats({ totalLocations: 0, totalReviews: 0, totalUsers: 0, totalCategories: 0 });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        fill={i < rating ? "#f59e0b" : "#d1d5db"}
        color={i < rating ? "#f59e0b" : "#d1d5db"}
      />
    ));
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading amazing places...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">🌴 Discover Hidden Gems in Cherthala</h1>
          <p className="hero-subtitle">
            Explore authentic local experiences, from traditional toddy shops to scenic viewpoints, 
            all contributed by our amazing community of locals and travelers.
          </p>
          {user && profile && (
            <div className="welcome-message">
              Welcome back, <strong>{profile.full_name}</strong> from {profile.hometown}! 
              Ready to discover more hidden gems? 🌟
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📍</div>
            <div className="stat-number">{stats.totalLocations}</div>
            <div className="stat-label">Hidden Locations</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-number">{stats.totalReviews}</div>
            <div className="stat-label">Community Reviews</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-number">{stats.totalUsers}</div>
            <div className="stat-label">Local Contributors</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏷️</div>
            <div className="stat-number">{stats.totalCategories}</div>
            <div className="stat-label">Categories</div>
          </div>
        </div>
      </section>

      {/* Recent Locations Section */}
      <section className="content-section">
        <h2 className="section-title">🌟 Recently Added Hidden Gems</h2>
        <div className="locations-grid">
          {recentLocations.map((location) => (
            <div key={location.location_id} className="location-card">
              <div className="location-header">
                <h3 className="location-name">{location.location_name}</h3>
                <div className="location-category">
                  {location.categories?.category_name}
                </div>
              </div>
              <p className="location-description">{location.description}</p>
              {location.address && (
                <div className="location-address">
                  <MapPin size={14} />
                  <span>{location.address}</span>
                </div>
              )}
              <div className="location-footer">
                <div className="contributor-info">
                  <User size={14} />
                  <span>Added by {location.users?.full_name}</span>
                  {location.users?.hometown && (
                    <span className="hometown">from {location.users.hometown}</span>
                  )}
                </div>
                <div className="date-added">
                  <Calendar size={14} />
                  <span>{new Date(location.date_added).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {recentLocations.length === 0 && (
          <div className="empty-state">
            <p>No locations added yet. Be the first to share a hidden gem! 🌟</p>
          </div>
        )}
      </section>

      {/* Top Reviews Section */}
      <section className="content-section">
        <h2 className="section-title">✨ Amazing 5-Star Reviews</h2>
        <div className="reviews-grid">
          {topReviews.map((review) => (
            <div key={review.review_id} className="review-card">
              <div className="review-header">
                <h3 className="review-location">{review.locations?.location_name}</h3>
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>
              </div>
              <p className="review-text">"{review.review_text}"</p>
              <div className="review-footer">
                <div className="reviewer-info">
                  <User size={14} />
                  <span>- {review.users?.full_name}</span>
                  {review.users?.hometown && (
                    <span className="hometown">from {review.users.hometown}</span>
                  )}
                </div>
                <div className="review-date">
                  <Calendar size={14} />
                  <span>{new Date(review.review_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {topReviews.length === 0 && (
          <div className="empty-state">
            <p>No reviews yet. Share your experience and be the first! ⭐</p>
          </div>
        )}
      </section>

      {/* Call to Action */}
      {user && (
        <section className="cta-section">
          <div className="cta-content">
            <h2>Ready to Share Your Discovery? 🚀</h2>
            <p>Help others discover the amazing places you love in Cherthala!</p>
            <div className="cta-buttons">
              <button 
                className="cta-button primary"
                onClick={() => window.location.href = '/locations'}
              >
                Add a Location
              </button>
              <button 
                className="cta-button secondary"
                onClick={() => window.location.href = '/reviews'}
              >
                Write a Review
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
