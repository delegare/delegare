"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

function LoginContent() {
  const router = useRouter();
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      window.location.href = "https://app.delegare.dev";
    }
  }, [authStatus]);

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0c0c0c", padding: "20px" }}>
      <div style={{ maxWidth: "460px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <a href="/" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "32px", color: "#f0ede8", textDecoration: "none", letterSpacing: "-0.5px" }}>
            delegare<span style={{ color: "#c8b99a" }}>.</span>
          </a>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "rgba(240,237,232,0.5)", marginTop: "8px" }}>
            Sign in to your merchant dashboard
          </p>
        </div>
        
        <Authenticator 
          loginMechanisms={['email']}
          socialProviders={['google']}
          signUpAttributes={['email']}
        >
          {({ signOut, user }) => (
            <div style={{ textAlign: "center", fontFamily: "'DM Sans', sans-serif", color: "#f0ede8" }}>
              <p>Redirecting to dashboard...</p>
            </div>
          )}
        </Authenticator>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Authenticator.Provider>
      <LoginContent />
    </Authenticator.Provider>
  );
}
