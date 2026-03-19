import { Users, MapPin, Clock, Mail, Phone, Link } from "lucide-react";

const PILLARS = [
  {
    title: "Connection",
    description:
      "Building bridges between founders, mentors, investors, and the broader Central Illinois community.",
  },
  {
    title: "Education",
    description:
      "Equipping entrepreneurs with practical skills, frameworks, and knowledge to build lasting companies.",
  },
  {
    title: "Motivation",
    description:
      "Creating accountability structures and celebrating progress to keep founders moving forward.",
  },
  {
    title: "Inspiration",
    description:
      "Showcasing success stories and possibilities to ignite the entrepreneurial spirit in our region.",
  },
];

const TEAM = [
  {
    name: "Doug Villhard",
    role: "Executive Director",
  },
  {
    name: "Jeffrey Mason",
    role: "Program Director",
  },
  {
    name: "Jennifer Daly",
    role: "Operations Director",
  },
  {
    name: "Rajeev Kumar",
    role: "Technical Director",
  },
];

export default function AboutPanel() {
  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      {/* Mission */}
      <section className="mb-8">
        <h2 className="font-display text-2xl text-brutal-white font-bold mb-2">
          OUR MISSION
        </h2>
        <p className="font-mono text-base text-gray-300 leading-relaxed max-w-3xl">
          Distillery Labs is Central Illinois' startup accelerator and innovation
          hub. We remove the ego, reduce the friction, and focus on the founder.
          Our mission is to build a thriving entrepreneurial ecosystem in the
          heart of the Midwest.
        </p>
      </section>

      {/* Core Values */}
      <section className="mb-8">
        <h3 className="font-display text-lg text-brutal-white font-bold mb-1">
          CORE VALUES
        </h3>
        <p className="font-mono text-sm text-brutal-accent mb-4">
          Remove the ego. Reduce the friction. Focus on the founder.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {PILLARS.map(({ title, description }) => (
            <div
              key={title}
              className="border-2 border-gray-700 bg-brutal-gray p-4"
            >
              <h4 className="font-display text-base text-brutal-accent font-bold mb-1">
                {title}
              </h4>
              <p className="font-mono text-sm text-gray-400 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} className="text-brutal-accent" />
          <h3 className="font-display text-lg text-brutal-white font-bold">
            TEAM
          </h3>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {TEAM.map(({ name, role }) => (
            <div
              key={name}
              className="border-2 border-gray-700 bg-brutal-gray p-4 text-center"
            >
              <div className="w-14 h-14 mx-auto mb-3 border-2 border-brutal-accent flex items-center justify-center text-brutal-accent font-display text-xl font-bold">
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <h4 className="font-display text-sm text-brutal-white font-bold">
                {name}
              </h4>
              <p className="font-mono text-xs text-gray-400">{role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Location & Contact */}
      <section>
        <div className="grid grid-cols-2 gap-4">
          <div className="border-2 border-gray-700 bg-brutal-gray p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={18} className="text-brutal-accent" />
              <h3 className="font-display text-base text-brutal-white font-bold">
                LOCATION
              </h3>
            </div>
            <p className="font-mono text-sm text-gray-300 mb-1">
              Distillery Labs
            </p>
            <p className="font-mono text-sm text-gray-400">
              921 NE Jefferson Ave
            </p>
            <p className="font-mono text-sm text-gray-400">
              Peoria, IL 61603
            </p>
          </div>

          <div className="border-2 border-gray-700 bg-brutal-gray p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={18} className="text-brutal-accent" />
              <h3 className="font-display text-base text-brutal-white font-bold">
                HOURS
              </h3>
            </div>
            <p className="font-mono text-sm text-gray-300">
              Mon–Fri: 9 AM – 5 PM
            </p>
            <p className="font-mono text-sm text-gray-400">
              Coworking: 24/7 badge access
            </p>
          </div>

          <div className="border-2 border-gray-700 bg-brutal-gray p-5 col-span-2">
            <h3 className="font-display text-base text-brutal-white font-bold mb-3">
              CONTACT
            </h3>
            <div className="flex gap-8">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-brutal-accent" />
                <span className="font-mono text-sm text-gray-300">
                  info@distillerylabs.org
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-brutal-accent" />
                <span className="font-mono text-sm text-gray-300">
                  (309) 310-5038
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link size={16} className="text-brutal-accent" />
                <span className="font-mono text-sm text-gray-300">
                  distillerylabs.org
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
