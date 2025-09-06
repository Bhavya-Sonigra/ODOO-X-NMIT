import './styles.css';
import React, { useEffect, useContext, useState, useRef } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { LiaAngleDownSolid } from "react-icons/lia";
import { CiSearch } from "react-icons/ci";
import { IoHomeOutline, IoSettings } from "react-icons/io5";
import { SlLocationPin } from "react-icons/sl";
import { BiMessageRounded, BiUser } from "react-icons/bi";
import { VscAdd } from "react-icons/vsc";
import { GoBell } from "react-icons/go";
import { LuUser2 } from "react-icons/lu";
import { FiShoppingCart } from "react-icons/fi";
import BeatLoader from "react-spinners/BeatLoader";
import { IoClose } from "react-icons/io5";
import logo from '../../assets/icon/e-logo.jpg'
import userIcon from '../../assets/icon/user-icon.png'
import { FaUserCircle } from "react-icons/fa";
import { IoMdHeartEmpty } from "react-icons/io";
import UpdateLocation from '../UpdateLocation/UpdateLocation';
import AuthPopup from '../../auth/authPopup'
import Cart from '../cart/Cart';
import { useSocket } from '../contexts/SocketContext';
import { NotificationContext } from '../contexts/NotificationContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useLocation } from '../contexts/LocationContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { LiaUserEditSolid } from "react-icons/lia";
import { AiOutlineLogout, AiOutlineProduct } from "react-icons/ai";
import { MdOutlineEditLocation } from "react-icons/md";
import { RiApps2AddLine } from "react-icons/ri";
function Header() {
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const menuRef = useRef(null);
    const profileRef = useRef(null);
    const navigate = useNavigate();
    const [isUpdateLocation, setIsUpdateLocation] = useState(false);
    const [isAuthPopup, setAuthPopup] = useState(false);
    const { totalUnseenMsgCount } = useSocket();
    const { unreadCount } = useContext(NotificationContext);
    const { wishlistCount } = useWishlist();
    const { currentLocation } = useLocation();
    const { user, isAuthenticated, setAuthenticated } = useAuth();
    const { itemCount } = useCart();
    const [searchQuery, setSearchQuery] = useState('');


    const handleCanceledPopup = (isCancled) => {
        setIsUpdateLocation(isCancled);

    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) &&
                profileRef.current && !profileRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleProfileClick = () => {
        setMenuOpen(!menuOpen);
    };

    const toggleSearchBar = () => {
        setIsSearchVisible(!isSearchVisible);
    };

    const closeSearchBar = () => {
        setIsSearchVisible(false);
    };




    const logOut = async () => {
        localStorage.removeItem('userData');
        const user = JSON.parse(localStorage.getItem('userData'));
        if (!user) {
            setAuthenticated(false);
            navigate('/sign-in');
        }
    }
    const handleProfileImageError = (event) => {
        event.target.src = userIcon;
    }
    const handleAuthPopup = (closePopup) => {
        setAuthPopup(closePopup);
    }


    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleSearchClick = () => {
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);

        }
    };

    return (
        <div className="h-container">
            <div className='logo-and-location-wrapper'>
                <div className='h-sidebar-item-container h-site-logo' onClick={() => navigate('/')}>
                    <img src={logo} className='h-sidebar-logo' />
                </div>
                {currentLocation ? (
                    <div className='location-container' onClick={() => setIsUpdateLocation(true)}>
                        <div className='main-city-name-container'>
                            <SlLocationPin className='location-icon' />
                            <span className='city-name'>{currentLocation.city}</span>
                            <LiaAngleDownSolid />
                        </div>
                        <div className='full-address-container'>
                            <span className='full-address'>{currentLocation.address}</span>
                        </div>
                    </div>
                ) : (
                    <BeatLoader
                        color="#0066FF"
                        size={7}
                    />
                )}
            </div>
            <div className='header-search-icon' onClick={toggleSearchBar}>
                <CiSearch className='icon search-icon' />
            </div>
            <div className='nav'>
                <div className={`searchbar-container ${isSearchVisible ? 'show' : ''}`}>
                    <div className='searchbar'>
                        <input
                            className='search-input'
                            type='text'
                            placeholder='What do you want to buy?'
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onKeyDown={handleKeyPress}
                        />
                        <CiSearch
                            className='icon search-icon'
                            onClick={handleSearchClick}
                            disabled={!searchQuery.trim()}
                        />
                    </div>
                    <div className='close-search-bar' onClick={closeSearchBar}>
                        <IoClose />
                    </div>
                </div>
               
                {/* Cart Icon */}
                {isAuthenticated && (
                    <div className='cart-icon-container' onClick={() => setShowCart(true)}>
                        <FiShoppingCart className='icon cart-icon' />
                        {itemCount > 0 && (
                            <span className='cart-badge'>{itemCount}</span>
                        )}
                    </div>
                )}

                {/* Wishlist Icon */}
                {isAuthenticated && (
                    <div className='wishlist-icon-container' onClick={() => navigate('/wishlist')}>
                        <IoMdHeartEmpty className='icon wishlist-icon' />
                        {wishlistCount > 0 && (
                            <span className='wishlist-badge'>{wishlistCount}</span>
                        )}
                    </div>
                )}

                {/* Notifications Icon */}
                {isAuthenticated && (
                    <div className='notification-icon-container' onClick={() => navigate('/notifications')}>
                        <GoBell className='icon notification-icon' />
                        {unreadCount > 0 && (
                            <span className='notification-badge'>{unreadCount}</span>
                        )}
                    </div>
                )}
               
                <div>
                    {isAuthenticated ? (
                        <div className="authenticated-user-profile ">
                            <div className="auth-profile" ref={profileRef} onClick={handleProfileClick}>
                                {user && user.profile ? (
                                    <img src={user.profile} alt="User Profile" className='auth-user-profile-img' onError={handleProfileImageError} />
                                ) : (
                                    <FaUserCircle className='user-icon' />
                                )}
                            </div>
                            <div className={`header-side-menu-container ${menuOpen ? 'open' : ''}`} ref={menuRef}>
                                <div className='user-profile-card'>
                                    <div className='menu-profile'>
                                        <img
                                            src={user.profile ? user.profile : userIcon}
                                            onError={handleProfileImageError}
                                            className='auth-user-profile-img'
                                        />
                                        <span className='auth-user-name'>{user.name}</span>
                                    </div>
                                    <span
                                        className='profile-see-all-profile'
                                        onClick={() => {
                                            navigate('/account');
                                            handleProfileClick();
                                        }}>See profile</span>
                                </div>
                                <div className='menu-items-wrapper'>
                                    <div className='menu-item' onClick={() => { navigate('/account'); handleProfileClick(); }}>
                                        <BiUser className='menu-icon' />
                                        <span className='menu-title'>Account</span>
                                    </div>
                                    <div className='menu-item' onClick={() => { navigate('/account/profile'); handleProfileClick(); }}>
                                        <AiOutlineProduct className='menu-icon' />
                                        <span className='menu-title'>My post</span>
                                    </div>
                                    <div className='menu-item' onClick={() => { navigate('/orders'); handleProfileClick(); }}>
                                        <RiApps2AddLine className='menu-icon' />
                                        <span className='menu-title'>My Orders</span>
                                    </div>
                                    <div className='menu-item' onClick={() => { navigate('/saved-searches'); handleProfileClick(); }}>
                                        <CiSearch className='menu-icon' />
                                        <span className='menu-title'>Saved Searches</span>
                                    </div>
                                    <div className='menu-item' onClick={() => { navigate('/favorite-sellers'); handleProfileClick(); }}>
                                        <IoMdHeartEmpty className='menu-icon' />
                                        <span className='menu-title'>Favorite Sellers</span>
                                    </div>
                                    <div className='menu-item' onClick={() => { navigate('/categories'); handleProfileClick(); }}>
                                        <VscAdd className='menu-icon' />
                                        <span className='menu-title'>Browse Categories</span>
                                    </div>
                                    <div className='menu-item' onClick={() => { navigate('/account/edit-profile'); handleProfileClick(); }}>
                                        <LiaUserEditSolid className='menu-icon' />
                                        <span className='menu-title'>Edit profile</span>
                                    </div>
                                    <div className='menu-item' onClick={() => { setIsUpdateLocation(true); handleProfileClick(); }}>
                                        <MdOutlineEditLocation className='menu-icon' />
                                        <span className='menu-title'>Manage address</span>
                                    </div>
                                </div>
                                <div className='menu-item menu-user-logout' onClick={() => { { logOut(); handleProfileClick(); } }}>
                                    <AiOutlineLogout className='menu-icon' />
                                    <span className='menu-title'>Logout</span>
                                </div>

                            </div>

                        </div>
                    ) : (
                        <Link className='user-profile-container' to="/sign-in">
                            <span className='nav-link sign-btn'>Sign In</span>
                        </Link>
                    )}
                </div>
            </div>
            {
                isUpdateLocation && (
                    <div className='p-update-location-wrapper'>
                        <UpdateLocation canceled={handleCanceledPopup} />
                    </div>

                )
            }
            {
                isAuthPopup && (
                    <div className='auth-error-wrapper'>
                        <AuthPopup isClosed={handleAuthPopup} />
                    </div>

                )
            }
            
            {/* Cart Modal */}
            {showCart && <Cart onClose={() => setShowCart(false)} />}


        </div >
    );
}
export default Header;