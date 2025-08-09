import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { Trash2, Star } from "lucide-react";
import "./Reviews.css";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    location_id: "",
    user_id: "",
    rating: "",
    review_text: "",
    photo_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { user } = useAuth();

  async function fetchReviews() {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          locations(location_name),
          users(full_name)
        `)
        .order("review_date", { ascending: false });
      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      setMessage("Error fetching reviews: " + error.message);
    }
  }

  async function fetchDropdownData() {
    try {
      const [locationsRes, usersRes] = await Promise.all([
        supabase.from("locations").select("location_id, location_name"),
        supabase.from("users").select("id, full_name"),
      ]);

      if (locationsRes.error) throw locationsRes.error;
      if (usersRes.error) throw usersRes.error;

      setLocations(locationsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      setMessage("Error fetching dropdown data: " + error.message);
    }
  }

  async function addReview(e) {
    e.preventDefault();
    if (
      !form.location_id ||
      !form.rating ||
      !form.review_text
    ) {
      setMessage("Please fill required fields: Location, rating, and review text are required");
      return;
    }

    setLoading(true);
    try {
      const reviewData = {
        location_id: parseInt(form.location_id),
        user_id: user.id, // Use current authenticated user
        rating: parseInt(form.rating),
        review_text: form.review_text,
        photo_url: form.photo_url || null,
      };

      const { error } = await supabase.from("reviews").insert([reviewData]);
      if (error) throw error;

      setForm({
        location_id: "",
        user_id: "",
        rating: "",
        review_text: "",
        photo_url: "",
      });
      fetchReviews();
      setMessage("Review added successfully!");
    } catch (error) {
      setMessage("Error adding review: " + error.message);
    }
    setLoading(false);
  }

  async function deleteReview(id) {
    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("review_id", id);
      if (error) throw error;
      fetchReviews();
      setMessage("Review deleted successfully!");
    } catch (error) {
      setMessage("Error deleting review: " + error.message);
    }
  }

  function renderStars(rating) {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        fill={i < rating ? "#F6D55C" : "#D1D5DB"}
        color={i < rating ? "#F6D55C" : "#D1D5DB"}
      />
    ));
  }

  useEffect(() => {
    fetchReviews();
    fetchDropdownData();
  }, []);

  return (
    <div className="reviews-container">
      <h1 className="reviews-heading">
        ⭐ Location Reviews
      </h1>

      {message && (
        <div className={`message-box ${message.includes("Error") ? "message-error" : "message-success"}`}>
          {message}
        </div>
      )}

      {/* Add Review Form */}
      <div className="form-card">
        <div className="card-body">
          <h2 className="form-heading">
            Add New Review
          </h2>
          <form onSubmit={addReview}>
            <div className="form-container">
              <div className="form-row">
                <select
                  className="form-select"
                  value={form.location_id}
                  onChange={(e) =>
                    setForm({ ...form, location_id: e.target.value })
                  }
                >
                  <option value="">Select Location *</option>
                  {locations.map((location) => (
                    <option
                      key={location.location_id}
                      value={location.location_id}
                    >
                      {location.location_name}
                    </option>
                  ))}
                </select>

                <select
                  className="form-select"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                >
                  <option value="">Rating *</option>
                  <option value="5">⭐⭐⭐⭐⭐ (5 stars)</option>
                  <option value="4">⭐⭐⭐⭐ (4 stars)</option>
                  <option value="3">⭐⭐⭐ (3 stars)</option>
                  <option value="2">⭐⭐ (2 stars)</option>
                  <option value="1">⭐ (1 star)</option>
                </select>
              </div>

              <textarea
                className="form-textarea"
                placeholder="Write your review... What makes this place special? *"
                value={form.review_text}
                onChange={(e) =>
                  setForm({ ...form, review_text: e.target.value })
                }
              />

              <input
                className="form-input"
                placeholder="Photo URL (optional)"
                value={form.photo_url}
                onChange={(e) =>
                  setForm({ ...form, photo_url: e.target.value })
                }
              />

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Review"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Reviews List */}
      <div className="reviews-grid">
        {reviews.map((review) => (
          <div key={review.review_id} className="review-card">
            <div className="card-body">
              <div className="review-header">
                <div className="review-content">
                  <div className="location-rating-row">
                    <span className="location-name">
                      {review.locations?.location_name}
                    </span>
                    <div className="stars-container">{renderStars(review.rating)}</div>
                  </div>
                  <div className="badge badge-blue">
                    Review by {review.users?.full_name}
                  </div>
                  <p className="review-text">
                    {review.review_text}
                  </p>
                  {review.photo_url && (
                    <img
                      src={review.photo_url}
                      alt="Review photo"
                      className="review-photo"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  )}
                  {review.photo_url && (
                    <div className="photo-fallback" style={{display: 'none'}}>
                      Image failed to load
                    </div>
                  )}
                  <div className="review-date">
                    Reviewed: {new Date(review.review_date).toLocaleDateString()}
                  </div>
                </div>
                <button
                  className="delete-button"
                  onClick={() => deleteReview(review.review_id)}
                  aria-label="Delete review"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
        <p className="empty-state">
          No reviews found. Add the first review above!
        </p>
      )}
    </div>
  );
}
