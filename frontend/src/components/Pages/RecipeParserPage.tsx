import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Send,
  ContentPaste,
  Restaurant,
  Analytics,
  Save,
  ExpandMore,
  CheckCircle,
  Warning,
  Info,
} from '@mui/icons-material';
import { recipesAPI } from '@/services/api';
import { useMutation } from '@/hooks/useApi';
import { ParseRecipeRequest, RecipeParseResponse, MatchedIngredient } from '@/types/api';
import NutritionChart from '@/components/Nutrition/NutritionChart';
import IngredientsList from '@/components/Recipe/IngredientsList';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

const RecipeParserPage: React.FC = () => {
  const [recipeText, setRecipeText] = useState('');
  const [title, setTitle] = useState('');
  const [servings, setServings] = useState<number>(4);
  const [saveRecipe, setSaveRecipe] = useState(false);
  const [parseResult, setParseResult] = useState<RecipeParseResponse | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const parseMutation = useMutation<RecipeParseResponse, ParseRecipeRequest>(
    recipesAPI.parseRecipe
  );

  const handleParse = async () => {
    if (!recipeText.trim()) {
      return;
    }

    try {
      const result = await parseMutation.mutate({
        recipe_text: recipeText,
        title: title || undefined,
        servings: servings || undefined,
        save_recipe: saveRecipe,
      });
      setParseResult(result);
      if (saveRecipe && result.recipe) {
        setShowSaveDialog(true);
      }
    } catch (error) {
      console.error('Failed to parse recipe:', error);
    }
  };

  const handlePasteExample = () => {
    const exampleRecipe = `Classic Chocolate Chip Cookies

Ingredients:
2 1/4 cups all-purpose flour
1 teaspoon baking soda
1 teaspoon salt
1 cup butter, softened
3/4 cup granulated sugar
3/4 cup packed brown sugar
2 large eggs
2 teaspoons vanilla extract
2 cups chocolate chips

Instructions:
1. Preheat oven to 375°F (190°C).
2. In a medium bowl, whisk together flour, baking soda, and salt.
3. In a large bowl, cream together butter and both sugars until light and fluffy.
4. Beat in eggs one at a time, then stir in vanilla.
5. Gradually blend in flour mixture.
6. Stir in chocolate chips.
7. Drop rounded tablespoons of dough onto ungreased cookie sheets.
8. Bake 9 to 11 minutes or until golden brown.
9. Cool on baking sheet for 2 minutes; remove to wire rack.

Makes about 48 cookies.`;

    setRecipeText(exampleRecipe);
    setTitle('Classic Chocolate Chip Cookies');
    setServings(48);
  };

  const handleClear = () => {
    setRecipeText('');
    setTitle('');
    setServings(4);
    setParseResult(null);
    parseMutation.reset();
  };

  const calculateTotalNutrition = (ingredients: MatchedIngredient[]) => {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    };

    ingredients.forEach(ingredient => {
      if (ingredient.food && ingredient.quantity) {
        // This is a simplified calculation - in reality, you'd need conversion factors
        const factor = ingredient.quantity / 100; // Assuming 100g portions
        totals.calories += (ingredient.food as any)?.calories * factor || 0;
        totals.protein += (ingredient.food as any)?.protein * factor || 0;
        totals.carbs += (ingredient.food as any)?.carbohydrates * factor || 0;
        totals.fat += (ingredient.food as any)?.fat * factor || 0;
        totals.fiber += (ingredient.food as any)?.fiber * factor || 0;
      }
    });

    return totals;
  };

  const getParsedCount = (ingredients: MatchedIngredient[]) => {
    return ingredients.filter(ing => ing.is_parsed).length;
  };

  const getUnparsedIngredients = (ingredients: MatchedIngredient[]) => {
    return ingredients.filter(ing => !ing.is_parsed);
  };

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
        Recipe Parser
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Paste your recipe below and let our AI extract ingredients and calculate nutrition information
      </Typography>

      <Grid container spacing={4}>
        {/* Left Column - Input */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={2} sx={{ p: 3, height: 'fit-content' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Restaurant color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                Recipe Input
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Recipe Title (Optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Number of Servings"
              type="number"
              value={servings}
              onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
              margin="normal"
              inputProps={{ min: 1, max: 100 }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              multiline
              rows={12}
              label="Paste your recipe here..."
              value={recipeText}
              onChange={(e) => setRecipeText(e.target.value)}
              placeholder="Ingredients:&#10;2 cups flour&#10;1 cup sugar&#10;...&#10;&#10;Instructions:&#10;1. Mix dry ingredients&#10;2. Add wet ingredients&#10;..."
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<ContentPaste />}
                onClick={handlePasteExample}
                size="small"
              >
                Use Example
              </Button>
              <Button
                variant="outlined"
                onClick={handleClear}
                size="small"
                color="secondary"
              >
                Clear
              </Button>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={saveRecipe}
                  onChange={(e) => setSaveRecipe(e.target.checked)}
                />
              }
              label="Save recipe to my collection"
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<Send />}
              onClick={handleParse}
              disabled={!recipeText.trim() || parseMutation.loading}
              sx={{ py: 1.5 }}
            >
              {parseMutation.loading ? 'Analyzing Recipe...' : 'Parse Recipe'}
            </Button>

            {parseMutation.loading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Processing your recipe with AI...
                </Typography>
              </Box>
            )}

            {parseMutation.error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {parseMutation.error}
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Right Column - Results */}
        <Grid size={{ xs: 12, lg: 6 }}>
          {parseResult ? (
            <Box>
              {/* Success Alert */}
              <Alert severity="success" sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle />
                  <Typography>
                    Recipe parsed successfully! Found {parseResult.matched_ingredients.length} ingredients,{' '}
                    {getParsedCount(parseResult.matched_ingredients)} matched to nutrition database.
                  </Typography>
                </Box>
              </Alert>

              {/* Parsing Statistics */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Parsing Results
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary.main" fontWeight="bold">
                          {parseResult.matched_ingredients.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Ingredients
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="success.main" fontWeight="bold">
                          {getParsedCount(parseResult.matched_ingredients)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Successfully Matched
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Nutrition Chart */}
              {parseResult.matched_ingredients.some(ing => ing.is_parsed) && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Analytics color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" fontWeight="bold">
                        Nutrition Overview
                      </Typography>
                    </Box>
                    <NutritionChart 
                      ingredients={parseResult.matched_ingredients}
                      servings={servings}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Ingredients List */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Parsed Ingredients
                  </Typography>
                  <IngredientsList ingredients={parseResult.matched_ingredients} />
                </CardContent>
              </Card>

              {/* Unparsed Ingredients Warning */}
              {getUnparsedIngredients(parseResult.matched_ingredients).length > 0 && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Some ingredients couldn't be matched:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                    {getUnparsedIngredients(parseResult.matched_ingredients).map((ingredient, index) => (
                      <Chip
                        key={index}
                        label={ingredient.original_text}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    These ingredients won't be included in the nutrition calculation.
                  </Typography>
                </Alert>
              )}

              {/* Recipe Instructions */}
              {parseResult.parsed_data.instructions && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6">Instructions</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      variant="body1"
                      sx={{
                        whiteSpace: 'pre-line',
                        lineHeight: 1.6,
                      }}
                    >
                      {parseResult.parsed_data.instructions}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              )}
            </Box>
          ) : (
            <Paper
              elevation={1}
              sx={{
                p: 4,
                textAlign: 'center',
                backgroundColor: 'grey.50',
                border: '2px dashed',
                borderColor: 'grey.300',
              }}
            >
              <Restaurant sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Recipe results will appear here
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Paste your recipe in the input area and click "Parse Recipe" to get started
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Save Success Dialog */}
      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Save color="success" />
            Recipe Saved Successfully!
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Your recipe "{parseResult?.recipe?.title}" has been saved to your collection.
            You can view and manage it from the "My Recipes" page.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setShowSaveDialog(false);
              // Navigate to recipes page - you'll implement this
              window.location.href = '/recipes';
            }}
          >
            View My Recipes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Help Section */}
      <Box sx={{ mt: 6 }}>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Tips for Best Results
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Info color="primary" sx={{ mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Format Your Recipe
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Separate ingredients and instructions clearly. Use standard measurements 
                  like cups, tablespoons, ounces, etc.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <CheckCircle color="success" sx={{ mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Common Ingredients
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Our database works best with common ingredients. Generic terms 
                  like "flour" work better than specific brands.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Warning color="warning" sx={{ mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Review Results
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Always review the parsed ingredients for accuracy. Some items 
                  may need manual adjustment for precise nutrition calculations.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default RecipeParserPage;