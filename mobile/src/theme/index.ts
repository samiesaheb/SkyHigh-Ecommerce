export const theme = {
  colors: {
    // Primary palette - minimal and sophisticated
    primary: '#000000',
    secondary: '#FFFFFF',
    accent: '#F5F5F5',
    
    // Neutral grays - carefully selected for luxury feel
    gray: {
      50: '#FAFAFA',
      100: '#F5F5F5', 
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#424242',
      800: '#212121',
      900: '#000000',
    },
    
    // Functional colors
    success: '#000000',
    error: '#000000',
    warning: '#757575',
    info: '#424242',
    
    // Background hierarchy
    background: '#FFFFFF',
    surface: '#FAFAFA',
    card: '#FFFFFF',
    
    // Text hierarchy
    text: {
      primary: '#000000',
      secondary: '#757575',
      tertiary: '#BDBDBD',
      inverse: '#FFFFFF',
    },
    
    // Interactive states
    interactive: {
      default: '#000000',
      hover: '#424242',
      pressed: '#757575',
      disabled: '#E0E0E0',
    }
  },
  
  typography: {
    // Font families - system fonts for clean look
    fontFamily: {
      regular: 'System',
      medium: 'System',
      semiBold: 'System', 
      bold: 'System',
    },
    
    // Font sizes - minimal scale
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
      '4xl': 32,
      '5xl': 40,
    },
    
    // Line heights
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
    
    // Font weights
    fontWeight: {
      normal: '400',
      medium: '500',
      semiBold: '600',
      bold: '700',
    }
  },
  
  spacing: {
    // Minimal spacing scale
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 40,
    '3xl': 48,
    '4xl': 64,
    '5xl': 80,
  },
  
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  shadows: {
    // Subtle, minimal shadows
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    }
  },
  
  layout: {
    // Consistent layout values
    screenPadding: 24,
    cardPadding: 20,
    sectionSpacing: 32,
    itemSpacing: 16,
  }
};

export type Theme = typeof theme;