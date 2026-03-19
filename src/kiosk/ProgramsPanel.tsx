import {
  Rocket,
  Lightbulb,
  HeartCrack,
  Stethoscope,
  FlaskConical,
  Pizza,
  Trophy,
  Building2,
  Sparkles,
  GraduationCap,
} from "lucide-react";

const PROGRAMS = [
  {
    name: "gBETA Accelerator",
    icon: Rocket,
    description:
      "Free 7-week accelerator for early-stage startups. No equity taken. Includes mentorship from experienced founders and investors, culminating in a public Demo Day.",
    details: "Applications open quarterly",
  },
  {
    name: "gALPHA",
    icon: Lightbulb,
    description:
      "Free 4-week pre-accelerator for aspiring entrepreneurs. Validate your idea, build your first pitch deck, and get connected to the startup ecosystem.",
    details: "No idea too early",
  },
  {
    name: "Fail Club",
    icon: HeartCrack,
    description:
      "Monthly founder meetup where entrepreneurs share their setbacks, lessons learned, and real stories. A safe space to normalize failure as part of the journey.",
    details: "Monthly meetup",
  },
  {
    name: "Catalyst",
    icon: Stethoscope,
    description:
      "4-week healthcare and MedTech intensive program. Focused on navigating regulatory pathways, clinical validation, and healthcare-specific go-to-market strategies.",
    details: "Healthcare & MedTech",
  },
  {
    name: "Crucible",
    icon: FlaskConical,
    description:
      "8-week medtech investment readiness program. Prepare your startup for institutional investment with deep-dive mentoring on financials, IP strategy, and pitch refinement.",
    details: "Investment readiness",
  },
  {
    name: "Slices + Startups",
    icon: Pizza,
    description:
      "Monthly pizza networking event bringing together students, founders, and community members. Low-key conversations, high-value connections.",
    details: "Monthly networking",
  },
  {
    name: "Winning Wednesday",
    icon: Trophy,
    description:
      "Weekly workshop and pitch practice session. Sharpen your presentation skills, get real-time feedback, and celebrate wins big and small.",
    details: "Every Wednesday",
  },
  {
    name: "Coworking",
    icon: Building2,
    description:
      "$100/month for 24/7 badge access to our coworking space. High-speed internet, meeting rooms, and a community of builders around you.",
    details: "$100/mo — 24/7 access",
  },
  {
    name: "MakeHerSpace",
    icon: Sparkles,
    description:
      "6-month STEM mentoring program for girls in grades 6–12. Hands-on projects in engineering, coding, and design thinking with women mentors in STEM fields.",
    details: "Grades 6–12",
  },
  {
    name: "Classes",
    icon: GraduationCap,
    description:
      "Community classes in sewing, photography, podcasting, cooking, 3D printing, robotics, and electronics. Learn new skills in a hands-on, creative environment.",
    details: "Open to all ages",
  },
];

export default function ProgramsPanel() {
  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      <h2 className="font-display text-2xl text-brutal-white font-bold mb-1">
        OUR PROGRAMS
      </h2>
      <p className="font-mono text-sm text-gray-400 mb-6">
        From idea to investment — we have a program for every stage.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {PROGRAMS.map(({ name, icon: Icon, description, details }) => (
          <div
            key={name}
            className="border-2 border-gray-700 bg-brutal-gray p-5 hover:border-brutal-accent transition-colors group"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-none w-10 h-10 border-2 border-brutal-accent flex items-center justify-center text-brutal-accent group-hover:bg-brutal-accent group-hover:text-brutal-black transition-colors">
                <Icon size={20} />
              </div>
              <div>
                <h3 className="font-display text-base text-brutal-white font-bold leading-tight">
                  {name}
                </h3>
                <span className="font-mono text-xs text-brutal-accent">
                  {details}
                </span>
              </div>
            </div>
            <p className="font-mono text-sm text-gray-400 leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
