import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { searchUsersApi } from '../services/searchService';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(query);

  const isAdminAccount = (user) => {
    if (!user) return false;
    const role = (user.role || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    const fullName = (user.fullName || user.name || "").toLowerCase();
    const username = (user.username || "").toLowerCase();
    return (
      role === "admin" ||
      email === "rajyadavproject@gmail.com" ||
      fullName.includes("system admin") ||
      username === "admin"
    );
  };

  useEffect(() => {
    performSearch(query);
  }, [query]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    console.log("SEARCH: Initiating search for:", searchQuery);
    try {
      const data = await searchUsersApi(searchQuery);
      console.log("SEARCH: Results received:", data.length);
      setResults(data);
    } catch (error) {
      console.error("SEARCH: Failed:", error);
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search-results?query=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="page-container">
       <div className="profile-bg-wrapper">
        {/* Background */}
        <div className="profile-bg-blob-1" />
        <div className="profile-bg-blob-2" />
      </div>

      <div className="search-page-container relative z-10">
        <div className="search-header-simple">
          <div className="flex justify-between items-center mb-6">
            <h1 className="search-results-title mb-0">Search Results</h1>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition-all font-medium flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Go to Dashboard
            </button>
          </div>
          <p className="search-results-count">
            {loading ? 'Searching...' : `Found ${results.length} result(s) for "${query}"`}
          </p>

          <form onSubmit={handleSearchSubmit} className="search-bar-large">
            <input 
              type="text" 
              className="search-input-large"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users or skills..."
            />
            <button type="submit" className="search-btn-large">Search</button>
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="results-grid-users">
            {results
              .filter((user) => !isAdminAccount(user))
              .map((user) => (
              <div key={user._id} className="user-result-card">
                <div className="user-card-header">
                  <img 
                    src={user.profilePic ? `${import.meta.env.VITE_API_URL}/uploads/${user.profilePic}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`} 
                    alt={user.fullName} 
                    className="user-card-avatar"
                  />
                  <div className="user-card-info">
                    <h3 className="user-card-name">{user.fullName}</h3>
                    <p className="user-card-username">@{user.username}</p>
                  </div>
                </div>

                <div className="user-skills-section">
                  <p className="user-skills-label">Teaches:</p>
                  <div className="user-skills-tags">
                    {user.skillsToTeach && user.skillsToTeach.length > 0 ? (
                      user.skillsToTeach.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="skill-tag-teach">{skill.name}</span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">No skills listed</span>
                    )}
                    {user.skillsToTeach && user.skillsToTeach.length > 3 && (
                      <span className="text-xs text-gray-400">+{user.skillsToTeach.length - 3} more</span>
                    )}
                  </div>
                </div>

                <div className="user-skills-section">
                  <p className="user-skills-label">Learning:</p>
                  <div className="user-skills-tags">
                    {user.skillsToLearn && user.skillsToLearn.length > 0 ? (
                      user.skillsToLearn.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="skill-tag-learn">{skill.name}</span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">No skills listed</span>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/user/${user._id}`)}
                  className="view-profile-btn"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && results.length === 0 && query && (
          <div className="noResults">
            <p className="text-lg font-medium">No users found.</p>
            <p className="text-sm mt-2">Try different keywords.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
