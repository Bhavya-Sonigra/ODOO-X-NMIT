import React, { useState, useEffect } from 'react';
import ApiService from '../../services/apiService';
import './favoriteSellers.css';

const FavoriteSellers = () => {
    const [favorites, setFavorites] = useState({ favoriteUsers: [] });
    const [loading, setLoading] = useState(true);
    const [editingNotes, setEditingNotes] = useState(null);
    const [notes, setNotes] = useState('');

    // Get authentication token
    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    // Fetch favorite sellers
    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            const response = await fetch(ApiService.favoriteSellers.getFavorites(), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setFavorites(data.favorites || { favoriteUsers: [] });
            } else {
                console.error('Failed to fetch favorite sellers');
            }
        } catch (error) {
            console.error('Error fetching favorite sellers:', error);
        } finally {
            setLoading(false);
        }
    };

    // Remove favorite seller
    const removeFavorite = async (sellerId) => {
        if (!window.confirm('Are you sure you want to remove this seller from favorites?')) {
            return;
        }

        try {
            const token = getAuthToken();
            const response = await fetch(ApiService.favoriteSellers.removeFavorite(sellerId), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setFavorites(prev => ({
                    ...prev,
                    favoriteUsers: prev.favoriteUsers.filter(fav => fav.sellerId !== sellerId)
                }));
                alert('Seller removed from favorites!');
            } else {
                alert('Failed to remove seller from favorites');
            }
        } catch (error) {
            console.error('Error removing favorite seller:', error);
            alert('Error removing favorite seller');
        }
    };

    // Update notes
    const updateNotes = async (sellerId) => {
        try {
            const token = getAuthToken();
            const response = await fetch(ApiService.favoriteSellers.updateNotes(sellerId), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ notes })
            });

            if (response.ok) {
                const data = await response.json();
                setFavorites(prev => ({
                    ...prev,
                    favoriteUsers: prev.favoriteUsers.map(fav => 
                        fav.sellerId === sellerId 
                            ? { ...fav, notes: data.favorite.notes }
                            : fav
                    )
                }));
                setEditingNotes(null);
                setNotes('');
                alert('Notes updated successfully!');
            } else {
                alert('Failed to update notes');
            }
        } catch (error) {
            console.error('Error updating notes:', error);
            alert('Error updating notes');
        }
    };

    // Handle edit notes
    const handleEditNotes = (favorite) => {
        setEditingNotes(favorite.sellerId);
        setNotes(favorite.notes || '');
    };

    // Cancel editing notes
    const handleCancelEdit = () => {
        setEditingNotes(null);
        setNotes('');
    };

    // View seller profile
    const viewSellerProfile = (sellerId) => {
        // Navigate to seller's profile or products
        window.location.href = `/user-profile/${sellerId}`;
    };

    // Contact seller
    const contactSeller = (seller) => {
        // This would typically open a chat or contact form
        alert(`Contact feature for ${seller.sellerDetails?.name || 'this seller'} - Feature coming soon!`);
    };

    useEffect(() => {
        fetchFavorites();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) {
        return (
            <div className="favorite-sellers-container">
                <div className="loading">Loading favorite sellers...</div>
            </div>
        );
    }

    return (
        <div className="favorite-sellers-container">
            <div className="favorite-sellers-header">
                <h1>Favorite Sellers</h1>
                <p className="subtitle">Sellers you've marked as favorites</p>
            </div>

            <div className="favorite-sellers-list">
                {favorites.favoriteUsers.length === 0 ? (
                    <div className="no-favorites">
                        <h3>No favorite sellers yet</h3>
                        <p>When you find great sellers, add them to your favorites to easily find them again.</p>
                    </div>
                ) : (
                    favorites.favoriteUsers.map(favorite => (
                        <div key={favorite.sellerId} className="seller-card">
                            <div className="seller-card-header">
                                <div className="seller-avatar">
                                    <img 
                                        src={favorite.sellerDetails?.avatar || '/default-avatar.png'} 
                                        alt={favorite.sellerDetails?.name || 'Seller'}
                                        onError={(e) => {
                                            e.target.src = '/default-avatar.png';
                                        }}
                                    />
                                </div>
                                <div className="seller-info">
                                    <h3>{favorite.sellerDetails?.name || 'Unknown Seller'}</h3>
                                    {favorite.sellerDetails?.username && (
                                        <p className="username">@{favorite.sellerDetails.username}</p>
                                    )}
                                    <div className="favorite-date">
                                        Added: {new Date(favorite.addedAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="seller-actions">
                                    <button 
                                        className="view-btn"
                                        onClick={() => viewSellerProfile(favorite.sellerId)}
                                        title="View profile"
                                    >
                                        👤
                                    </button>
                                    <button 
                                        className="contact-btn"
                                        onClick={() => contactSeller(favorite)}
                                        title="Contact seller"
                                    >
                                        💬
                                    </button>
                                    <button 
                                        className="remove-btn"
                                        onClick={() => removeFavorite(favorite.sellerId)}
                                        title="Remove from favorites"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            <div className="seller-card-content">
                                <div className="notes-section">
                                    <div className="notes-header">
                                        <h4>Notes</h4>
                                        {editingNotes !== favorite.sellerId && (
                                            <button 
                                                className="edit-notes-btn"
                                                onClick={() => handleEditNotes(favorite)}
                                            >
                                                ✏️
                                            </button>
                                        )}
                                    </div>
                                    
                                    {editingNotes === favorite.sellerId ? (
                                        <div className="notes-edit">
                                            <textarea
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                placeholder="Add your notes about this seller..."
                                                rows="3"
                                            />
                                            <div className="notes-actions">
                                                <button 
                                                    className="save-notes-btn"
                                                    onClick={() => updateNotes(favorite.sellerId)}
                                                >
                                                    Save
                                                </button>
                                                <button 
                                                    className="cancel-notes-btn"
                                                    onClick={handleCancelEdit}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="notes-display">
                                            {favorite.notes ? (
                                                <p>{favorite.notes}</p>
                                            ) : (
                                                <p className="no-notes">No notes added yet. Click edit to add notes.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FavoriteSellers;
