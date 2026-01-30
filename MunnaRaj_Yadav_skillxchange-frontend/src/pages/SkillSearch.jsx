import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchSkillsApi } from '../services/skillService';

const SkillSearch = () => {
  const navigate = useNavigate();
  
  // State for search parameters
  const [keyword, setKeyword] = useState('');
  const [level, setLevel] = useState('');
  
  // State for results and loading status
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(null);

  // Handle search submission
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Call the API with current search parameters
      const results = await searchSkillsApi({ keyword, level });
      setSkills(results);
    } catch (err) {
      console.error("Search failed:", err);
      setError("Failed to fetch skills. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get badge color based on level
  const getLevelBadgeClass = (level) => {
    switch(level) {
      case 'Beginner': return 'skillLevelBeginner';
      case 'Intermediate': return 'skillLevelIntermediate';
      case 'Advanced': return 'skillLevelAdvanced';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="page-container">
      {/* Background decoration */}
      <div className="profile-bg-wrapper">
        <div className="profile-bg-blob-1" />
        <div className="profile-bg-blob-2" />
      </div>

      <div className="searchContainer relative z-10">
        {/* Header */}
        <div className="searchHeader">
          <h1 className="searchTitle">Find Skills & Mentors</h1>
          <p className="searchSubtitle">Search for skills you want to learn from our community</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="searchForm">
          <input
            type="text"
            className="searchInput"
            placeholder="What do you want to learn? (e.g. React, Design)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          
          <select 
            className="searchSelect"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <button type="submit" className="searchButton" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-center">
            {error}
          </div>
        )}

        {/* Results Section */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {hasSearched && skills.length === 0 ? (
              <div className="noResults">
                <p className="text-lg font-medium">No skills found matching your criteria.</p>
                <p className="text-sm mt-2">Try adjusting your search terms or filters.</p>
              </div>
            ) : (
              <div className="resultsGrid">
                {skills.map((skill, index) => (
                  <div 
                    key={`${skill.user._id}-${index}`} 
                    className="skillCard"
                    onClick={() => navigate(`/user/${skill.user._id}`)} 
                  >
                    <div className="skillCardHeader">
                      <span className="skillBadge">{skill.category}</span>
                      <span className={`skillLevelBadge ${getLevelBadgeClass(skill.level)}`}>
                        {skill.level}
                      </span>
                    </div>

                    <h3 className="skillName">{skill.skillName}</h3>
                    <p className="skillDescription">
                      {skill.description || "No description provided."}
                    </p>

                    <div className="skillCardFooter">
                      <img 
                        src={skill.user.profilePic ? `http://localhost:5000${skill.user.profilePic}` : "https://via.placeholder.com/40"} 
                        alt={skill.user.fullName} 
                        className="userAvatar"
                      />
                      <div className="userInfo">
                        <span className="userName">{skill.user.fullName}</span>
                        <span className="userBio">{skill.user.bio || "SkillXchange Member"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SkillSearch;
