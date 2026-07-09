interface CrownProps {
  className?: string;
  gold?: boolean;
  silver?: boolean;
  bronze?: boolean;
}

export default function Crown({
  className,
  gold,
  silver,
  bronze,
}: CrownProps) {
  const colors = gold
    ? {
        start: "#EFCB7B",
        end: "#383125",
        inner: "#E2C689",
      }
    : silver
    ? {
        start: "#F5F5F5",
        end: "#6B7280",
        inner: "#D1D5DB",
      }
    : {
        start: "#D08C5A",
        end: "#5B3A29",
        inner: "#C47A45",
      };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="grad1" x1="12" y1="1" x2="12" y2="23">
          <stop stopColor={colors.start} />
          <stop offset="1" stopColor={colors.end} />
        </linearGradient>

        <linearGradient id="grad2" x1="12" y1="1" x2="12" y2="23">
          <stop stopColor={colors.inner} />
          <stop offset="1" stopColor={colors.inner} />
        </linearGradient>
      </defs>

      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.5727 1.20698L21.1288 5.30029C22.1937 5.87713 22.8571 6.99086 22.8571 8.2019V16.0329C22.8571 17.2439 22.1937 18.9232 21.1288 19.5L13.5727 23.4C12.592 23.9312 11.4095 23.9312 10.4289 23.4L2.87269 19.5C1.80786 18.9232 1.14453 17.2439 1.14453 16.0329V8.2019C1.14453 6.99086 1.80786 5.87713 2.87269 5.30029L10.4289 1.20698C11.4095 0.675798 12.592 0.675798 13.5727 1.20698Z"
        fill="url(#grad1)"
      />

      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.5632 1.57968L21.0802 5.48881C22.1396 6.0397 22.7995 7.10332 22.7995 8.25987L22.7992 15.7385C22.7992 16.8951 22.1393 17.8083 21.0799 18.3592L13.5632 21.8392C12.5877 22.3466 11.4113 22.3466 10.4358 21.8392L2.91842 18.3592C1.85911 17.8083 1.19922 16.8951 1.19922 15.7385L1.19949 8.25987C1.19949 7.10332 1.85938 6.0397 2.9187 5.48881L10.4358 1.57968C11.4113 1.0724 12.5877 1.0724 13.5632 1.57968Z"
        fill="url(#grad2)"
      />

      {/* keep remaining white paths unchanged */}
    </svg>
  );
}