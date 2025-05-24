import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Fab,
  Menu,
  MenuItem,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Search,
  Add,
  Favorite,
  FavoriteBorder,
  AccessTime,
  Restaurant,
  MoreVert,
  Edit,
  Delete,
  Visibility,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { recipesAPI } from '@/services/api';
import { useApi, useMutation } from '@/hooks/useApi';
import { RecipeLight } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

const RecipesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeLight | null>(null);

  const {
    data: recipesData,
    loading,
    error,
    refetch,
  } = useApi(() => recipesAPI.getRecipes({ username: user?.username }));

  const favoriteMutation = useMutation<{ status: string }, number>(
    recipesAPI.favoriteRecipe
  );

  const deleteMutation = useMutation<void, number>(
    recipesAPI.deleteRecipe
  );

  const filteredRecipes = recipesData?.results.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, recipe: RecipeLight) => {
    setAnchorEl(event.currentTarget);
    setSelectedRecipe(recipe);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRecipe(null);
  };

  const handleFavorite = async (recipeId: number) => {
    try {
      await favoriteMutation.mutate(recipeId);
      refetch(); // Refresh the recipes list
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleDelete = async (recipeId: number) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteMutation.mutate(recipeId);
        refetch(); // Refresh the recipes list
        handleMenuClose();
      } catch (error) {
        console.error('Failed to delete recipe:', error);
      }
    }
  };

  const formatTime = (minutes: number | null): string => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getTotalTime = (recipe: RecipeLight): string => {
    const prep = recipe.prep_time || 0;
    const cook = recipe.cook_time || 0;
    const total = prep + cook;
    return total > 0 ? formatTime(total) : '';
  };

  if (loading) {
    return <LoadingSpinner message="Loading your recipes..." />;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load recipes: {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            My Recipes
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {recipesData?.count || 0} recipes in your collection
          </Typography>
        </Box>
      </Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Search your recipes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search color="action" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 4 }}
      />

      {/* Recipes Grid */}
      {filteredRecipes.length > 0 ? (
        <Grid container spacing={3}>
          {filteredRecipes.map((recipe) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={recipe.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                {recipe.image ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={recipe.image}
                    alt={recipe.title}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      backgroundColor: 'grey.100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Restaurant sx={{ fontSize: 64, color: 'grey.400' }} />
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="h2" fontWeight="bold" sx={{ flexGrow: 1 }}>
                      {recipe.title}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, recipe)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {recipe.description}
                  </Typography>

                  {/* Recipe Info */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      size="small"
                      icon={<Restaurant />}
                      label={`${recipe.servings} servings`}
                      variant="outlined"
                    />
                    {getTotalTime(recipe) && (
                      <Chip
                        size="small"
                        icon={<AccessTime />}
                        label={getTotalTime(recipe)}
                        variant="outlined"
                      />
                    )}
                  </Box>

                  {/* Nutrition Info */}
                  {recipe.total_calories && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        size="small"
                        label={`${Math.round(recipe.total_calories / recipe.servings)} cal`}
                        color="primary"
                      />
                      {recipe.total_protein && (
                        <Chip
                          size="small"
                          label={`${Math.round(recipe.total_protein / recipe.servings)}g protein`}
                          color="secondary"
                        />
                      )}
                      {recipe.total_carbs && (
                        <Chip
                          size="small"
                          label={`${Math.round(recipe.total_carbs / recipe.servings)}g carbs`}
                          color="info"
                        />
                      )}
                      {recipe.total_fat && (
                        <Chip
                          size="small"
                          label={`${Math.round(recipe.total_fat / recipe.servings)}g fat`}
                          color="warning"
                        />
                      )}
                    </Box>
                  )}

                  {/* Tags */}
                  {recipe.tags && recipe.tags.length > 0 && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {recipe.tags.map((tag) => (
                        <Chip
                          key={tag.id}
                          label={tag.name}
                          size="small"
                          variant="outlined"
                          color="default"
                        />
                      ))}
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button
                    component={RouterLink}
                    to={`/recipes/${recipe.id}`}
                    startIcon={<Visibility />}
                    size="small"
                  >
                    View
                  </Button>
                  <IconButton
                    onClick={() => handleFavorite(recipe.id)}
                    color="error"
                    disabled={favoriteMutation.loading}
                  >
                    {/* This would need to check if recipe is favorited */}
                    <FavoriteBorder />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 2,
          }}
        >
          <Restaurant sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="text.secondary">
            {searchTerm ? 'No recipes found' : 'No recipes yet'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm 
              ? `No recipes match "${searchTerm}". Try a different search term.`
              : 'Start by parsing your first recipe to build your collection.'
            }
          </Typography>
          {!searchTerm && (
            <Button
              component={RouterLink}
              to="/parse"
              variant="contained"
              size="large"
              startIcon={<Add />}
            >
              Parse Your First Recipe
            </Button>
          )}
        </Box>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add recipe"
        component={RouterLink}
        to="/parse"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
      >
        <Add />
      </Fab>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          component={RouterLink}
          to={`/recipes/${selectedRecipe?.id}`}
          onClick={handleMenuClose}
        >
          <Visibility sx={{ mr: 1 }} />
          View Recipe
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Edit sx={{ mr: 1 }} />
          Edit Recipe
        </MenuItem>
        <MenuItem
          onClick={() => selectedRecipe && handleDelete(selectedRecipe.id)}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
          Delete Recipe
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default RecipesPage;