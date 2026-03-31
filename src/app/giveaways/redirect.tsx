"use client";

import { useEffect } from "react";

// April Fool's :D

const GIVEAWAYS_REDIRECT_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

export default function GiveawaysRedirect() {
  useEffect(() => {
    window.location.replace(GIVEAWAYS_REDIRECT_URL);
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <p>Redirecting to the giveaway page...</p>
      <p>
        If you are not redirected,{" "}
        <a href={GIVEAWAYS_REDIRECT_URL}>click here</a>.
      </p>
    </main>
  );
}
