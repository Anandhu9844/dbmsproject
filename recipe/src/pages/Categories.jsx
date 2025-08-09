import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { Trash2 } from "lucide-react";
import "./Categories.css";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    category_name: "",
    description: "",
    icon_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function fetchCategories() {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Categories fetch timeout')), 5000)
      );
      
      const queryPromise = supabase
        .from("categories")
        .select("category_id, category_name, description, icon_url")
        .order("category_name");
      
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Categories fetch error:', error);
      setMessage("Error fetching categories: " + error.message);
      setCategories([]); // Set empty array to avoid blocking UI
    }
  }

  async function addCategory(e) {
    e.preventDefault();
    if (!form.category_name) {
      setMessage("Category name is required");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("categories").insert([form]);
      if (error) throw error;

      setForm({ category_name: "", description: "", icon_url: "" });
      fetchCategories();
      setMessage("Category added successfully!");
    } catch (error) {
      setMessage("Error adding category: " + error.message);
    }
    setLoading(false);
  }

  async function deleteCategory(id) {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("category_id", id);
      if (error) throw error;
      fetchCategories();
      setMessage("Category deleted successfully!");
    } catch (error) {
      setMessage("Error deleting category: " + error.message);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="categories-container">
      <h1 className="categories-heading">
        🏷️ Location Categories
      </h1>

      {message && (
        <div className={`message-box ${message.includes("Error") ? "message-error" : "message-success"}`}>
          {message}
        </div>
      )}

      {/* Add Category Form */}
      <div className="form-card">
        <div className="card-body">
          <h2 className="form-heading">
            Add New Category
          </h2>
          <form onSubmit={addCategory}>
            <div className="form-container">
              <div className="form-row">
                <input
                  className="form-input"
                  placeholder="Category Name (e.g., Toddy Shop, Temple)"
                  value={form.category_name}
                  onChange={(e) =>
                    setForm({ ...form, category_name: e.target.value })
                  }
                />
                <input
                  className="form-input"
                  placeholder="Icon URL (optional)"
                  value={form.icon_url}
                  onChange={(e) =>
                    setForm({ ...form, icon_url: e.target.value })
                  }
                />
              </div>
              <textarea
                className="form-textarea"
                placeholder="Description of this category..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Category"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Categories List */}
      <div className="categories-grid">
        {categories.map((category) => (
          <div key={category.category_id} className="category-card">
            <div className="card-body">
              <div className="category-header">
                <div className="category-title-section">
                  {category.icon_url && (
                    <img
                      src={category.icon_url}
                      alt={category.category_name}
                      className="category-icon"
                    />
                  )}
                  <span className="category-title">
                    {category.category_name}
                  </span>
                </div>
                <button
                  className="delete-button"
                  onClick={() => deleteCategory(category.category_id)}
                  aria-label="Delete category"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              {category.description && (
                <p className="category-description">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <p className="empty-state">
          No categories found. Add the first category above!
        </p>
      )}
    </div>
  );
}