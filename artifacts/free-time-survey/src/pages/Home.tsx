import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const PRIMARY = "hsl(270, 69%, 55%)";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center space-y-6">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-2"
            style={{ background: "hsl(270 67% 55% / 0.12)" }}
            aria-hidden="true"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke={PRIMARY}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Free Time Survey
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Tell us about yourself! This quick survey collects information about
            your hometown, where you are in your academic journey, and how you
            spend your free time.
          </p>

          <p className="text-sm text-muted-foreground">
            Takes about 1 minute &mdash; completely anonymous.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              to="/survey"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-full sm:w-auto"
              style={{ background: PRIMARY }}
            >
              Take the Survey
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              to="/results"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-foreground bg-card border border-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-full sm:w-auto"
            >
              View Results
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
