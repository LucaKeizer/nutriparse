import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Restaurant,
  AccountCircle,
  Home,
  Assignment,
  Book,
  ExitToApp,
  Person,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
    handleCloseUserMenu();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navigationItems = [
    { text: 'Home', path: '/', icon: <Home /> },
    { text: 'Parse Recipe', path: '/parse', icon: <Assignment />, protected: true },
    { text: 'My Recipes', path: '/recipes', icon: <Book />, protected: true },
  ];

  const userMenuItems = [
    { text: 'Profile', path: '/profile', icon: <Person /> },
    { text: 'Logout', action: handleLogout, icon: <ExitToApp /> },
  ];

  // Mobile Navigation Drawer
  const mobileNavigation = (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={toggleMobileMenu}
      sx={{
        '& .MuiDrawer-paper': {
          width: 250,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div" color="primary">
          NutriParse
        </Typography>
      </Box>
      <Divider />
      <List>
        {navigationItems
          .filter(item => !item.protected || isAuthenticated)
          .map((item) => (
            <ListItem
              key={item.text}
              component={Link}
              to={item.path}
              onClick={toggleMobileMenu}
              sx={{
                color: 'inherit',
                textDecoration: 'none',
                backgroundColor: location.pathname === item.path ? 'action.selected' : 'transparent',
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
      </List>
      {!isAuthenticated && (
        <>
          <Divider />
          <List>
            <ListItem
              component={Link}
              to="/login"
              onClick={toggleMobileMenu}
              sx={{ color: 'inherit', textDecoration: 'none' }}
            >
              <ListItemIcon><AccountCircle /></ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
          </List>
        </>
      )}
    </Drawer>
  );

  return (
    <>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleMobileMenu}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              mr: 4,
            }}
          >
            <Restaurant sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 'bold',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              NutriParse
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
              {navigationItems
                .filter(item => !item.protected || isAuthenticated)
                .map((item) => (
                  <Button
                    key={item.text}
                    component={Link}
                    to={item.path}
                    color="inherit"
                    sx={{
                      backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
            </Box>
          )}

          <Box sx={{ flexGrow: isMobile ? 1 : 0 }} />

          {/* User menu */}
          {isAuthenticated ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isMobile && (
                <Typography variant="body2" sx={{ mr: 1 }}>
                  Welcome, {user?.first_name || user?.username}!
                </Typography>
              )}
              <Tooltip title="Account settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    alt={user?.username}
                    src={user?.profile?.profile_picture || undefined}
                    sx={{ width: 32, height: 32 }}
                  >
                    {user?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {userMenuItems.map((item) => (
                  <MenuItem
                    key={item.text}
                    onClick={item.action ? item.action : () => {
                      navigate(item.path!);
                      handleCloseUserMenu();
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {item.icon}
                      <Typography textAlign="center">{item.text}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          ) : (
            !isMobile && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  component={Link}
                  to="/login"
                  color="inherit"
                  variant="outlined"
                  sx={{
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  color="inherit"
                  variant="contained"
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.3)',
                    },
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            )
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      {mobileNavigation}
    </>
  );
};

export default Header;