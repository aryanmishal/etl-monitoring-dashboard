import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getProfile } from '../api';

export default function Navbar({ setToken }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const profileMenuRef = useRef(null);
    const profileDropdownRef = useRef(null); // NEW

    const isActive = (path) => {
        return location.pathname === path;
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        navigate('/login');
    };

    // Fetch user profile on component mount
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const profile = await getProfile();
                setUserProfile(profile);
                console.log('Fetched user profile:', profile); // DEBUG
            } catch (error) {
                console.error('Error fetching user profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    // Close profile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const menuBtn = profileMenuRef.current;
            const dropdown = profileDropdownRef.current;
            if (
                menuBtn && !menuBtn.contains(event.target) &&
                dropdown && !dropdown.contains(event.target)
            ) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (userProfile) {
            console.log('userProfile state updated:', userProfile); // DEBUG
        }
    }, [userProfile]);

    const toggleProfileMenu = () => {
        setShowProfileMenu(!showProfileMenu);
    };

    const navStyle = {
        backgroundColor: '#1a1a1a',
        padding: '2rem 0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    };

    const linkStyle = {
        color: '#ffffff',
        textDecoration: 'none',
        padding: '1rem 1.2rem',
        margin: '0 0.5rem',
        fontSize: '1.1rem',
        fontWeight: '700',
        transition: 'all 0.3s ease',
        borderRadius: '8px'
    };

    const activeStyle = {
        backgroundColor: '#374151',
        color: '#ffffff',
        borderRadius: '8px'
    };

    const hoverStyle = {
        backgroundColor: '#374151',
        color: '#ffffff',
        borderRadius: '8px'
    };

    return (
        <>
            <style>
                {`
                    .profile-menu-item {
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .profile-menu-item::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                        transition: left 0.5s ease;
                    }
                    
                    .profile-menu-item:hover::before {
                        left: 100%;
                    }
                    
                    .profile-menu-item:hover {
                        background-color: #f1f5f9 !important;
                        transform: translateX(4px);
                    }
                    
                    .profile-menu-item.logout-item:hover {
                        background-color: #fef2f2 !important;
                        transform: translateX(4px);
                    }
                    
                    .profile-menu-item:active {
                        transform: translateX(2px) scale(0.98);
                    }
                    
                    .profile-menu-item svg {
                        transition: transform 0.2s ease;
                    }
                    
                    .profile-menu-item:hover svg {
                        transform: scale(1.1);
                    }

                    /* Tab button hover effects - matching profile button style */
                    .nav-tab {
                        transition: background-color 0.3s cubic-bezier(.4,2,.6,1), color 0.3s cubic-bezier(.4,2,.6,1), box-shadow 0.3s cubic-bezier(.4,2,.6,1);
                        position: relative;
                        overflow: hidden;
                    }
                    .nav-tab .tab-underline {
                        position: absolute;
                        left: 0; right: 0; bottom: 0;
                        height: 3px;
                        background: #fbbf24;
                        border-radius: 2px 2px 0 0;
                        transform: scaleX(0);
                        transition: transform 0.35s cubic-bezier(.4,2,.6,1);
                        z-index: 2;
                    }
                    .nav-tab.active .tab-underline {
                        transform: scaleX(1);
                    }
                    .nav-tab.active {
                        background-color: #374151;
                        color: #fff;
                        box-shadow: 0 2px 8px 0 rgba(55,65,81,0.10);
                    }
                    .nav-tab.active:hover {
                        background-color: #374151 !important;
                    }
                    .nav-tab:hover {
                        background-color: rgba(255,255,255,0.08) !important;
                    }
                `}
            </style>
            <nav style={{ ...navStyle, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 1rem', position: 'relative' }}>
                {/* Left side - Logo and Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#374151',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '1.5rem',
                        fontWeight: 'bold'
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '0.25rem'
                    }}>
                        <span style={{
                            color: '#ffffff',
                            fontSize: '1.375rem',
                            fontWeight: '700',
                            letterSpacing: '0.025em',
                            lineHeight: '1'
                        }}>
                            ETL Monitoring
                        </span>
                        <span style={{
                            color: '#fbbf24',
                            fontSize: '1rem',
                            fontWeight: '600',
                            letterSpacing: '0.025em',
                            lineHeight: '1',
                            opacity: '0.95'
                        }}>
                            Dashboard
                        </span>
                    </div>
                </div>

                {/* Center navigation links - absolutely positioned */}
                <div style={{ 
                    position: 'absolute', 
                    left: '50%', 
                    top: '50%', 
                    transform: 'translate(-50%, -50%)',
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center' 
                }}>
                    <Link
                        to="/"
                        className={`nav-tab ${isActive('/') ? 'active' : ''}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: isActive('/') ? '#374151' : '#23272f',
                            border: isActive('/') ? '1.5px solid #6b7280' : 'none',
                            padding: '0.65rem 1.5rem',
                            borderRadius: '999px',
                            cursor: 'pointer',
                            transition: 'box-shadow 0.22s cubic-bezier(.4,2,.6,1)',
                            outline: 'none',
                            boxShadow: isActive('/') ? '0 4px 16px 0 rgba(55,65,81,0.18)' : '0 2px 8px 0 rgba(55,65,81,0.10)',
                            fontWeight: 800,
                            fontSize: '1.05rem',
                            color: '#fff',
                            margin: '0 0.4rem',
                            letterSpacing: '0.04em',
                            textShadow: '0 1px 4px rgba(30,64,175,0.10)'
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.backgroundColor = '#475569';
                            e.currentTarget.style.boxShadow = '0 4px 16px 0 rgba(55,65,81,0.16)';
                            e.currentTarget.style.border = '1.5px solid #6b7280';
                        }}
                        onMouseOut={e => {
                            if (!isActive('/')) {
                                e.currentTarget.style.backgroundColor = '#23272f';
                                e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(55,65,81,0.10)';
                                e.currentTarget.style.border = 'none';
                            }
                        }}
                        onMouseUp={e => e.currentTarget.blur()}
                    >
                        Summary
                    </Link>
                    <Link
                        to="/sync-status"
                        className={`nav-tab ${isActive('/sync-status') ? 'active' : ''}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: isActive('/sync-status') ? '#374151' : '#23272f',
                            border: isActive('/sync-status') ? '1.5px solid #6b7280' : 'none',
                            padding: '0.65rem 1.5rem',
                            borderRadius: '999px',
                            cursor: 'pointer',
                            transition: 'box-shadow 0.22s cubic-bezier(.4,2,.6,1)',
                            outline: 'none',
                            boxShadow: isActive('/sync-status') ? '0 4px 16px 0 rgba(55,65,81,0.18)' : '0 2px 8px 0 rgba(55,65,81,0.10)',
                            fontWeight: 800,
                            fontSize: '1.05rem',
                            color: '#fff',
                            margin: '0 0.4rem',
                            letterSpacing: '0.04em',
                            textShadow: '0 1px 4px rgba(30,64,175,0.10)'
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.backgroundColor = '#475569';
                            e.currentTarget.style.boxShadow = '0 4px 16px 0 rgba(55,65,81,0.16)';
                            e.currentTarget.style.border = '1.5px solid #6b7280';
                        }}
                        onMouseOut={e => {
                            if (!isActive('/sync-status')) {
                                e.currentTarget.style.backgroundColor = '#23272f';
                                e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(55,65,81,0.10)';
                                e.currentTarget.style.border = 'none';
                            }
                        }}
                        onMouseUp={e => e.currentTarget.blur()}
                    >
                        Sync Status
                    </Link>
                    <Link
                        to="/vitals"
                        className={`nav-tab ${isActive('/vitals') ? 'active' : ''}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: isActive('/vitals') ? '#374151' : '#23272f',
                            border: isActive('/vitals') ? '1.5px solid #6b7280' : 'none',
                            padding: '0.65rem 1.5rem',
                            borderRadius: '999px',
                            cursor: 'pointer',
                            transition: 'box-shadow 0.22s cubic-bezier(.4,2,.6,1)',
                            outline: 'none',
                            boxShadow: isActive('/vitals') ? '0 4px 16px 0 rgba(55,65,81,0.18)' : '0 2px 8px 0 rgba(55,65,81,0.10)',
                            fontWeight: 800,
                            fontSize: '1.05rem',
                            color: '#fff',
                            margin: '0 0.4rem',
                            letterSpacing: '0.04em',
                            textShadow: '0 1px 4px rgba(30,64,175,0.10)'
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.backgroundColor = '#475569';
                            e.currentTarget.style.boxShadow = '0 4px 16px 0 rgba(55,65,81,0.16)';
                            e.currentTarget.style.border = '1.5px solid #6b7280';
                        }}
                        onMouseOut={e => {
                            if (!isActive('/vitals')) {
                                e.currentTarget.style.backgroundColor = '#23272f';
                                e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(55,65,81,0.10)';
                                e.currentTarget.style.border = 'none';
                            }
                        }}
                        onMouseUp={e => e.currentTarget.blur()}
                    >
                        Vitals
                    </Link>
                </div>
            </div>
            
            {/* Profile and Logout buttons positioned absolutely in the right corner */}
            <div 
                ref={profileMenuRef}
                style={{ 
                    position: 'absolute', 
                    right: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}
            >
                {/* Profile Menu Button - Now includes nickname and arrow */}
                <button
                    onClick={toggleProfileMenu}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.04)',
                        border: 'none',
                        padding: '0.5rem 1.2rem 0.5rem 1.2rem',
                        borderRadius: '999px',
                        cursor: 'pointer',
                        transition: 'background 0.2s, box-shadow 0.2s',
                        outline: 'none',
                        boxShadow: '0 2px 8px 0 rgba(55,65,81,0.10)'
                    }}
                    onMouseOver={e => {
                        e.currentTarget.style.backgroundColor = 'rgba(251,191,36,0.10)';
                        e.currentTarget.style.boxShadow = '0 4px 16px 0 rgba(251,191,36,0.10)';
                    }}
                    onMouseOut={e => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.boxShadow = '0 2px 8px 0 rgba(55,65,81,0.10)';
                    }}
                    onMouseUp={e => e.currentTarget.blur()}
                >
                    {/* Profile Icon */}
                    <div style={{
                        background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
                        color: '#fff',
                        borderRadius: '50%',
                        padding: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '44px',
                        height: '44px',
                        border: '2.5px solid #fbbf24',
                        boxShadow: '0 2px 8px 0 rgba(251,191,36,0.10)',
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        transition: 'transform 0.18s cubic-bezier(.4,2,.6,1), box-shadow 0.18s cubic-bezier(.4,2,.6,1)',
                        marginRight: '0.85rem',
                        letterSpacing: '0.02em',
                        textShadow: '0 1px 4px rgba(30,64,175,0.10)'
                    }}>
                        {loading ? (
                            <svg 
                                width="24" 
                                height="24" 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                            >
                                <path 
                                    fillRule="evenodd" 
                                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" 
                                    clipRule="evenodd" 
                                />
                            </svg>
                        ) : (
                            <span style={{
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                letterSpacing: '0.02em',
                                textShadow: '0 1px 4px rgba(30,64,175,0.10)'
                            }}>
                                {userProfile && userProfile.full_name ? userProfile.full_name.charAt(0).toUpperCase() : 'U'}
                            </span>
                        )}
                    </div>
                    
                    {/* Nickname */}
                    <span style={{
                        color: '#fff',
                        fontSize: '1.08rem',
                        fontWeight: '700',
                        letterSpacing: '0.03em',
                        marginRight: '0.25rem',
                        textShadow: '0 1px 4px rgba(30,64,175,0.10)',
                        paddingLeft: '0.1rem',
                        paddingRight: '0.2rem',
                        lineHeight: '1.2',
                        whiteSpace: 'nowrap'
                    }}>
                        {loading ? 'Loading...' : (userProfile && userProfile.nickname ? userProfile.nickname : 'User')}
                    </span>
                    
                    {/* Down Arrow */}
                    <svg 
                        width="20" 
                        height="20" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                        style={{
                            color: '#ffffff',
                            transition: 'transform 0.2s ease',
                            transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}
                    >
                        <path 
                            fillRule="evenodd" 
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                            clipRule="evenodd" 
                        />
                    </svg>
                </button>

                {/* Profile Menu Dropdown */}
                {showProfileMenu && createPortal(
                    <div
                        ref={profileDropdownRef} // Attach the ref here
                        style={{
                            position: 'fixed',
                            top: '88px', // Increased to avoid overlap with navbar
                            right: '16px', // Fixed right padding from the edge
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            minWidth: '220px',
                            zIndex: 999999999,
                            overflow: 'hidden'
                        }}
                    >
                        {/* Header with user info */}
                        <div style={{
                            padding: '1rem 1.25rem',
                            backgroundColor: '#f8fafc',
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: '#374151',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontSize: '1rem',
                                fontWeight: '600'
                            }}>
                                {loading ? 'U' : (userProfile && userProfile.full_name ? userProfile.full_name.charAt(0).toUpperCase() : 'U')}
                            </div>
                            <div>
                                <div style={{
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    color: '#1f2937',
                                    marginBottom: '0.125rem'
                                }}>
                                    {loading ? 'Loading...' : (userProfile && userProfile.full_name ? userProfile.full_name : 'User Account')}
                                </div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#6b7280'
                                }}>
                                    {loading ? 'Loading...' : (userProfile && userProfile.username ? userProfile.username : 'user@example.com')}
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div style={{
                            padding: '0.5rem 0'
                        }}>
                            <button
                                onClick={() => {
                                    navigate('/profile');
                                    setShowProfileMenu(false);
                                }}
                                className="profile-menu-item"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1.25rem',
                                    textAlign: 'left',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    fontSize: '0.875rem',
                                    color: '#374151',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseUp={e => e.currentTarget.blur()}
                            >
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                View Profile
                            </button>
                            <button
                                onClick={() => {
                                    navigate('/settings');
                                    setShowProfileMenu(false);
                                }}
                                className="profile-menu-item"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1.25rem',
                                    textAlign: 'left',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    fontSize: '0.875rem',
                                    color: '#374151',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseUp={e => e.currentTarget.blur()}
                            >
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                </svg>
                                Settings
                            </button>
                        </div>

                        {/* Logout Section */}
                        <div style={{
                            borderTop: '1px solid #e2e8f0',
                            padding: '0.5rem 0',
                            backgroundColor: '#fefefe'
                        }}>
                            <button
                                onClick={() => {
                                    setShowProfileMenu(false);
                                    handleLogout();
                                }}
                                className="profile-menu-item logout-item"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1.25rem',
                                    textAlign: 'left',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    fontSize: '0.875rem',
                                    color: '#dc2626',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseUp={e => e.currentTarget.blur()}
                            >
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </nav>
        </>
    );
}
