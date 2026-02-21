import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const data = await searchUsersApi(searchQuery);
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
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
          <h1 className="search-results-title">Search Results</h1>
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
                    src={user.profilePic ? `http://localhost:5000/uploads/${user.profilePic}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`} 
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
