import Navbar from "../components/layout/Navbar";
import {
  Shield,
  Brain,
  Database,
  Users,
} from "lucide-react";

export default function PrivacyPolicyPage() {
    const data = [
            {
              title: "Data We Collect",
              content: (
                <ul className="list-disc space-y-2 pl-5">
                  <li>Name, email and account information.</li>
                  <li>Goals, skill level and learning preferences.</li>
                  <li>Roadmaps, milestones, daily tasks and progress history.</li>
                  <li>Community memberships and interactions.</li>
                  <li>Device, browser and usage analytics.</li>
                </ul>
              ),
            },
            {
              title: "How We Use Your Data",
              content: (
                <ul className="list-disc space-y-2 pl-5">
                  <li>Create personalized AI roadmaps.</li>
                  <li>Generate daily tasks and milestones.</li>
                  <li>Track progress and consistency.</li>
                  <li>Provide reminders and accountability insights.</li>
                  <li>Improve platform performance and security.</li>
                </ul>
              ),
            },
            {
              title: "How AI Powers Your Experience",
              content: (
                <p>
                  Our AI analyzes goals, schedules, progress patterns,
                  and learning behavior to generate personalized
                  roadmaps and adaptive recommendations. AI helps
                  optimize your learning journey but does not replace
                  personal decision-making.
                </p>
              ),
            },
            {
              title: "Community Features",
              content: (
                <p>
                  When you join organizations, certain profile
                  information, achievements, and progress updates may
                  be visible to other members depending on your
                  privacy settings.
                </p>
              ),
            },
            {
              title: "Third-Party Services",
              content: (
                <p>
                  We work with trusted providers for hosting,
                  authentication, analytics, payments, and AI
                  processing. These providers only process data
                  necessary to deliver the platform.
                </p>
              ),
            },
            {
              title: "Data Storage & Retention",
              content: (
                <p>
                  We retain your information while your account is
                  active. You may request account deletion and data
                  removal at any time.
                </p>
              ),
            },
            {
              title: "Your Privacy Controls",
              content: (
                <ul className="list-disc space-y-2 pl-5">
                  <li>Update account information.</li>
                  <li>Export your data.</li>
                  <li>Delete your account.</li>
                  <li>Manage notification preferences.</li>
                </ul>
              ),
            },
            {
              title: "Contact",
              content: (
                <p>
                  Questions about privacy?
                  <br />
                  Contact us at:
                  <span className="ml-2 text-orange-400">
                    vectorofficalorg@gmail.com
                  </span>
                </p>
              ),
            },
          ];
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-24">
        {/* HERO */}

        <div className="mb-8">
          <div className="inline-flex rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm text-orange-400">
            Privacy & Trust
          </div>

          <div className="mt-4 text-4xl font-bold tracking-tight">
            Privacy Policy - Vector
          </div>
          <p className="mt-4 max-w-3xl text-xl text-zinc-400 leading-relaxed">
            We collect only the information required to generate
            personalized roadmaps, track progress, power AI
            recommendations, and help you achieve your goals safely
            and securely.
          </p>

        </div>


        {/* CONTENT */}

        <div className="space-y-8">
          {data.map((section, index) => (
            <div
              key={section.title}
              className="rounded-3xl border border-white/10 bg-zinc-950 p-6"
            >
              <h2 className="text-2xl font">
                <span className="mr-3 text-white/40">{index + 1}.</span>
                {section.title}
              </h2>

              <div className="mt-3 text-zinc-400 leading-relaxed">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}