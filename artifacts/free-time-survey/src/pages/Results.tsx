import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { supabase, supabaseConfigured, type SurveyResponse } from "@/lib/supabase";
import { COLLEGE_YEARS } from "@/lib/states";
import Footer from "@/components/Footer";

const PRIMARY = "hsl(270, 69%, 55%)";
const CHART_COLORS = [
  "hsl(270, 69%, 55%)",
  "hsl(270, 55%, 65%)",
  "hsl(300, 55%, 55%)",
  "hsl(240, 60%, 60%)",
  "hsl(200, 65%, 55%)",
  "hsl(270, 45%, 48%)",
  "hsl(310, 50%, 58%)",
  "hsl(220, 65%, 58%)",
];

type CountEntry = { label: string; count: number; pct?: string };

function countHobbies(responses: SurveyResponse[]): CountEntry[] {
  const map: Record<string, number> = {};
  for (const r of responses) {
    if (!r.hobbies) continue;
    for (const h of r.hobbies) {
      if (h === "Other") {
        const custom = r.other_hobby?.trim();
        if (custom) {
          const normalized = custom.toLowerCase();
          map[normalized] = (map[normalized] ?? 0) + 1;
        }
      } else {
        map[h] = (map[h] ?? 0) + 1;
      }
    }
  }
  return Object.entries(map)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function countStates(
  responses: SurveyResponse[],
  total: number
): CountEntry[] {
  const map: Record<string, number> = {};
  for (const r of responses) {
    if (r.state) map[r.state] = (map[r.state] ?? 0) + 1;
  }
  return Object.entries(map)
    .map(([label, count]) => ({
      label,
      count,
      pct: total > 0 ? ((count / total) * 100).toFixed(1) + "%" : "0%",
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function countYears(responses: SurveyResponse[]): CountEntry[] {
  const map: Record<string, number> = {};
  for (const r of responses) {
    if (r.college_year) map[r.college_year] = (map[r.college_year] ?? 0) + 1;
  }
  return COLLEGE_YEARS.map((label) => ({
    label,
    count: map[label] ?? 0,
  }));
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const headingId = title.replace(/\s+/g, "-").toLowerCase();
  return (
    <section
      className="bg-card rounded-xl border border-border p-6 space-y-4"
      aria-labelledby={headingId}
    >
      <div>
        <h2 id={headingId} className="text-lg font-semibold text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function HorizontalBar({
  data,
  showPct,
}: {
  data: CountEntry[];
  showPct?: boolean;
}) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No data yet.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={Math.max(data.length * 44, 100)}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: showPct ? 56 : 24, bottom: 0, left: 0 }}
      >
        <CartesianGrid horizontal={false} stroke="hsl(0 0% 88%)" />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fontSize: 12, fill: "hsl(0 0% 46%)" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={140}
          tick={{ fontSize: 12, fill: "hsl(0 0% 20%)" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: "hsl(270 67% 55% / 0.06)" }}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid hsl(0 0% 88%)",
            fontSize: 13,
          }}
          formatter={(value: number, _: string, entry: { payload?: CountEntry }) => {
            const pct = entry?.payload?.pct;
            return [pct ? `${value} (${pct})` : value, "Responses"];
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
          {showPct && (
            <LabelList
              dataKey="pct"
              position="right"
              style={{ fontSize: 11, fill: "hsl(0 0% 46%)" }}
            />
          )}
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function VerticalBar({ data }: { data: CountEntry[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No data yet.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={data}
        margin={{ top: 4, right: 16, bottom: 32, left: 0 }}
      >
        <CartesianGrid vertical={false} stroke="hsl(0 0% 88%)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "hsl(0 0% 20%)" }}
          tickLine={false}
          axisLine={false}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={48}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: "hsl(0 0% 46%)" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: "hsl(270 67% 55% / 0.06)" }}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid hsl(0 0% 88%)",
            fontSize: 13,
          }}
          formatter={(value: number) => [value, "Responses"]}
        />
        <Bar
          dataKey="count"
          fill={PRIMARY}
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function ResultsContent() {
  const navigate = useNavigate();
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResponses() {
      try {
        const { data, error } = await supabase
          .from("survey_responses")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setResponses(data ?? []);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Could not load results."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchResponses();
  }, []);

  const total = responses.length;
  const stateCounts = countStates(responses, total);
  const yearCounts = countYears(responses);
  const hobbyCounts = countHobbies(responses);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-foreground bg-card border border-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              ← Home
            </Link>
            <span className="text-border hidden sm:inline">|</span>
            <span className="text-sm font-semibold text-foreground hidden sm:inline">
              Survey Results
            </span>
          </div>
          <Link
            to="/survey"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ background: PRIMARY }}
          >
            Take Survey
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10 space-y-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Responses", value: loading ? "—" : total },
            {
              label: "States Represented",
              value: loading ? "—" : Object.keys(
                responses.reduce((acc, r) => { if (r.state) acc[r.state] = 1; return acc; }, {} as Record<string, number>)
              ).length,
            },
            {
              label: "Top Hobby",
              value:
                loading || hobbyCounts.length === 0
                  ? "—"
                  : hobbyCounts[0].label,
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-card border border-border rounded-xl p-4"
            >
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20 text-muted-foreground gap-3">
            <svg
              className="animate-spin"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Loading results…
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        {!loading && !error && total === 0 && (
          <div className="text-center py-16 space-y-3">
            <p className="text-muted-foreground">No responses yet.</p>
            <button
              onClick={() => navigate("/survey")}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: PRIMARY }}
            >
              Be the first to respond →
            </button>
          </div>
        )}

        {!loading && !error && total > 0 && (
          <>
            <SectionCard
              title="Year in College / Role"
              subtitle={`${total} response${total !== 1 ? "s" : ""}`}
            >
              <VerticalBar data={yearCounts} />
            </SectionCard>

            <SectionCard
              title="Free-Time Hobbies"
              subtitle="Respondents could select multiple"
            >
              <HorizontalBar data={hobbyCounts} />
            </SectionCard>

            <SectionCard
              title="Home States"
              subtitle={`Top ${Math.min(10, stateCounts.length)} of ${Object.keys(responses.reduce((a, r) => { if (r.state) a[r.state] = 1; return a; }, {} as Record<string, number>)).length} states represented`}
            >
              <HorizontalBar data={stateCounts} showPct />
            </SectionCard>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

const RESULTS_CONFIG_WARNING = (
  <div className="min-h-screen flex flex-col bg-background">
    <main className="flex-1 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-4 py-20">
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-600 mb-2"
          aria-hidden="true"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          Supabase Not Configured
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Add{" "}
          <code className="bg-muted px-1 rounded text-xs font-mono">
            VITE_SUPABASE_URL
          </code>{" "}
          and{" "}
          <code className="bg-muted px-1 rounded text-xs font-mono">
            VITE_SUPABASE_ANON_KEY
          </code>{" "}
          to your environment variables to see survey results.
        </p>
      </div>
    </main>
    <Footer />
  </div>
);

export default function Results() {
  if (!supabaseConfigured) return RESULTS_CONFIG_WARNING;
  return <ResultsContent />;
}
