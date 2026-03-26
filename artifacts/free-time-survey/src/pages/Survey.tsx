import { useState, useId } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { US_STATES, COLLEGE_YEARS, HOBBY_OPTIONS } from "@/lib/states";
import Footer from "@/components/Footer";

type FormState = {
  hometown: string;
  state: string;
  collegeYear: string;
  hobbies: string[];
  otherHobby: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const PRIMARY = "hsl(270, 69%, 55%)";

const CONFIG_WARNING = (
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
          to your environment variables to enable the survey. See{" "}
          <code className="bg-muted px-1 rounded text-xs font-mono">
            .env.example
          </code>{" "}
          for reference.
        </p>
      </div>
    </main>
    <Footer />
  </div>
);

function SurveyForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    hometown: "",
    state: "",
    collegeYear: "",
    hobbies: [],
    otherHobby: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const fieldId = useId();
  const id = (name: string) => `${fieldId}-${name}`;

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.hometown.trim()) e.hometown = "Please enter your hometown.";
    if (!form.state) e.state = "Please select your state.";
    if (!form.collegeYear) e.collegeYear = "Please select your year.";
    if (form.hobbies.length === 0)
      e.hobbies = "Please select at least one hobby.";
    if (form.hobbies.includes("Other") && !form.otherHobby.trim()) {
      e.otherHobby = "Please describe your other hobby.";
    }
    return e;
  }

  function toggleHobby(hobby: string) {
    setForm((prev) => ({
      ...prev,
      hobbies: prev.hobbies.includes(hobby)
        ? prev.hobbies.filter((h) => h !== hobby)
        : [...prev.hobbies, hobby],
    }));
    if (errors.hobbies || errors.otherHobby) {
      setErrors((prev) => ({
        ...prev,
        hobbies: undefined,
        otherHobby: undefined,
      }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      document.getElementById(id(Object.keys(errs)[0]))?.focus();
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { error } = await supabase.from("survey_responses").insert({
        hometown: form.hometown.trim(),
        state: form.state,
        college_year: form.collegeYear,
        hobbies: form.hobbies,
        other_hobby:
          form.hobbies.includes("Other")
            ? form.otherHobby.trim() || null
            : null,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setForm({
      hometown: "",
      state: "",
      collegeYear: "",
      hobbies: [],
      otherHobby: "",
    });
    setErrors({});
    setSubmitError(null);
    setSubmitted(false);
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition";

  const errorClass = "mt-1 text-sm text-destructive";

  const displayHobbies = form.hobbies
    .map((h) => (h === "Other" && form.otherHobby.trim() ? form.otherHobby.trim() : h))
    .join(", ");

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="border-b border-border bg-card/80 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Home
              </Link>
              <span className="text-border">|</span>
              <span className="text-sm font-semibold text-foreground">
                Free Time Survey
              </span>
            </div>
            <Link
              to="/results"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View Results →
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center space-y-6">
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
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-foreground">
              Thank you for your response!
            </h1>
            <p className="text-muted-foreground text-sm">
              Your answers have been recorded.
            </p>

            <div className="bg-card border border-border rounded-xl p-5 text-left space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="text-muted-foreground min-w-[100px]">Hometown</span>
                <span className="text-foreground font-medium">
                  {form.hometown}, {form.state}
                </span>
              </div>
              <div className="flex gap-3">
                <span className="text-muted-foreground min-w-[100px]">Year</span>
                <span className="text-foreground font-medium">{form.collegeYear}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-muted-foreground min-w-[100px]">Hobbies</span>
                <span className="text-foreground font-medium">{displayHobbies}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                style={{ background: PRIMARY }}
              >
                Submit Another Response
              </button>
              <button
                onClick={() => navigate("/results")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-foreground bg-card border border-border transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                View Results →
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Back to home"
            >
              ← Back
            </Link>
            <span className="text-border">|</span>
            <span className="text-sm font-semibold text-foreground">
              Free Time Survey
            </span>
          </div>
          <Link
            to="/results"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View Results →
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Tell us about yourself
          </h1>
          <p className="text-muted-foreground text-sm">
            All fields are required unless noted.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate aria-label="Free Time Survey">
          <div className="space-y-8">
            {/* Hometown */}
            <fieldset className="space-y-1">
              <label
                htmlFor={id("hometown")}
                className="block text-sm font-medium text-foreground"
              >
                Hometown{" "}
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>
              </label>
              <input
                id={id("hometown")}
                type="text"
                autoFocus
                autoComplete="address-level2"
                placeholder="e.g. Springfield"
                value={form.hometown}
                onChange={(e) => {
                  setForm((p) => ({ ...p, hometown: e.target.value }));
                  if (errors.hometown)
                    setErrors((p) => ({ ...p, hometown: undefined }));
                }}
                aria-required="true"
                aria-describedby={
                  errors.hometown ? id("hometown-err") : undefined
                }
                aria-invalid={!!errors.hometown}
                className={
                  inputClass +
                  (errors.hometown
                    ? " border-destructive ring-destructive/20"
                    : "")
                }
              />
              {errors.hometown && (
                <p id={id("hometown-err")} className={errorClass} role="alert">
                  {errors.hometown}
                </p>
              )}
            </fieldset>

            {/* State */}
            <fieldset className="space-y-1">
              <label
                htmlFor={id("state")}
                className="block text-sm font-medium text-foreground"
              >
                Home State{" "}
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>
              </label>
              <select
                id={id("state")}
                value={form.state}
                onChange={(e) => {
                  setForm((p) => ({ ...p, state: e.target.value }));
                  if (errors.state)
                    setErrors((p) => ({ ...p, state: undefined }));
                }}
                aria-required="true"
                aria-describedby={errors.state ? id("state-err") : undefined}
                aria-invalid={!!errors.state}
                className={
                  inputClass +
                  " cursor-pointer" +
                  (errors.state ? " border-destructive ring-destructive/20" : "")
                }
              >
                <option value="">— Select a state —</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p id={id("state-err")} className={errorClass} role="alert">
                  {errors.state}
                </p>
              )}
            </fieldset>

            {/* College Year */}
            <fieldset
              aria-describedby={
                errors.collegeYear ? id("year-err") : undefined
              }
            >
              <legend className="block text-sm font-medium text-foreground mb-2">
                Year in College / Role{" "}
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COLLEGE_YEARS.map((year) => (
                  <label
                    key={year}
                    className={
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition " +
                      (form.collegeYear === year
                        ? "border-transparent ring-2 ring-ring bg-card"
                        : "border-border bg-card hover:bg-muted")
                    }
                  >
                    <input
                      type="radio"
                      name="collegeYear"
                      value={year}
                      checked={form.collegeYear === year}
                      onChange={() => {
                        setForm((p) => ({ ...p, collegeYear: year }));
                        if (errors.collegeYear)
                          setErrors((p) => ({
                            ...p,
                            collegeYear: undefined,
                          }));
                      }}
                      className="sr-only"
                    />
                    <span
                      className={
                        "flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center " +
                        (form.collegeYear === year
                          ? "border-primary"
                          : "border-muted-foreground")
                      }
                      aria-hidden="true"
                    >
                      {form.collegeYear === year && (
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: PRIMARY }}
                        />
                      )}
                    </span>
                    <span className="text-sm text-foreground">{year}</span>
                  </label>
                ))}
              </div>
              {errors.collegeYear && (
                <p
                  id={id("year-err")}
                  className={errorClass + " mt-2"}
                  role="alert"
                >
                  {errors.collegeYear}
                </p>
              )}
            </fieldset>

            {/* Hobbies */}
            <fieldset
              aria-describedby={errors.hobbies ? id("hobbies-err") : undefined}
            >
              <legend className="block text-sm font-medium text-foreground mb-2">
                Free-Time Hobbies{" "}
                <span className="font-normal text-muted-foreground">
                  (select all that apply)
                </span>{" "}
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {HOBBY_OPTIONS.map((hobby) => {
                  const checked = form.hobbies.includes(hobby);
                  return (
                    <label
                      key={hobby}
                      className={
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition " +
                        (checked
                          ? "border-transparent ring-2 ring-ring bg-card"
                          : "border-border bg-card hover:bg-muted")
                      }
                    >
                      <input
                        type="checkbox"
                        value={hobby}
                        checked={checked}
                        onChange={() => toggleHobby(hobby)}
                        className="sr-only"
                      />
                      <span
                        className={
                          "flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center " +
                          (checked ? "border-transparent" : "border-muted-foreground")
                        }
                        style={
                          checked
                            ? { background: PRIMARY, border: "none" }
                            : {}
                        }
                        aria-hidden="true"
                      >
                        {checked && (
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                          >
                            <path
                              d="M2 5l2.5 2.5L8 3"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      <span className="text-sm text-foreground">{hobby}</span>
                    </label>
                  );
                })}
              </div>
              {errors.hobbies && (
                <p
                  id={id("hobbies-err")}
                  className={errorClass + " mt-2"}
                  role="alert"
                >
                  {errors.hobbies}
                </p>
              )}

              {form.hobbies.includes("Other") && (
                <div className="mt-3 space-y-1">
                  <label
                    htmlFor={id("otherHobby")}
                    className="block text-sm font-medium text-foreground"
                  >
                    Please describe your other hobby{" "}
                    <span aria-hidden="true" className="text-destructive">
                      *
                    </span>
                  </label>
                  <input
                    id={id("otherHobby")}
                    type="text"
                    autoFocus
                    placeholder="e.g. Rock climbing"
                    value={form.otherHobby}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, otherHobby: e.target.value }));
                      if (errors.otherHobby)
                        setErrors((p) => ({ ...p, otherHobby: undefined }));
                    }}
                    aria-required="true"
                    aria-describedby={
                      errors.otherHobby ? id("otherHobby-err") : undefined
                    }
                    aria-invalid={!!errors.otherHobby}
                    className={
                      inputClass +
                      (errors.otherHobby
                        ? " border-destructive ring-destructive/20"
                        : "")
                    }
                  />
                  {errors.otherHobby && (
                    <p
                      id={id("otherHobby-err")}
                      className={errorClass}
                      role="alert"
                    >
                      {errors.otherHobby}
                    </p>
                  )}
                </div>
              )}
            </fieldset>
          </div>

          {submitError && (
            <div
              role="alert"
              className="mt-6 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive"
            >
              {submitError}
            </div>
          )}

          <div className="mt-8">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: PRIMARY }}
            >
              {submitting ? (
                <>
                  <svg
                    className="animate-spin"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Submitting…
                </>
              ) : (
                <>
                  Submit Survey
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
                </>
              )}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

export default function Survey() {
  if (!supabaseConfigured) return CONFIG_WARNING;
  return <SurveyForm />;
}
