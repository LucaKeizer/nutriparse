import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Container,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Assignment,
  Analytics,
  AutoAwesome,
  Restaurant,
  Speed,
  Security,
  CheckCircle,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Assignment color="primary" />,
      title: 'Smart Recipe Parsing',
      description: 'Paste any recipe text and our AI will automatically extract ingredients, quantities, and units with high accuracy.',
    },
    {
      icon: <Analytics color="primary" />,
      title: 'Comprehensive Nutrition Analysis',
      description: 'Get detailed nutritional information including calories, macronutrients, vitamins, and minerals for every recipe.',
    },
    {
      icon: <AutoAwesome color="primary" />,
      title: 'Ingredient Matching',
      description: 'Advanced matching algorithm connects parsed ingredients to our extensive nutrition database.',
    },
    {
      icon: <Restaurant color="primary" />,
      title: 'Recipe Management',
      description: 'Save, organize, and manage your favorite recipes with nutritional information always at hand.',
    },
    {
      icon: <Speed color="primary" />,
      title: 'Fast & Accurate',
      description: 'Lightning-fast processing with high accuracy thanks to advanced Natural Language Processing.',
    },
    {
      icon: <Security color="primary" />,
      title: 'Secure & Private',
      description: 'Your recipes and data are secure with user authentication and privacy protection.',
    },
  ];

  const benefits = [
    'Extract ingredients from any recipe format',
    'Calculate nutrition per serving automatically',
    'Track calories, proteins, carbs, and fats',
    'Discover vitamins and minerals in your meals',
    'Save and organize your favorite recipes',
    'Scale recipes and adjust serving sizes',
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
          color: 'white',
          py: 8,
          mb: 6,
          borderRadius: 2,
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              textAlign: 'center',
              mb: 3,
            }}
          >
            Transform Recipes into Nutrition
          </Typography>
          <Typography
            variant="h5"
            component="p"
            sx={{
              textAlign: 'center',
              mb: 4,
              opacity: 0.9,
              fontWeight: 300,
            }}
          >
            Paste any recipe and instantly get detailed nutritional information 
            powered by advanced AI and Natural Language Processing
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              <Button
                component={RouterLink}
                to="/parse"
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.9)',
                  },
                }}
              >
                Parse Recipe Now
              </Button>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: 'white',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.9)',
                    },
                  }}
                >
                  Get Started Free
                </Button>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontWeight: 'bold',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Sign In
                </Button>
              </>
            )}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          sx={{ textAlign: 'center', mb: 6, fontWeight: 'bold' }}
        >
          Powerful Features
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
          {features.map((feature, index) => (
            <Card
              key={index}
              sx={{
                flex: '1 1 300px',
                maxWidth: 360,
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {feature.icon}
                  <Typography variant="h6" component="h3" sx={{ ml: 1, fontWeight: 'bold' }}>
                    {feature.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ backgroundColor: 'grey.50', py: 8 }}>
        <Container maxWidth="md">
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{ textAlign: 'center', mb: 6, fontWeight: 'bold' }}
          >
            What You Can Do
          </Typography>
          <Paper sx={{ p: 4 }}>
            <List>
              {benefits.map((benefit, index) => (
                <ListItem key={index} sx={{ py: 1 }}>
                  <ListItemIcon>
                    <CheckCircle color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={benefit}
                    primaryTypographyProps={{
                      variant: 'body1',
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          sx={{ textAlign: 'center', mb: 6, fontWeight: 'bold' }}
        >
          How It Works
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'flex-start', justifyContent: 'center' }}>
          <Box sx={{ flex: '1 1 250px', textAlign: 'center', p: 3, maxWidth: 300 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                fontSize: '2rem',
                fontWeight: 'bold',
              }}
            >
              1
            </Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Paste Your Recipe
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Copy and paste any recipe text from websites, books, or notes. 
              Our AI handles various formats automatically.
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 250px', textAlign: 'center', p: 3, maxWidth: 300 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'secondary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                fontSize: '2rem',
                fontWeight: 'bold',
              }}
            >
              2
            </Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              AI Processes & Extracts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Advanced NLP algorithms parse ingredients, quantities, and units 
              while matching them to our nutrition database.
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 250px', textAlign: 'center', p: 3, maxWidth: 300 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'success.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                fontSize: '2rem',
                fontWeight: 'bold',
              }}
            >
              3
            </Box>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Get Nutrition Insights
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View comprehensive nutritional information, save your recipes, 
              and track your dietary goals effortlessly.
            </Typography>
          </Box>
        </Box>
      </Container>

      {/* CTA Section */}
      {!isAuthenticated && (
        <Box
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            py: 6,
            textAlign: 'center',
          }}
        >
          <Container maxWidth="md">
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Ready to Transform Your Recipes?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join thousands of users who are already discovering the nutritional 
              value of their favorite recipes.
            </Typography>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              sx={{
                backgroundColor: 'white',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                },
              }}
            >
              Start Free Today
            </Button>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default HomePage;