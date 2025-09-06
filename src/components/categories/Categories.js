import React, { useState, useEffect } from 'react';
import ApiService from '../../services/apiService';
import './categories.css';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Get user location
    const getUserLocation = () => {
        const location = localStorage.getItem('userLocation');
        if (location) {
            const { lat, lng } = JSON.parse(location);
            return { lat, lng };
        }
        // Default to a central location if no user location
        return { lat: 28.6139, lng: 77.2090 }; // Delhi coordinates
    };

    // Fetch categories
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await fetch(ApiService.categories.getCategories(true));
            if (response.ok) {
                const data = await response.json();
                setCategories(data.categories || []);
            } else {
                console.error('Failed to fetch categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch products by category
    const fetchCategoryProducts = async (category, page = 1, append = false) => {
        setProductsLoading(true);
        try {
            const { lat, lng } = getUserLocation();
            const response = await fetch(
                ApiService.categories.getCategoryProducts(category, page, 20, lat, lng)
            );

            if (response.ok) {
                const data = await response.json();
                if (append) {
                    setProducts(prev => [...prev, ...(data.products || [])]);
                } else {
                    setProducts(data.products || []);
                }
                setHasMore(data.hasMore || false);
                setCurrentPage(page);
            } else {
                console.error('Failed to fetch category products');
            }
        } catch (error) {
            console.error('Error fetching category products:', error);
        } finally {
            setProductsLoading(false);
        }
    };

    // Handle category selection
    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setCurrentPage(1);
        setHasMore(true);
        fetchCategoryProducts(category.name, 1, false);
    };

    // Load more products
    const loadMoreProducts = () => {
        if (selectedCategory && hasMore && !productsLoading) {
            fetchCategoryProducts(selectedCategory.name, currentPage + 1, true);
        }
    };

    // View product details
    const viewProduct = (productId) => {
        window.location.href = `/product/${productId}`;
    };

    // Go back to categories
    const goBackToCategories = () => {
        setSelectedCategory(null);
        setProducts([]);
    };

    useEffect(() => {
        fetchCategories();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) {
        return (
            <div className="categories-container">
                <div className="loading">Loading categories...</div>
            </div>
        );
    }

    if (selectedCategory) {
        return (
            <div className="categories-container">
                <div className="category-header">
                    <button className="back-btn" onClick={goBackToCategories}>
                        ← Back to Categories
                    </button>
                    <h1>{selectedCategory.name}</h1>
                    <p className="category-count">{selectedCategory.count} items available</p>
                </div>

                {productsLoading && products.length === 0 ? (
                    <div className="loading">Loading products...</div>
                ) : (
                    <>
                        <div className="products-grid">
                            {products.map(product => (
                                <div key={product.productId} className="product-card">
                                    <div className="product-image">
                                        <img 
                                            src={product.images?.[0] || '/default-product.png'} 
                                            alt={product.title}
                                            onError={(e) => {
                                                e.target.src = '/default-product.png';
                                            }}
                                        />
                                        {product.productStatus?.isSold && (
                                            <div className="sold-overlay">SOLD</div>
                                        )}
                                    </div>
                                    <div className="product-details">
                                        <h3>{product.title}</h3>
                                        <p className="product-price">₹{product.price}</p>
                                        <p className="product-location">
                                            {product.location?.city}, {product.location?.state}
                                        </p>
                                        <p className="product-date">
                                            {new Date(product.createDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="product-actions">
                                        <button 
                                            className="view-product-btn"
                                            onClick={() => viewProduct(product.productId)}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {products.length === 0 && !productsLoading && (
                            <div className="no-products">
                                <h3>No products found</h3>
                                <p>No products available in this category at the moment.</p>
                            </div>
                        )}

                        {hasMore && (
                            <div className="load-more-container">
                                <button 
                                    className="load-more-btn"
                                    onClick={loadMoreProducts}
                                    disabled={productsLoading}
                                >
                                    {productsLoading ? 'Loading...' : 'Load More'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="categories-container">
            <div className="categories-header">
                <h1>Browse Categories</h1>
                <p className="subtitle">Find products by category</p>
            </div>

            <div className="categories-grid">
                {categories.map(category => (
                    <div 
                        key={category.name} 
                        className="category-card"
                        onClick={() => handleCategorySelect(category)}
                    >
                        <div className="category-icon">
                            {getCategoryIcon(category.name)}
                        </div>
                        <div className="category-info">
                            <h3>{category.name}</h3>
                            <p className="item-count">{category.count} items</p>
                        </div>
                        <div className="category-arrow">→</div>
                    </div>
                ))}
            </div>

            {categories.length === 0 && (
                <div className="no-categories">
                    <h3>No categories available</h3>
                    <p>Categories will appear here once products are added.</p>
                </div>
            )}
        </div>
    );
};

// Helper function to get category icons
const getCategoryIcon = (categoryName) => {
    const icons = {
        'Electronics': '📱',
        'Fashion': '👕',
        'Home & Garden': '🏠',
        'Sports': '⚽',
        'Books': '📚',
        'Vehicles': '🚗',
        'Others': '📦'
    };
    return icons[categoryName] || '📦';
};

export default Categories;
