import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SLUG = "central-ux-r12-live-candidate";
const BUILD = "CR-CENTRAL-OP-V2-UX-NAV-R1.2-REDIRECT-HOTFIX-20261005";
const PREVIEW = "https://rogeriocibin-alt.github.io/construrei-oauth-pages/preview/central-ux-navigation-r1-candidate-20261005/";
const MEET = "https://meet.google.com/xtw-rihq-jwi";

function commonHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    "Pragma": "no-cache",
    "Access-Control-Allow-Origin": "*",
    "X-CONSTRUREI-Build": BUILD,
    "X-CONSTRUREI-Candidate": "UX-R1.2-REDIRECT-HOTFIX"
  };
}

Deno.serve((req: Request) => {
  const u = new URL(req.url);
  const marker = `/functions/v1/${SLUG}`;
  let sub = u.pathname.startsWith(marker) ? u.pathname.slice(marker.length) : "/";
  if (!sub) sub = "/";

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        ...commonHeaders(),
        "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS"
      }
    });
  }

  if (u.searchParams.get("check") === "1") {
    return new Response(JSON.stringify({
      ok: true,
      build: BUILD,
      source: "github-pages-preview",
      official_untouched: true,
      legacy_webrtc: false,
      meeting_engine: "GOOGLE_MEET_HOMOLOGATED",
      render_mode: "redirect",
      test_url: PREVIEW
    }), {
      headers: {
        ...commonHeaders(),
        "Content-Type": "application/json; charset=utf-8"
      }
    });
  }

  if (sub === "/call" || sub === "/call/") {
    return new Response(null, {
      status: 302,
      headers: {
        ...commonHeaders(),
        "Location": MEET
      }
    });
  }

  const safeSub = sub === "/" ? "" : sub.replace(/^\/+/, "");
  const target = new URL(safeSub, PREVIEW);
  u.searchParams.forEach((value, key) => {
    if (key !== "check") target.searchParams.set(key, value);
  });
  target.searchParams.set("_crlive", Date.now().toString());

  return new Response(null, {
    status: 302,
    headers: {
      ...commonHeaders(),
      "Location": target.toString(),
      "Content-Disposition": "inline"
    }
  });
});