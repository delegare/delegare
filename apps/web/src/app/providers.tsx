"use client";

import { Amplify } from 'aws-amplify';
import { ThemeProvider } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || 'us-east-1_xxxxxxxxx',
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || 'xxxxxxxxxxxxxxxxxxxxxx',
      loginWith: {
        email: true,
        oauth: {
          domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || 'delegare-dev.auth.us-east-2.amazoncognito.com',
          scopes: ['phone', 'email', 'profile', 'openid'],
          redirectSignIn: [process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://app.delegare.dev')],
          redirectSignOut: [process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://app.delegare.dev')],
          responseType: 'code',
          providers: ['Google'],
        },
      },
    },
  },
});

const theme = {
  name: 'delegare-theme',
  tokens: {
    colors: {
      font: {
        primary: { value: '#f0ede8' },
        secondary: { value: 'rgba(240,237,232,0.5)' },
        interactive: { value: '#c8b99a' },
      },
      brand: {
        primary: {
          10: { value: 'rgba(200,185,154,0.1)' },
          80: { value: '#c8b99a' },
          90: { value: '#bdae8d' },
          100: { value: '#a6987a' },
        },
      },
      background: {
        primary: { value: '#0c0c0c' },
        secondary: { value: 'rgba(240,237,232,0.02)' },
      },
      border: {
        primary: { value: 'rgba(240,237,232,0.08)' },
        secondary: { value: 'rgba(240,237,232,0.14)' },
        focus: { value: '#c8b99a' },
      },
    },
    components: {
      authenticator: {
        container: {
          backgroundColor: { value: '#0c0c0c' },
        },
        router: {
          borderWidth: { value: '1px' },
          borderColor: { value: 'rgba(240,237,232,0.08)' },
          borderStyle: { value: 'solid' },
          backgroundColor: { value: 'rgba(240,237,232,0.02)' },
          borderRadius: { value: '16px' },
          boxShadow: { value: '0 4px 24px rgba(0,0,0,0.4)' },
        },
      },
      button: {
        primary: {
          backgroundColor: { value: 'rgba(200,185,154,0.1)' },
          borderColor: { value: 'rgba(200,185,154,0.3)' },
          borderWidth: { value: '1px' },
          color: { value: '#c8b99a' },
          _hover: {
            backgroundColor: { value: 'rgba(200,185,154,0.15)' },
            borderColor: { value: '#c8b99a' },
            color: { value: '#f0ede8' },
          },
        },
        link: {
          color: { value: '#c8b99a' },
          _hover: {
            color: { value: '#f0ede8' },
          },
        },
      },
      fieldcontrol: {
        borderColor: { value: 'rgba(240,237,232,0.15)' },
        color: { value: '#f0ede8' },
        _focus: {
          borderColor: { value: '#c8b99a' },
          boxShadow: { value: '0 0 0 1px rgba(200,185,154,0.5)' },
        },
      },
      tabs: {
        item: {
          color: { value: 'rgba(240,237,232,0.4)' },
          borderColor: { value: 'transparent' },
          _hover: {
            color: { value: '#f0ede8' },
          },
          _active: {
            color: { value: '#f0ede8' },
            borderColor: { value: '#c8b99a' },
          },
        },
      },
      heading: {
        color: { value: '#f0ede8' },
      },
    },
    radii: {
      small: { value: '8px' },
      medium: { value: '12px' },
      large: { value: '16px' },
    },
  },
};

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme as any}>
      {children}
    </ThemeProvider>
  );
}
