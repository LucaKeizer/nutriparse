import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  Person,
  Edit,
  Save,
  Cancel,
  Lock,
  Restaurant,
  Favorite,
  Analytics,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/services/api';
import { useMutation } from '@/hooks/useApi';
import { PasswordChangeRequest } from '@/types/api';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    bio: user?.profile?.bio || '',
    dietary_preferences: user?.profile?.dietary_preferences || '',
    email_notifications: user?.profile?.email_notifications || true,
  });

  const [passwordData, setPasswordData] = useState<PasswordChangeRequest>({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [passwordErrors, setPasswordErrors] = useState<Partial<PasswordChangeRequest>>({});

  const updateProfileMutation = useMutation<any, any>(() => 
    Promise.resolve() // Placeholder - you'd implement profile update API
  );

  const changePasswordMutation = useMutation<void, PasswordChangeRequest>(
    authAPI.changePassword
  );

  const handleEditToggle = () => {
    if (editMode) {
      // Reset form if canceling
      setProfileData({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        bio: user?.profile?.bio || '',
        dietary_preferences: user?.profile?.dietary_preferences || '',
        email_notifications: user?.profile?.email_notifications || true,
      });
    }
    setEditMode(!editMode);
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutate(profileData);
      await refreshUser();
      setEditMode(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handlePasswordChange = async () => {
    // Validate passwords
    const errors: Partial<PasswordChangeRequest> = {};
    
    if (!passwordData.old_password) {
      errors.old_password = 'Current password is required';
    }
    
    if (!passwordData.new_password) {
      errors.new_password = 'New password is required';
    } else if (passwordData.new_password.length < 8) {
      errors.new_password = 'Password must be at least 8 characters';
    }
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }

    setPasswordErrors(errors);

    if (Object.keys(errors).length === 0) {
      try {
        await changePasswordMutation.mutate(passwordData);
        setPasswordDialogOpen(false);
        setPasswordData({
          old_password: '',
          new_password: '',
          confirm_password: '',
        });
        setPasswordErrors({});
      } catch (error) {
        console.error('Failed to change password:', error);
      }
    }
  };

  if (!user) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
        Profile Settings
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Manage your account settings and preferences
      </Typography>

      <Grid container spacing={4}>
        {/* Left Column - Profile Information */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                  Personal Information
                </Typography>
                <Button
                  variant={editMode ? 'outlined' : 'contained'}
                  startIcon={editMode ? <Cancel /> : <Edit />}
                  onClick={handleEditToggle}
                  color={editMode ? 'secondary' : 'primary'}
                >
                  {editMode ? 'Cancel' : 'Edit Profile'}
                </Button>
              </Box>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={profileData.first_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={profileData.last_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Bio"
                    multiline
                    rows={3}
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!editMode}
                    placeholder="Tell us about yourself..."
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Dietary Preferences"
                    multiline
                    rows={2}
                    value={profileData.dietary_preferences}
                    onChange={(e) => setProfileData(prev => ({ ...prev, dietary_preferences: e.target.value }))}
                    disabled={!editMode}
                    placeholder="Vegetarian, vegan, gluten-free, etc."
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={profileData.email_notifications}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email_notifications: e.target.checked }))}
                        disabled={!editMode}
                      />
                    }
                    label="Email Notifications"
                  />
                </Grid>
              </Grid>

              {editMode && (
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSaveProfile}
                    disabled={updateProfileMutation.loading}
                  >
                    {updateProfileMutation.loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleEditToggle}
                  >
                    Cancel
                  </Button>
                </Box>
              )}

              {updateProfileMutation.error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {updateProfileMutation.error}
                </Alert>
              )}

              {updateProfileMutation.success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Profile updated successfully!
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card sx={{ mt: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Security
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Lock />
                  </ListItemIcon>
                  <ListItemText
                    primary="Password"
                    secondary="Change your account password"
                  />
                  <Button
                    variant="outlined"
                    onClick={() => setPasswordDialogOpen(true)}
                  >
                    Change Password
                  </Button>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Profile Summary */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* User Card */}
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                }}
                src={user.profile?.profile_picture || undefined}
              >
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
              
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {user.first_name && user.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : user.username
                }
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                @{user.username}
              </Typography>
              
              <Typography variant="caption" color="text.secondary">
                Member since {new Date(user.date_joined).toLocaleDateString()}
              </Typography>

              {user.profile?.dietary_preferences && (
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={user.profile.dietary_preferences}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Your Stats
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Restaurant />
                  </ListItemIcon>
                  <ListItemText
                    primary="Recipes"
                    secondary="0 recipes created"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Favorite />
                  </ListItemIcon>
                  <ListItemText
                    primary="Favorites"
                    secondary="0 recipes favorited"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Analytics />
                  </ListItemIcon>
                  <ListItemText
                    primary="Recipes Parsed"
                    secondary="0 recipes analyzed"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button variant="outlined" fullWidth>
                  Export My Data
                </Button>
                <Button variant="outlined" color="error" fullWidth>
                  Delete Account
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={passwordData.old_password}
              onChange={(e) => setPasswordData(prev => ({ ...prev, old_password: e.target.value }))}
              error={!!passwordErrors.old_password}
              helperText={passwordErrors.old_password}
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
              error={!!passwordErrors.new_password}
              helperText={passwordErrors.new_password}
              margin="normal"
            />
            
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
              error={!!passwordErrors.confirm_password}
              helperText={passwordErrors.confirm_password}
              margin="normal"
            />

            {changePasswordMutation.error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {changePasswordMutation.error}
              </Alert>
            )}

            {changePasswordMutation.success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Password changed successfully!
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            disabled={changePasswordMutation.loading}
          >
            {changePasswordMutation.loading ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;