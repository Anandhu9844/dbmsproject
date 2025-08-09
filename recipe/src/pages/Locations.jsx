import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { Trash2, ExternalLink } from "lucide-react";
import "./Locations.css";

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    location_name: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    category_id: "",
    added_by_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { user } = useAuth();

  async function fetchLocations() {
    try {
      const { data, error } = await supabase
        .from("locations")
        .select(`
          *,
          categories(category_name),
          users(full_name)
        `)
        .order("date_added", { ascending: false });
      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      setMessage("Error fetching locations: " + error.message);
    }
  }

  async function fetchDropdownData() {
    try {
      const [categoriesRes, usersRes] = await Promise.all([
        supabase.from("categories").select("category_id, category_name"),
        supabase.from("users").select("id, full_name"),
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (usersRes.error) throw usersRes.error;

      setCategories(categoriesRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      setMessage("Error fetching dropdown data: " + error.message);
    }
  }

  async function addLocation(e) {
    e.preventDefault();
    if (
      !form.location_name ||
      !form.description ||
      !form.category_id
    ) {
      setMessage("Please fill required fields: Name, description, and category are required");
      return;
    }

    setLoading(true);
    try {
      const locationData = {
        ...form,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        category_id: parseInt(form.category_id),
        added_by_id: user.id, // Use current authenticated user
      };

      const { error } = await supabase.from("locations").insert([locationData]);
      if (error) throw error;

      setForm({
        location_name: "",
        description: "",
        address: "",
        latitude: "",
        longitude: "",
        category_id: "",
        added_by_id: "",
      });
      fetchLocations();
      setMessage("Location added successfully!");
    } catch (error) {
      setMessage("Error adding location: " + error.message);
    }
    setLoading(false);
  }

  async function deleteLocation(id) {
    try {
      const { error } = await supabase
        .from("locations")
        .delete()
        .eq("location_id", id);
      if (error) throw error;
      fetchLocations();
      setMessage("Location deleted successfully!");
    } catch (error) {
      setMessage("Error deleting location: " + error.message);
    }
  }

  function openInMaps(lat, lng) {
    if (lat && lng) {
      window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank");
    }
  }

  useEffect(() => {
    fetchLocations();
    fetchDropdownData();
  }, []);

  return (
    <div className="locations-container">
      <h1 className="locations-heading">
        📍 My Cherthala Locations
      </h1>

      {message && (
        <div className={`message-box ${message.includes("Error") ? "message-error" : "message-success"}`}>
          {message}
        </div>
      )}

      {/* Add Location Form */}
      <div className="form-card">
        <div className="card-body">
          <h2 className="form-heading">
            Add New Location
          </h2>
          <form onSubmit={addLocation}>
            <div className="form-container">
              <div className="form-row">
                <input
                  className="form-input"
                  placeholder="Location Name *"
                  value={form.location_name}
                  onChange={(e) =>
                    setForm({ ...form, location_name: e.target.value })
                  }
                />
                <select
                  className="form-select"
                  value={form.category_id}
                  onChange={(e) =>
                    setForm({ ...form, category_id: e.target.value })
                  }
                >
                  <option value="">Select Category *</option>
                  {categories.map((cat) => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>

              </div>

              <textarea
                className="form-textarea"
                placeholder="Description - why is this place special? *"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <input
                className="form-input"
                placeholder="Address or nearest landmark"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />

              <div className="form-row">
                <input
                  className="form-input"
                  placeholder="Latitude (optional)"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) =>
                    setForm({ ...form, latitude: e.target.value })
                  }
                />
                <input
                  className="form-input"
                  placeholder="Longitude (optional)"
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) =>
                    setForm({ ...form, longitude: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Location"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Locations List */}
      <div className="locations-grid">
        {locations.map((location) => (
          <div key={location.location_id} className="location-card">
            <div className="card-body">
              <div className="location-header">
                <div className="location-content">
                  <div className="location-title-row">
                    <span className="location-name">
                      {location.location_name}
                    </span>
                    {location.latitude && location.longitude && (
                      <button
                        className="maps-button"
                        onClick={() =>
                          openInMaps(location.latitude, location.longitude)
                        }
                        aria-label="Open in maps"
                      >
                        <ExternalLink size={16} />
                      </button>
                    )}
                  </div>
                  <div className="badges-row">
                    <div className="badge badge-blue">
                      {location.categories?.category_name}
                    </div>
                    <div className="badge badge-green">
                      Added by {location.users?.full_name}
                    </div>
                  </div>
                  <p className="location-description">
                    {location.description}
                  </p>
                  {location.address && (
                    <div className="location-address">
                      📍 {location.address}
                    </div>
                  )}
                  <div className="location-date">
                    Added: {new Date(location.date_added).toLocaleDateString()}
                  </div>
                </div>
                <button
                  className="delete-button"
                  onClick={() => deleteLocation(location.location_id)}
                  aria-label="Delete location"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {locations.length === 0 && (
        <p className="empty-state">
          No locations found. Add the first hidden gem above!
        </p>
      )}
    </div>
  );
}
