import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  Divider,
} from '@mui/material';
import { GitHub, LinkedIn, Email } from '@mui/icons-material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.main',
        color: 'white',
        py: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* About Section */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" gutterBottom>
              NutriParse
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              A powerful web application that transforms recipe text into detailed 
              nutritional information using advanced Natural Language Processing.
            </Typography>
            <Typography variant="body2" color="rgba(255,255,255,0.8)">
              Built with React, Django, and spaCy
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="inherit" underline="hover">
                Home
              </Link>
              <Link href="/parse" color="inherit" underline="hover">
                Parse Recipe
              </Link>
              <Link href="/recipes" color="inherit" underline="hover">
                My Recipes
              </Link>
              <Link href="/profile" color="inherit" underline="hover">
                Profile
              </Link>
            </Box>
          </Grid>

          {/* Contact & Social */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" gutterBottom>
              Connect
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GitHub fontSize="small" />
                <Link 
                  href="https://github.com/LucaKeizer/nutriparse" 
                  color="inherit" 
                  underline="hover"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on GitHub
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LinkedIn fontSize="small" />
                <Link 
                  href="https://linkedin.com/in/your-profile" 
                  color="inherit" 
                  underline="hover"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn Profile
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email fontSize="small" />
                <Link 
                  href="mailto:your.email@example.com" 
                  color="inherit" 
                  underline="hover"
                >
                  Contact Me
                </Link>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, backgroundColor: 'rgba(255,255,255,0.2)' }} />

        {/* Copyright */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="rgba(255,255,255,0.8)">
            © {currentYear} NutriParse. All rights reserved.
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.8)">
            Made with ❤️ using React, Django & NLP
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;