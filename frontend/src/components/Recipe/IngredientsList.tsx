import React from 'react';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Box,
  Typography,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Restaurant,
  Scale,
} from '@mui/icons-material';
import { MatchedIngredient } from '@/types/api';

interface IngredientsListProps {
  ingredients: MatchedIngredient[];
  showNutrition?: boolean;
}

const IngredientsList: React.FC<IngredientsListProps> = ({ 
  ingredients, 
  showNutrition = false 
}) => {
  const formatQuantity = (ingredient: MatchedIngredient): string => {
    const parts = [];
    
    if (ingredient.quantity) {
      // Format quantity to remove unnecessary decimals
      const quantity = ingredient.quantity % 1 === 0 
        ? ingredient.quantity.toString() 
        : ingredient.quantity.toFixed(2).replace(/\.?0+$/, '');
      parts.push(quantity);
    }
    
    if (ingredient.unit) {
      parts.push(ingredient.unit);
    }
    
    return parts.join(' ');
  };

  const getIngredientIcon = (ingredient: MatchedIngredient) => {
    if (ingredient.is_parsed) {
      return (
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'success.light' }}>
          <CheckCircle sx={{ fontSize: 18, color: 'white' }} />
        </Avatar>
      );
    } else {
      return (
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'warning.light' }}>
          <Warning sx={{ fontSize: 18, color: 'white' }} />
        </Avatar>
      );
    }
  };

  const getIngredientName = (ingredient: MatchedIngredient): string => {
    if (ingredient.is_parsed && ingredient.food) {
      // In a real app, you'd get the food name from the food object
      return ingredient.ingredient;
    }
    return ingredient.ingredient;
  };

  const getMockNutrition = (ingredient: MatchedIngredient) => {
    if (!ingredient.is_parsed || !ingredient.quantity) return null;
    
    // Mock nutrition data - replace with actual food data
    const baseCalories = Math.floor(Math.random() * 300) + 50;
    const factor = ingredient.quantity / 100;
    
    return {
      calories: Math.round(baseCalories * factor),
      protein: Math.round(Math.random() * 20 * factor * 10) / 10,
      carbs: Math.round(Math.random() * 40 * factor * 10) / 10,
      fat: Math.round(Math.random() * 15 * factor * 10) / 10,
    };
  };

  const groupedIngredients = ingredients.reduce((groups, ingredient) => {
    const key = ingredient.is_parsed ? 'matched' : 'unmatched';
    if (!groups[key]) groups[key] = [];
    groups[key].push(ingredient);
    return groups;
  }, {} as Record<string, MatchedIngredient[]>);

  return (
    <Box>
      {/* Successfully Matched Ingredients */}
      {groupedIngredients.matched && groupedIngredients.matched.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" color="success.main" sx={{ mb: 1 }}>
            Successfully Matched ({groupedIngredients.matched.length})
          </Typography>
          <List dense>
            {groupedIngredients.matched.map((ingredient, index) => {
              const nutrition = showNutrition ? getMockNutrition(ingredient) : null;
              
              return (
                <ListItem
                  key={index}
                  sx={{
                    border: '1px solid',
                    borderColor: 'success.light',
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: 'rgba(76, 175, 80, 0.04)',
                  }}
                >
                  <ListItemIcon>
                    {getIngredientIcon(ingredient)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {formatQuantity(ingredient)} {getIngredientName(ingredient)}
                        </Typography>
                        {ingredient.preparation && (
                          <Chip
                            label={ingredient.preparation}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Original: {ingredient.original_text}
                        </Typography>
                        {nutrition && (
                          <Box sx={{ mt: 0.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                              size="small"
                              label={`${nutrition.calories} cal`}
                              color="primary"
                              variant="outlined"
                            />
                            <Chip
                              size="small"
                              label={`${nutrition.protein}g protein`}
                              color="secondary"
                              variant="outlined"
                            />
                            <Chip
                              size="small"
                              label={`${nutrition.carbs}g carbs`}
                              color="info"
                              variant="outlined"
                            />
                            <Chip
                              size="small"
                              label={`${nutrition.fat}g fat`}
                              color="warning"
                              variant="outlined"
                            />
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>
      )}

      {/* Unmatched Ingredients */}
      {groupedIngredients.unmatched && groupedIngredients.unmatched.length > 0 && (
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" color="warning.main" sx={{ mb: 1 }}>
            Could Not Match ({groupedIngredients.unmatched.length})
          </Typography>
          <List dense>
            {groupedIngredients.unmatched.map((ingredient, index) => (
              <ListItem
                key={index}
                sx={{
                  border: '1px solid',
                  borderColor: 'warning.light',
                  borderRadius: 1,
                  mb: 1,
                  backgroundColor: 'rgba(255, 152, 0, 0.04)',
                }}
              >
                <ListItemIcon>
                  {getIngredientIcon(ingredient)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body1">
                      {ingredient.original_text}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Parsed as: {formatQuantity(ingredient)} {ingredient.ingredient}
                      </Typography>
                      <Typography variant="caption" color="warning.main" sx={{ display: 'block' }}>
                        Not found in nutrition database - nutrition data unavailable
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
            💡 Tip: Try using more common ingredient names. For example, use "flour" instead of specific brand names.
          </Typography>
        </Box>
      )}

      {/* Empty State */}
      {ingredients.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Restaurant sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            No ingredients to display
          </Typography>
        </Box>
      )}

      {/* Summary */}
      {ingredients.length > 0 && (
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Summary:</strong> {ingredients.length} total ingredients, {' '}
            {ingredients.filter(ing => ing.is_parsed).length} successfully matched to nutrition database
            {ingredients.filter(ing => ing.is_parsed).length > 0 && (
              <> ({Math.round((ingredients.filter(ing => ing.is_parsed).length / ingredients.length) * 100)}% match rate)</>
            )}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default IngredientsList;