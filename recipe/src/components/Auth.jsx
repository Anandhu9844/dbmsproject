import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [hometown, setHometown] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        if (!fullName || !hometown) {
          setMessage('Please fill in all fields');
          setLoading(false);
          return;
        }
        
        // Add timeout to signup
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Signup timeout - please try again')), 10000)
        );
        
        const signupPromise = signUp(email, password, fullName, hometown);
        const { error } = await Promise.race([signupPromise, timeoutPromise]);
        
        if (error) throw error;
        setMessage('Account created! You can now sign in.');
        setIsSignUp(false); // Switch to sign in
      } else {
        // Add timeout to signin
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Sign in timeout - please try again')), 8000)
        );
        
        const signinPromise = signIn(email, password);
        const { error } = await Promise.race([signinPromise, timeoutPromise]);
        
        if (error) throw error;
      }
    } catch (error) {
      setMessage(error.message || 'Something went wrong. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🌴 My Cherthala</h1>
          <p>Discover and share hidden gems in Cherthala</p>
        </div>

        {message && (
          <div className={`auth-message ${message.includes('error') || message.includes('Error') ? 'auth-message-error' : 'auth-message-success'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />
          </div>

          {isSignUp && (
            <>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="auth-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Hometown"
                  value={hometown}
                  onChange={(e) => setHometown(e.target.value)}
                  required
                  className="auth-input"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="auth-toggle">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="auth-toggle-button"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
