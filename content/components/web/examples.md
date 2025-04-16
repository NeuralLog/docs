# Web Application Examples

This section provides examples of how to use the NeuralLog Web application in various scenarios.

## Basic Usage

The [Basic Usage Example](./examples/basic-usage.md) demonstrates how to set up and use the Web application for common tasks such as:

- Setting up the web application
- Configuring authentication
- Viewing and managing logs
- Managing users and permissions

## Advanced Examples

### Custom Authentication Integration

```typescript
// In your web application's authentication configuration
import { AuthConfig } from '@neurallog/web';

const authConfig: AuthConfig = {
  // Use Auth0 for authentication
  provider: 'auth0',
  auth0Config: {
    domain: 'your-domain.auth0.com',
    clientId: 'your-client-id',
    audience: 'https://api.neurallog.com',
    redirectUri: window.location.origin,
    onRedirectCallback: (appState) => {
      // Custom redirect handling
      window.history.replaceState(
        {},
        document.title,
        appState?.returnTo || window.location.pathname
      );
    },
    // Custom user profile handling
    getUserProfile: async (user) => {
      // Fetch additional user data from your backend
      const response = await fetch(`/api/users/${user.sub}`, {
        headers: {
          Authorization: `Bearer ${await auth0.getTokenSilently()}`
        }
      });

      const userData = await response.json();

      // Return enhanced user profile
      return {
        ...user,
        tenantId: userData.tenantId,
        role: userData.role,
        permissions: userData.permissions
      };
    }
  }
};

// Initialize the NeuralLog web application with custom auth
const neuralLogWeb = new NeuralLogWeb({
  auth: authConfig,
  apiBaseUrl: 'https://api.neurallog.com',
  tenantId: 'acme-corp'
});
```

### Custom Theme Integration

```typescript
// In your web application's theme configuration
import { ThemeConfig } from '@neurallog/web';

const themeConfig: ThemeConfig = {
  // Use a custom theme
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#dc004e',
      light: '#ff4081',
      dark: '#9a0036',
      contrastText: '#ffffff'
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500
    }
  },
  shape: {
    borderRadius: 8
  },
  // Custom components
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }
      }
    }
  }
};

// Initialize the NeuralLog web application with custom theme
const neuralLogWeb = new NeuralLogWeb({
  theme: themeConfig,
  apiBaseUrl: 'https://api.neurallog.com',
  tenantId: 'acme-corp'
});
```

### Custom Dashboard Integration

```typescript
// In your web application's dashboard configuration
import { DashboardConfig } from '@neurallog/web';
import { LineChart, BarChart, PieChart } from '@neurallog/web/charts';

const dashboardConfig: DashboardConfig = {
  // Define custom dashboard widgets
  widgets: [
    {
      id: 'error-rate',
      title: 'Error Rate',
      type: 'line-chart',
      size: { w: 6, h: 2 }, // Half width, 2 units height
      dataSource: {
        logName: 'application-logs',
        filter: {
          timeRange: 'last-24-hours',
          interval: '1h'
        },
        metrics: [
          {
            name: 'error-rate',
            formula: 'count(level="error") / count(*) * 100',
            label: 'Error Rate (%)'
          }
        ]
      },
      chartOptions: {
        yAxis: {
          min: 0,
          max: 100
        }
      }
    },
    {
      id: 'response-time',
      title: 'Average Response Time',
      type: 'line-chart',
      size: { w: 6, h: 2 }, // Half width, 2 units height
      dataSource: {
        logName: 'api-logs',
        filter: {
          timeRange: 'last-24-hours',
          interval: '1h'
        },
        metrics: [
          {
            name: 'avg-response-time',
            formula: 'avg(responseTime)',
            label: 'Avg Response Time (ms)'
          }
        ]
      }
    },
    {
      id: 'status-codes',
      title: 'HTTP Status Codes',
      type: 'pie-chart',
      size: { w: 4, h: 3 }, // One third width, 3 units height
      dataSource: {
        logName: 'api-logs',
        filter: {
          timeRange: 'last-24-hours'
        },
        metrics: [
          {
            name: 'status-codes',
            formula: 'count(*) group by statusCode',
            label: 'Status Codes'
          }
        ]
      }
    },
    {
      id: 'top-errors',
      title: 'Top Errors',
      type: 'table',
      size: { w: 8, h: 3 }, // Two thirds width, 3 units height
      dataSource: {
        logName: 'application-logs',
        filter: {
          timeRange: 'last-24-hours',
          query: 'level="error"',
          limit: 10
        },
        columns: [
          { field: 'timestamp', header: 'Time', format: 'datetime' },
          { field: 'service', header: 'Service' },
          { field: 'message', header: 'Error Message' },
          { field: 'stackTrace', header: 'Stack Trace', truncate: true }
        ]
      }
    }
  ]
};

// Initialize the NeuralLog web application with custom dashboard
const neuralLogWeb = new NeuralLogWeb({
  dashboard: dashboardConfig,
  apiBaseUrl: 'https://api.neurallog.com',
  tenantId: 'acme-corp'
});
```

### Zero-Knowledge Client Integration

```typescript
// In your web application's zero-knowledge configuration
import { ZeroKnowledgeConfig } from '@neurallog/web';
import { CryptoService } from '@neurallog/typescript-client-sdk';

const zkConfig: ZeroKnowledgeConfig = {
  // Enable zero-knowledge mode
  enabled: true,

  // Custom recovery phrase handling
  recoveryPhraseHandling: {
    // Store the recovery phrase in session storage (cleared when browser is closed)
    storage: 'session',

    // Custom validation
    validateRecoveryPhrase: (phrase) => {
      const cryptoService = new CryptoService();
      return cryptoService.getMnemonicService().validateMnemonic(phrase);
    },

    // Custom recovery phrase generation
    generateRecoveryPhrase: () => {
      const cryptoService = new CryptoService();
      return cryptoService.getMnemonicService().generateMnemonic(256); // 24 words
    }
  },

  // Custom key derivation
  keyDerivation: {
    // Use a custom crypto service implementation
    cryptoService: new CustomCryptoService(),

    // Custom initialization
    initialize: async (tenantId, recoveryPhrase) => {
      const cryptoService = new CryptoService();
      const masterSecret = await cryptoService.deriveMasterSecret(tenantId, recoveryPhrase);
      await cryptoService.deriveMasterKEK(masterSecret);

      // Return the initialized crypto service
      return cryptoService;
    }
  }
};

// Custom crypto service implementation
class CustomCryptoService extends CryptoService {
  // Override methods as needed
  async deriveMasterSecret(tenantId, recoveryPhrase) {
    // Custom implementation with additional security measures
    const baseSecret = await super.deriveMasterSecret(tenantId, recoveryPhrase);

    // Apply additional transformations
    // ...

    return baseSecret;
  }
}

// Initialize the NeuralLog web application with zero-knowledge configuration
const neuralLogWeb = new NeuralLogWeb({
  zeroKnowledge: zkConfig,
  apiBaseUrl: 'https://api.neurallog.com',
  tenantId: 'acme-corp'
});
```

## Next Steps

- Learn about [Configuration Options](./configuration.md)
- Explore the [API Reference](./api.md)
- Read about the [Architecture](./architecture.md)
