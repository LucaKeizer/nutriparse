import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Button,
  IconButton,
  Alert,
  Paper,
} from '@mui/material';
import {
  AccessTime,
  Restaurant,
  Person,
  Favorite,
  FavoriteBorder,
  Share,
  Edit,
  ArrowBack,
} from '@mui/icons-material';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { recipesAPI } from '@/services/api';
import { useApi, useMutation } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import NutritionChart from '@/components/Nutrition/NutritionChart';
import IngredientsList from '@/components/Recipe/IngredientsList';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

const RecipeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data: recipe,
    loading,
    error,
    refetch,
  } = useApi(() => recipesAPI.getRecipe(parseInt(id!)), true);

  const favoriteMutation = useMutation<{ status: string }, number>(
    recipesAPI.favoriteRecipe
  );

  const handleFavorite = async () => {
    if (!recipe) return;
    try {
      await favoriteMutation.mutate(recipe.id);
      refetch();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe?.title,
          text: recipe?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Recipe link copied to clipboard!');
    }
  };

  const formatTime = (minutes: number | null): string => {
    if (!minutes) return 'Not specified';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} hour${hours > 1 ? 's' : ''} ${mins} minute${mins > 1 ? 's' : ''}` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const getTotalTime = (): string => {
    if (!recipe) return '';
    const prep = recipe.prep_time || 0;
    const cook = recipe.cook_time || 0;
    const total = prep + cook;
    return total > 0 ? formatTime(total) : 'Not specified';
  };

  if (loading) {
    return <LoadingSpinner message="Loading recipe..." />;
  }

  if (error || !recipe) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Recipe not found'}
        </Alert>
        <Button
          component={RouterLink}
          to="/recipes"
          startIcon={<ArrowBack />}
          variant="outlined"
        >
          Back to Recipes
        </Button>
      </Box>
    );
  }

  const isOwner = user?.id === recipe.user;

  return (
    <Box>
      {/* Header with navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
          size="large"
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1" fontWeight="bold" sx={{ flexGrow: 1 }}>
          {recipe.title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={handleFavorite} color="error">
            <FavoriteBorder /> {/* Would need to track favorite status */}
          </IconButton>
          <IconButton onClick={handleShare}>
            <Share />
          </IconButton>
          {isOwner && (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              size="small"
            >
              Edit
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column - Recipe Info */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {/* Recipe Image */}
          {recipe.image ? (
            <CardMedia
              component="img"
              height="300"
              image={recipe.image}
              alt={recipe.title}
              sx={{ borderRadius: 2, mb: 3 }}
            />
          ) : (
            <Paper
              sx={{
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'grey.100',
                borderRadius: 2,
                mb: 3,
              }}
            >
              <Restaurant sx={{ fontSize: 80, color: 'grey.400' }} />
            </Paper>
          )}

          {/* Recipe Meta Info */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Restaurant color="primary" sx={{ mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    {recipe.servings}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Servings
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <AccessTime color="primary" sx={{ mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    {formatTime(recipe.prep_time)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Prep Time
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <AccessTime color="secondary" sx={{ mb: 1 }} />
                  <Typography variant="h6" fontWeight="bold">
                    {formatTime(recipe.cook_time)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cook Time
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Description */}
          {recipe.description && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Description
              </Typography>
              <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                {recipe.description}
              </Typography>
            </Paper>
          )}

          {/* Ingredients */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Ingredients
            </Typography>
            <IngredientsList ingredients={recipe.ingredients} showNutrition />
          </Paper>

          {/* Instructions */}
          {recipe.instructions && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Instructions
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-line',
                  lineHeight: 1.7,
                }}
              >
                {recipe.instructions}
              </Typography>
            </Paper>
          )}

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Tags
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {recipe.tags.map((tag) => (
                  <Chip
                    key={tag.id}
                    label={tag.name}
                    variant="outlined"
                    color="primary"
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Source */}
          {recipe.source_url && (
            <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Source:</strong>{' '}
                {recipe.source_name ? (
                  <a href={recipe.source_url} target="_blank" rel="noopener noreferrer">
                    {recipe.source_name}
                  </a>
                ) : (
                  <a href={recipe.source_url} target="_blank" rel="noopener noreferrer">
                    {recipe.source_url}
                  </a>
                )}
              </Typography>
            </Paper>
          )}
        </Grid>

        {/* Right Column - Nutrition Info */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ position: 'sticky', top: 24 }}>
            {/* Recipe Author */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Person />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Recipe by
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {recipe.user_username}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Created {new Date(recipe.created_at).toLocaleDateString()}
                  {recipe.updated_at !== recipe.created_at && (
                    <> • Updated {new Date(recipe.updated_at).toLocaleDateString()}</>
                  )}
                </Typography>
              </CardContent>
            </Card>

            {/* Nutrition Information */}
            {recipe.ingredients.some(ing => ing.is_parsed) && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Nutrition Information
                  </Typography>
                  <NutritionChart 
                    ingredients={recipe.ingredients}
                    servings={recipe.servings}
                  />
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            {recipe.total_calories && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Per Serving
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary.main" fontWeight="bold">
                          {Math.round(recipe.total_calories / recipe.servings)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Calories
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main" fontWeight="bold">
                          {recipe.total_protein ? Math.round(recipe.total_protein / recipe.servings) : 0}g
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Protein
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RecipeDetailPage;