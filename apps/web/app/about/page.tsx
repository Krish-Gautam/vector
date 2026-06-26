"use client";
import Link from "next/link";
import { FaInstagram, FaLinkedin } from "react-icons/fa6";
import Navbar from "../components/layout/Navbar";
import Image from "next/image";

const team = [
  {
    name: "Krish Gautam",
    role: "Founder & Dev",
    image: "/krish.jpeg",
    instagram: "https://www.instagram.com/k.rishh__?igsh=MW8xNzBuNWZ1cXZpdg==",
    linkedin:
      "https://www.linkedin.com/in/krish-gautam-4662b7334?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    initial: "K",
  },
  {
    name: "Divy Prakash Singh",
    role: "Dev",
    image: "/divy.jpeg",
    instagram:
      "https://www.instagram.com/divy.prakash.singh?igsh=MW8xNzBuNWZ1cXZpdg==",
    linkedin:
      "https://www.linkedin.com/in/divy-prakash-singh-535881404?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    initial: "D",
  },
  {
    name: "Parul Yadav",
    role: "Product Manager",
    image: "/parul.jpeg",
    instagram: "https://www.instagram.com/_ydv_parul_?igsh=YnhpdXB4N3l1N3Zx",
    linkedin:
      "https://www.linkedin.com/in/parul-yadav-9bb8b4320?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    initial: "P",
  },
  {
    name: "Rahul Hudda",
    role: "Media Head",
    image: "/rahul.jpeg",
    instagram: "https://instagram.com/rahul",
    linkedin:
      "https://www.linkedin.com/in/rahul-hudda-a28821336?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    initial: "R",
  },
  {
    name: "Ayush Yadav",
    role: "Media Head",
    image: "/ayush.jpeg",
    instagram: "https://instagram.com/ayush",
    linkedin:
      "https://www.linkedin.com/in/ayush-yadav-67a985378?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    initial: "A",
  },
];

const values = [
  {
    title: "Clear Roadmaps",
    desc: "Turn any ambiguous goal into structured, actionable steps you can actually follow.",
  },
  {
    title: "Accountability Together",
    desc: "Organizations bring people with shared goals together to progress as a community.",
  },
  {
    title: "Consistent Progress",
    desc: "Track every step and build momentum to turn goals into achievements.",
  },
];

export default function AboutSection() {
  return (
    <section className="relative overflow-hidden bg-[#080808] text-white font-(family-name:--font-inter)">
      <Navbar />

      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-32 h-[500px] w-[500px] rounded-full bg-violet-500/5 blur-[160px]" />
        <div className="absolute -right-32 bottom-16 h-[400px] w-[400px] rounded-full bg-violet-500/8 blur-[160px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 pb-24">
        {/* ── HERO ── */}
        <div className="pt-28 pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-white/40 mb-7">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 block" />
            Our Story
          </div>
          <h1 className=" text-4xl  leading-[1.06] tracking-tight text-white">
            Welcome to{" "}
            <em className="italic text-violet-400 not-italic">Vector</em>
          </h1>
        </div>

        {/* ── STORY ── */}
        <div className=" max-w-[900px] space-y-5 text-[15px] leading-[1.85] text-white/50">
          <p>
            We're a group of students from{" "}
            <span className="text-white/80 font-medium">
              NIT Kurukshetra (2028 Batch)
            </span>{" "}
            who built this platform after facing the same challenges ourselves.
          </p>
          <p>
            Most people don't struggle because they lack ambition—they struggle
            because{" "}
            <span className="text-white/80 font-medium">
              staying consistent is hard.
            </span>{" "}
            We found ourselves jumping between resources, making plans we never
            followed, and losing momentum along the way.
          </p>
          <p>
            That's why we created this platform: a place where anyone can turn a
            goal into a{" "}
            <span className="text-white/80 font-medium">clear roadmap</span>,
            track their progress, and stay focused on what matters.
          </p>
          <p>
            One feature we're especially excited about is{" "}
            <span className="text-white/80 font-medium">Organizations</span>
            —bringing people with similar goals together so they can share
            progress, learn from each other, and stay accountable.
          </p>
          <p>
            We're still students, still learning, and still improving every day.
            Our goal is simple: help people stay consistent and{" "}
            <span className="text-white/80 font-medium">
              turn goals into achievements.
            </span>
          </p>
        </div>

        {/* ── DIVIDER ── */}
        <div className="my-16 h-px w-full bg-white/[0.07]" />

        {/* ── VALUES ── */}
        <p className="mb-8 text-[11px] uppercase tracking-[0.2em] text-white/25">
          What drives us
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {values.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl border border-white/[0.07] bg-[#0f0f0f] p-6"
            >
              <p className="mb-2 text-[13px] font-medium text-white">
                {v.title}
              </p>
              <p className="text-[12px] leading-[1.7] text-white/40">
                {v.desc}
              </p>
            </div>
          ))}
        </div>

        {/* ── DIVIDER ── */}
        <div className="my-16 h-px w-full bg-white/[0.07]" />

        {/* ── TEAM ── */}
        <div className="flex items-baseline gap-3 mb-12">
          <h2 className="font-serif text-[32px] font-normal text-white">
            The Team
          </h2>
          <span className="text-[13px] text-white/25 tracking-wide">
            {team.length} members
          </span>
        </div>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          {team.map((member) => (
            <div
              key={member.name}
              className="group relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0f0f0f] px-5 py-7 text-center transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30"
            >
              {/* Glow on hover */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(167,139,250,0.07),_transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Avatar */}
              <Image
                src={member.image}
                alt={member.name}
                width={102}
                height={102}
                  className="mx-auto mb-4 h-[102px] w-[102px] rounded-2xl object-cover ring-[0.5px] ring-white/10"
                onError={(e) => {
                  const sibling = e.currentTarget
                    .nextElementSibling as HTMLElement | null;

                  e.currentTarget.style.display = "none";

                  if (sibling) {
                    sibling.style.display = "flex";
                  }
                }}
              />
              <div className="mx-auto mb-4 hidden h-[102px] w-[102px] items-center justify-center rounded-2xl border border-violet-500/25 bg-violet-500/10 font-serif text-2xl text-violet-400">
                {member.initial}
              </div>

              {/* Name */}
              <h3 className="text-[13px] font-medium leading-snug text-white mb-2">
                {member.name}
              </h3>

              {/* Role */}
              <span className="inline-block rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-violet-400 mb-5">
                {member.role}
              </span>

              {/* Socials */}
              <div className="flex justify-center gap-2">
                <Link
                  href={member.instagram}
                  target="_blank"
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border border-white/[0.08] bg-white/[0.04] text-white/35 transition hover:border-white/15 hover:bg-white/[0.08] hover:text-white"
                >
                  <FaInstagram className="h-3 w-3" />
                </Link>
                <Link
                  href={member.linkedin}
                  target="_blank"
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border border-white/[0.08] bg-white/[0.04] text-white/35 transition hover:border-white/15 hover:bg-white/[0.08] hover:text-white"
                >
                  <FaLinkedin className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
