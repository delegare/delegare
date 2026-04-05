"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { fetchAuthSession } from "aws-amplify/auth";
import "@aws-amplify/ui-react/styles.css";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthReqId = searchParams.get('oauthReqId');
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  const [isApproving, setIsApproving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (authStatus === 'authenticated' && !isApproving) {
      if (oauthReqId) {
        setIsApproving(true);
        // Approve the OAuth request using the valid session token
        fetchAuthSession().then((session) => {
          const token = session.tokens?.idToken?.toString() || session.tokens?.accessToken?.toString();
          
          fetch("https://api.delegare.dev/v1/oauth2/approve", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ oauthReqId })
          })
          .then(res => res.json())
          .then(data => {
            if (data.redirectUri) {
              window.location.href = data.redirectUri;
            } else {
              setErrorMsg(data.error_description || data.message || "Failed to approve authorization.");
              setIsApproving(false);
            }
          })
          .catch(err => {
            console.error(err);
            setErrorMsg("An error occurred during approval.");
            setIsApproving(false);
          });
        }).catch(() => {
          setIsApproving(false);
        });
      } else {
        window.location.href = "https://app.delegare.dev";
      }
    }
  }, [authStatus, oauthReqId, isApproving]);

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0c0c0c", padding: "20px" }}>
      <div style={{ maxWidth: "460px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <a href="/" style={{ fontFamily: "'DM Serif Display', serif", fontSize: "32px", color: "#f0ede8", textDecoration: "none", letterSpacing: "-0.5px" }}>
            delegare<span style={{ color: "#c8b99a" }}>.</span>
          </a>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "rgba(240,237,232,0.5)", marginTop: "8px" }}>
            {oauthReqId ? "Sign in to connect Delegare to your AI agent" : "Sign in to your merchant dashboard"}
          </p>
        </div>
        
        {errorMsg && (
          <div style={{ color: "#ff4d4f", textAlign: "center", marginBottom: "20px", fontFamily: "'DM Sans', sans-serif" }}>
            {errorMsg}
          </div>
        )}

        <Authenticator 
          loginMechanisms={['email']}
          socialProviders={['google']}
          signUpAttributes={['email']}
        >
          {({ signOut, user }) => (
            <div style={{ textAlign: "center", fontFamily: "'DM Sans', sans-serif", color: "#f0ede8" }}>
              <p>{oauthReqId ? "Approving connection..." : "Redirecting to dashboard..."}</p>
            </div>
          )}
        </Authenticator>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Authenticator.Provider>
        <LoginContent />
      </Authenticator.Provider>
    </Suspense>
  );
}
