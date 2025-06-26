import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar({ setToken }) {
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => {
        return location.pathname === path;
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        navigate('/login');
    };

    const navStyle = {
        backgroundColor: '#1a1a1a',
        padding: '1rem 0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    };

    const linkStyle = {
        color: '#ffffff',
        textDecoration: 'none',
        padding: '1rem 2rem',
        margin: '0 2rem',
        fontSize: '1.1rem',
        fontWeight: '700',
        transition: 'all 0.3s ease'
    };

    const activeStyle = {
        backgroundColor: '#2563eb',
        color: '#ffffff',
        borderRadius: '4px'
    };

    const hoverStyle = {
        backgroundColor: '#374151',
        color: '#ffffff',
        borderRadius: '4px'
    };

    return (
        <nav style={navStyle}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Link
                        to="/"
                        style={{
                            ...linkStyle,
                            ...(isActive('/') ? activeStyle : {}),
                            ':hover': hoverStyle
                        }}
                    >
                        Sync Status
                    </Link>
                    <Link
                        to="/vitals"
                        style={{
                            ...linkStyle,
                            ...(isActive('/vitals') ? activeStyle : {}),
                            ':hover': hoverStyle
                        }}
                    >
                        Vitals
                    </Link>
                    <Link
                        to="/summary"
                        style={{
                            ...linkStyle,
                            ...(isActive('/summary') ? activeStyle : {}),
                            ':hover': hoverStyle
                        }}
                    >
                        Summary
                    </Link>
                    <button
                        onClick={handleLogout}
                        style={{
                            ...linkStyle,
                            backgroundColor: '#e53e3e',
                            color: '#ffffff',
                            borderRadius: '4px',
                            marginLeft: '1rem',
                            padding: '0.75rem 1rem',
                            ':hover': {
                                backgroundColor: '#c53030'
                            }
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}
