import { createFileRoute } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: LoginScreen });

const LABELS: Record<string, string> = {
  Google: "המשיכו עם Google",
  X: "המשיכו עם X",
};

export function LoginScreen() {
  return (
    <main className="grid min-h-dvh bg-bg lg:grid-cols-2">
      <section className="flex flex-col justify-center px-6 py-12 lg:px-16">
        <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-lg">
          <p className="text-sm font-medium tracking-wide text-muted">קופה</p>
          <h1 className="mt-3 text-4xl font-medium leading-tight tracking-tight lg:text-5xl">
            התקציב שלכם,
            <br />
            במקום אחד.
          </h1>
          <p className="mt-4 max-w-sm text-muted">
            הוצאות והכנסות באותו רגע מהטלפון או מהמחשב. שניכם רואים את אותו תקציב
            מול בפועל.
          </p>
        </div>
      </section>

      <section className="flex flex-col justify-center px-6 pb-12 lg:border-s lg:border-line lg:px-16 lg:py-12">
        <div className="mx-auto flex w-full max-w-md flex-col gap-3 lg:mx-0">
          <p className="mb-1 text-sm font-medium">כניסה</p>
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="outline"
                size="lg"
                className="w-full justify-center"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
              >
                {p.label === "Google" ? <GoogleMark /> : <XMark />}
                {LABELS[p.label] ?? `המשיכו עם ${p.label}`}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted">ההתחברות כבויה כרגע.</p>
          )}
        </div>
      </section>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09A6.97 6.97 0 0 1 5.48 12c0-.72.12-1.43.36-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function XMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden fill="currentColor">
      <path d="M18.9 2H22l-6.77 7.74L23 22h-6.17l-4.82-6.3L6.3 22H3.18l7.24-8.28L1 2h6.32l4.36 5.77L18.9 2Zm-1.08 18.2h1.7L6.27 3.7H4.44l13.38 16.5Z" />
    </svg>
  );
}
