import React, { useState, useEffect } from 'react';
import ApiService from '../../services/apiService';
import './savedSearches.css';

const SavedSearches = () => {
    const [savedSearches, setSavedSearches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingSearch, setEditingSearch] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        query: {
            searchTerm: '',
            category: '',
            location: {
                city: '',
                state: '',
                country: ''
            }
        },
        notificationsEnabled: false
    });

    // Get authentication token
    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    // Fetch saved searches
    const fetchSavedSearches = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            const response = await fetch(ApiService.savedSearches.getSavedSearches(), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSavedSearches(data.savedSearches || []);
            } else {
                console.error('Failed to fetch saved searches');
            }
        } catch (error) {
            console.error('Error fetching saved searches:', error);
        } finally {
            setLoading(false);
        }
    };

    // Create saved search
    const createSavedSearch = async () => {
        if (!formData.name.trim()) {
            alert('Please enter a name for your saved search');
            return;
        }

        try {
            const token = getAuthToken();
            const response = await fetch(ApiService.savedSearches.createSavedSearch(), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                setSavedSearches(prev => [data.savedSearch, ...prev]);
                resetForm();
                setShowCreateForm(false);
                alert('Saved search created successfully!');
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to create saved search');
            }
        } catch (error) {
            console.error('Error creating saved search:', error);
            alert('Error creating saved search');
        }
    };

    // Update saved search
    const updateSavedSearch = async () => {
        if (!formData.name.trim()) {
            alert('Please enter a name for your saved search');
            return;
        }

        try {
            const token = getAuthToken();
            const response = await fetch(ApiService.savedSearches.updateSavedSearch(editingSearch._id), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                setSavedSearches(prev => 
                    prev.map(search => 
                        search._id === editingSearch._id ? data.savedSearch : search
                    )
                );
                resetForm();
                setEditingSearch(null);
                alert('Saved search updated successfully!');
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Failed to update saved search');
            }
        } catch (error) {
            console.error('Error updating saved search:', error);
            alert('Error updating saved search');
        }
    };

    // Delete saved search
    const deleteSavedSearch = async (searchId) => {
        if (!window.confirm('Are you sure you want to delete this saved search?')) {
            return;
        }

        try {
            const token = getAuthToken();
            const response = await fetch(ApiService.savedSearches.deleteSavedSearch(searchId), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setSavedSearches(prev => prev.filter(search => search._id !== searchId));
                alert('Saved search deleted successfully!');
            } else {
                alert('Failed to delete saved search');
            }
        } catch (error) {
            console.error('Error deleting saved search:', error);
            alert('Error deleting saved search');
        }
    };

    // Execute saved search
    const executeSearch = (searchQuery) => {
        // Build search URL based on query parameters
        let searchUrl = '/search?';
        const params = new URLSearchParams();
        
        if (searchQuery.searchTerm) {
            params.append('q', searchQuery.searchTerm);
        }
        if (searchQuery.category) {
            params.append('category', searchQuery.category);
        }
        if (searchQuery.location?.city) {
            params.append('city', searchQuery.location.city);
        }
        
        window.location.href = searchUrl + params.toString();
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            query: {
                searchTerm: '',
                category: '',
                location: {
                    city: '',
                    state: '',
                    country: ''
                }
            },
            notificationsEnabled: false
        });
    };

    // Handle edit
    const handleEdit = (search) => {
        setEditingSearch(search);
        setFormData({
            name: search.name,
            query: search.query,
            notificationsEnabled: search.notificationsEnabled
        });
        setShowCreateForm(true);
    };

    // Handle cancel
    const handleCancel = () => {
        resetForm();
        setShowCreateForm(false);
        setEditingSearch(null);
    };

    useEffect(() => {
        fetchSavedSearches();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) {
        return (
            <div className="saved-searches-container">
                <div className="loading">Loading saved searches...</div>
            </div>
        );
    }

    return (
        <div className="saved-searches-container">
            <div className="saved-searches-header">
                <h1>Saved Searches</h1>
                <button 
                    className="create-btn"
                    onClick={() => setShowCreateForm(true)}
                >
                    + Create New Search
                </button>
            </div>

            {showCreateForm && (
                <div className="search-form-overlay">
                    <div className="search-form-container">
                        <div className="search-form-header">
                            <h2>{editingSearch ? 'Edit Saved Search' : 'Create New Saved Search'}</h2>
                            <button className="close-btn" onClick={handleCancel}>×</button>
                        </div>
                        <div className="search-form">
                            <div className="form-group">
                                <label>Search Name *</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Electronics in Mumbai"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Search Term</label>
                                <input
                                    type="text"
                                    placeholder="What are you looking for?"
                                    value={formData.query.searchTerm}
                                    onChange={(e) => setFormData({
                                        ...formData, 
                                        query: {...formData.query, searchTerm: e.target.value}
                                    })}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    value={formData.query.category}
                                    onChange={(e) => setFormData({
                                        ...formData, 
                                        query: {...formData.query, category: e.target.value}
                                    })}
                                >
                                    <option value="">All Categories</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Fashion">Fashion</option>
                                    <option value="Home & Garden">Home & Garden</option>
                                    <option value="Sports">Sports</option>
                                    <option value="Books">Books</option>
                                    <option value="Vehicles">Vehicles</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>City</label>
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={formData.query.location?.city || ''}
                                        onChange={(e) => setFormData({
                                            ...formData, 
                                            query: {
                                                ...formData.query, 
                                                location: {...formData.query.location, city: e.target.value}
                                            }
                                        })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>State</label>
                                    <input
                                        type="text"
                                        placeholder="State"
                                        value={formData.query.location?.state || ''}
                                        onChange={(e) => setFormData({
                                            ...formData, 
                                            query: {
                                                ...formData.query, 
                                                location: {...formData.query.location, state: e.target.value}
                                            }
                                        })}
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.notificationsEnabled}
                                        onChange={(e) => setFormData({
                                            ...formData, 
                                            notificationsEnabled: e.target.checked
                                        })}
                                    />
                                    Enable notifications for new matches
                                </label>
                            </div>
                            
                            <div className="form-actions">
                                <button className="cancel-btn" onClick={handleCancel}>
                                    Cancel
                                </button>
                                <button 
                                    className="save-btn"
                                    onClick={editingSearch ? updateSavedSearch : createSavedSearch}
                                >
                                    {editingSearch ? 'Update Search' : 'Save Search'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="saved-searches-list">
                {savedSearches.length === 0 ? (
                    <div className="no-searches">
                        <h3>No saved searches yet</h3>
                        <p>Create your first saved search to get notified about new items that match your criteria.</p>
                    </div>
                ) : (
                    savedSearches.map(search => (
                        <div key={search._id} className="search-card">
                            <div className="search-card-header">
                                <h3>{search.name}</h3>
                                <div className="search-actions">
                                    <button 
                                        className="search-btn"
                                        onClick={() => executeSearch(search.query)}
                                        title="Execute search"
                                    >
                                        🔍
                                    </button>
                                    <button 
                                        className="edit-btn"
                                        onClick={() => handleEdit(search)}
                                        title="Edit search"
                                    >
                                        ✏️
                                    </button>
                                    <button 
                                        className="delete-btn"
                                        onClick={() => deleteSavedSearch(search._id)}
                                        title="Delete search"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            <div className="search-card-content">
                                {search.query.searchTerm && (
                                    <div className="search-detail">
                                        <strong>Search Term:</strong> {search.query.searchTerm}
                                    </div>
                                )}
                                {search.query.category && (
                                    <div className="search-detail">
                                        <strong>Category:</strong> {search.query.category}
                                    </div>
                                )}
                                {search.query.location?.city && (
                                    <div className="search-detail">
                                        <strong>Location:</strong> {search.query.location.city}
                                        {search.query.location.state && `, ${search.query.location.state}`}
                                    </div>
                                )}
                                {search.notificationsEnabled && (
                                    <div className="search-detail notifications-enabled">
                                        🔔 Notifications enabled
                                    </div>
                                )}
                            </div>
                            <div className="search-card-footer">
                                <small>Created: {new Date(search.createdAt).toLocaleDateString()}</small>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SavedSearches;
