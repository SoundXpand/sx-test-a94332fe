import { Mail } from "lucide-react";

interface ContactUsBadgeProps {
  email?: string;
  text?: string;
}

/**
 * Fixed left-side rotating "Contact us" badge.
 * Reusable across all landing pages. Opens user's mail client on click.
 */
export function ContactUsBadge({
  email = "hello@soundxpand.com",
  text = "CONTACT US • EMAIL US • GET IN TOUCH • ",
}: ContactUsBadgeProps) {
  const rotating = text.repeat(2);
  return (
    <a
      href={`mailto:${email}`}
      aria-label={`Contact us at ${email}`}
      className="group fixed left-4 top-1/2 z-40 -translate-y-1/2 sm:left-6"
    >
      <div className="relative grid h-28 w-28 place-items-center sm:h-32 sm:w-32">
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 h-full w-full animate-[spin_14s_linear_infinite] text-foreground"
          aria-hidden
        >
          <defs>
            <path
              id="contact-rot-circle"
              d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0"
            />
          </defs>
          <text
            className="fill-current"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "14px",
              letterSpacing: "0.22em",
              fontWeight: 600,
            }}
          >
            <textPath href="#contact-rot-circle" startOffset="0">
              {rotating}
            </textPath>
          </text>
        </svg>
        <div className="relative grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[var(--brand-violet-deep)] to-[var(--brand-pink)] text-white shadow-[0_0_30px_-4px_var(--brand-violet-deep)] transition-transform group-hover:scale-110 sm:h-14 sm:w-14">
          <Mail className="h-5 w-5" />
        </div>
      </div>
    </a>
  );
}
