# Frontend Application Setup

## Overview
This is a modern React TypeScript frontend application built with Vite, designed to integrate with Laravel/Flask backend APIs. The application includes authentication, dashboard, and analysis modules for energy management systems.

## Technology Stack
- **React 18** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for styling
- **shadcn/ui** for component library
- **TanStack Query** for API state management
- **React Router** for navigation
- **React Hook Form** with Zod validation
- **Lucide React** for icons

## Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── Layout.tsx       # Main application layout
│   │   ├── LoginForm.tsx    # Authentication form
│   │   └── LoginIllustration.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── FidderAnalysis.tsx
│   │   ├── EnergyComparison.tsx
│   │   ├── LoadDistribution.tsx
│   │   ├── LoginPage.tsx
│   │   ├── Index.tsx
│   │   └── NotFound.tsx
│   ├── hooks/
│   │   ├── useCSRF.ts       # CSRF token management
│   │   └── use-toast.ts     # Toast notifications
│   ├── lib/
│   │   ├── api.ts           # API configuration and services
│   │   └── utils.ts         # Utility functions
│   ├── App.tsx              # Main app component with routing
│   └── main.tsx             # Application entry point
├── public/
│   └── config.json          # API configuration
└── package.json
```

## Available Routes

### Public Routes
- `/` - Landing/Index page
- `/login` - Authentication page

### Protected Routes (with Layout)
- `/dashboard` - Main dashboard with system overview
- `/fidder-analysis` - Fidder analysis tools and calculations
- `/energy-comparison` - Energy source comparison and efficiency analysis
- `/load-distribution` - Load distribution analysis and optimization

## API Integration

### Configuration
The application uses a dynamic API configuration system:

1. **Config Endpoint**: `/config.json` provides the API base URL
2. **CSRF Protection**: All POST requests include CSRF tokens
3. **Error Handling**: Comprehensive error handling with user feedback

### Endpoints Structure
```typescript
// GET endpoints for data fetching
GET /dashboard
GET /fidder-analysis
GET /energy-comparison
GET /load-distribution

// POST endpoints for calculations
POST /fidder-analysis-calculation
POST /energy-comparison-calculation
POST /load-distribution-calculation

// Authentication
GET /csrf-token
POST /login
```

### API Service Usage
```typescript
import { apiService } from '@/lib/api';

// Fetch data
const dashboardData = await apiService.getDashboard();

// Perform calculations with CSRF protection
const result = await apiService.calculateFidderAnalysis(data, csrfToken);
```

## Key Features

### 1. Authentication System
- CSRF token protection
- Automatic token refresh
- Login form with validation
- Redirect to dashboard on success

### 2. Dashboard
- System metrics overview
- Real-time status indicators
- Quick action buttons
- Recent activity feed

### 3. Analysis Modules
Each analysis module includes:
- Data fetching from API
- Interactive calculation forms
- Real-time results display
- Historical data visualization
- Form validation with Zod schemas

### 4. Responsive Design
- Mobile-first approach
- Collapsible sidebar navigation
- Responsive grid layouts
- Touch-friendly interfaces

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Build for development
npm run build:dev

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Component Usage Examples

### Using the CSRF Hook
```typescript
import { useCSRF } from '@/hooks/useCSRF';

const MyComponent = () => {
  const { csrfToken, isLoading, error, refreshToken } = useCSRF();
  
  // Use csrfToken in API calls
  if (csrfToken) {
    // Make authenticated request
  }
};
```

### API Integration with TanStack Query
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiService } from '@/lib/api';

const MyComponent = () => {
  // Fetch data
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-data'],
    queryFn: apiService.getDashboard,
  });

  // Perform mutations
  const mutation = useMutation({
    mutationFn: (data) => apiService.calculateSomething(data, csrfToken),
    onSuccess: () => {
      // Handle success
    },
  });
};
```

### Form Handling with React Hook Form
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  field1: z.string().min(1, 'Required'),
  field2: z.string().min(1, 'Required'),
});

const MyForm = () => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { field1: '', field2: '' },
  });

  const onSubmit = (data) => {
    // Handle form submission
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  );
};
```

## Backend Integration Notes

### For Laravel Backend
1. Ensure CORS is properly configured
2. CSRF token endpoint should return: `{'csrf_token': token}`
3. Login endpoint should accept email/password and return success status

### For Flask Transition
1. Update `/config.json` to point to Flask API base URL
2. Ensure Flask implements the same endpoint structure
3. Maintain CSRF token functionality

## Environment Configuration

The application supports different environments through Vite's environment system:

```bash
# Development
npm run dev

# Production build
npm run build

# Development build (for testing)
npm run build:dev
```

## Error Handling
- Network errors are caught and displayed to users
- CSRF token failures trigger automatic refresh
- Form validation errors are shown inline
- Loading states provide user feedback

## Performance Optimizations
- Lazy loading of route components
- Optimized bundle splitting with Vite
- Efficient re-rendering with React Query
- Responsive image loading
- Minimal bundle size with tree shaking

## Security Features
- CSRF protection on all POST requests
- Secure authentication flow
- Input validation with Zod schemas
- XSS protection through React's built-in escaping
- Secure cookie handling (configured on backend)

This frontend application is ready for production use and can seamlessly integrate with both Laravel and Flask backends through the configurable API system. 