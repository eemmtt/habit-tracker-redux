export default function DayCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="-1 -1 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="24" cy="24" r="23.5" stroke="currentColor" />
    </svg>
  );
}
