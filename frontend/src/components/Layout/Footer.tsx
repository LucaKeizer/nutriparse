import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { GitHub, LinkedIn, Email } from '@mui/icons-material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
        <Stack
          direction={isMobile ? 'column' : 'row'}
          spacing={4}
          alignItems={isMobile ? 'center' : 'flex-start'}
          textAlign={isMobile ? 'center' : 'left'}
        >
          {/* About Section */}
          <Box sx={{ flex: 1 }}>
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
          </Box>

          {/* Quick Links */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Stack spacing={1}>
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
            </Stack>
          </Box>

          {/* Contact & Social */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              Connect
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: isMobile ? 'center' : 'flex-start' }}>
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: isMobile ? 'center' : 'flex-start' }}>
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: isMobile ? 'center' : 'flex-start' }}>
                <Email fontSize="small" />
                <Link 
                  href="mailto:your.email@example.com" 
                  color="inherit" 
                  underline="hover"
                >
                  Contact Me
                </Link>
              </Box>
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 3, backgroundColor: 'rgba(255,255,255,0.2)' }} />

        {/* Copyright */}
        <Stack
          direction={isMobile ? 'column' : 'row'}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          textAlign="center"
        >
          <Typography variant="body2" color="rgba(255,255,255,0.8)">
            © {currentYear} NutriParse. All rights reserved.
          </Typography>
          <Typography variant="body2" color="rgba(255,255,255,0.8)">
            Made with ❤️ using React, Django & NLP
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;