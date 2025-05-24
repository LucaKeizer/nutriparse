import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { MatchedIngredient } from '@/types/api';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface NutritionChartProps {
  ingredients: MatchedIngredient[];
  servings?: number;
}

interface NutritionTotals {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

const NutritionChart: React.FC<NutritionChartProps> = ({ ingredients, servings = 1 }) => {
  // Calculate nutrition totals from matched ingredients
  const calculateNutrition = (): NutritionTotals => {
    const totals: NutritionTotals = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    };

    ingredients
      .filter(ingredient => ingredient.is_parsed && ingredient.food)
      .forEach(ingredient => {
        if (ingredient.quantity && ingredient.food) {
          // This is a simplified calculation
          // In a real app, you'd need proper unit conversions
          const factor = ingredient.quantity / 100; // Assuming nutrition data is per 100g
          
          // Mock nutrition data - in reality, this would come from the food object
          const mockNutrition = {
            calories: Math.random() * 300 + 50,
            protein: Math.random() * 20 + 2,
            carbohydrates: Math.random() * 40 + 5,
            fat: Math.random() * 15 + 1,
            fiber: Math.random() * 8 + 1,
            sugar: Math.random() * 10 + 1,
            sodium: Math.random() * 500 + 10,
          };

          totals.calories += mockNutrition.calories * factor;
          totals.protein += mockNutrition.protein * factor;
          totals.carbohydrates += mockNutrition.carbohydrates * factor;
          totals.fat += mockNutrition.fat * factor;
          totals.fiber += mockNutrition.fiber * factor;
          totals.sugar += mockNutrition.sugar * factor;
          totals.sodium += mockNutrition.sodium * factor;
        }
      });

    return totals;
  };

  const nutrition = calculateNutrition();
  const perServing = {
    calories: Math.round(nutrition.calories / servings),
    protein: Math.round((nutrition.protein / servings) * 10) / 10,
    carbohydrates: Math.round((nutrition.carbohydrates / servings) * 10) / 10,
    fat: Math.round((nutrition.fat / servings) * 10) / 10,
    fiber: Math.round((nutrition.fiber / servings) * 10) / 10,
    sugar: Math.round((nutrition.sugar / servings) * 10) / 10,
    sodium: Math.round(nutrition.sodium / servings),
  };

  // Macronutrient distribution chart data
  const macroData = {
    labels: ['Carbohydrates', 'Protein', 'Fat'],
    datasets: [
      {
        data: [perServing.carbohydrates * 4, perServing.protein * 4, perServing.fat * 9],
        backgroundColor: [
          '#4caf50', // Green for carbs
          '#ff9800', // Orange for protein
          '#f44336', // Red for fat
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const macroOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = Math.round(context.raw);
            const percentage = Math.round((context.raw / context.dataset.data.reduce((a: number, b: number) => a + b, 0)) * 100);
            return `${label}: ${value} cal (${percentage}%)`;
          },
        },
      },
    },
  };

  // Nutrient comparison chart data
  const nutrientData = {
    labels: ['Protein', 'Carbs', 'Fat', 'Fiber'],
    datasets: [
      {
        label: 'Grams per Serving',
        data: [perServing.protein, perServing.carbohydrates, perServing.fat, perServing.fiber],
        backgroundColor: [
          'rgba(255, 152, 0, 0.8)',
          'rgba(76, 175, 80, 0.8)',
          'rgba(244, 67, 54, 0.8)',
          'rgba(156, 39, 176, 0.8)',
        ],
        borderColor: [
          'rgba(255, 152, 0, 1)',
          'rgba(76, 175, 80, 1)',
          'rgba(244, 67, 54, 1)',
          'rgba(156, 39, 176, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const nutrientOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value + 'g';
          },
        },
      },
    },
  };

  const getNutrientStatus = (value: number, dailyValue: number) => {
    const percentage = (value / dailyValue) * 100;
    if (percentage < 5) return { color: 'error', text: 'Low' };
    if (percentage < 20) return { color: 'warning', text: 'Moderate' };
    return { color: 'success', text: 'High' };
  };

  return (
    <Box>
      {/* Nutrition Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {perServing.calories}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Calories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {perServing.protein}g
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Protein
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {perServing.carbohydrates}g
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Carbs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {perServing.fat}g
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fat
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom textAlign="center">
                Calorie Distribution
              </Typography>
              <Box sx={{ height: 250, position: 'relative' }}>
                <Doughnut data={macroData} options={macroOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom textAlign="center">
                Macronutrients (per serving)
              </Typography>
              <Box sx={{ height: 250, position: 'relative' }}>
                <Bar data={nutrientData} options={nutrientOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Nutrition Facts */}
      <Card variant="outlined" sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Nutrition Facts (Per Serving)
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Fiber</Typography>
                  <Typography variant="body2" fontWeight="bold">{perServing.fiber}g</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((perServing.fiber / 25) * 100, 100)}
                  color="secondary"
                />
                <Typography variant="caption" color="text.secondary">
                  {Math.round((perServing.fiber / 25) * 100)}% of daily value
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Sugar</Typography>
                  <Typography variant="body2" fontWeight="bold">{perServing.sugar}g</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min((perServing.sugar / 50) * 100, 100)}
                  color="warning"
                />
                <Typography variant="caption" color="text.secondary">
                  {Math.round((perServing.sugar / 50) * 100)}% of daily limit
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Sodium</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" fontWeight="bold">{perServing.sodium}mg</Typography>
                  <Chip
                    size="small"
                    label={getNutrientStatus(perServing.sodium, 2300).text}
                    color={getNutrientStatus(perServing.sodium, 2300).color as any}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {servings > 1 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          * Values shown are per serving (Recipe makes {servings} servings)
        </Typography>
      )}
    </Box>
  );
};

export default NutritionChart;