export default function Stat({
  classNames,
  label,
  description,
  units,
}: {
  classNames?: { root?: string; label?: string; description?: string };
  labelClassName?: string;
  label: string;
  description: string;
  units?: "d" | "wk" | "mo";
}) {
  return (
    <dl className={classNames?.root}>
      <dt
        className={
          "text-sm text-primary bg-header-bg pl-2 pr-2 pt-0.5 pb-0.5 " +
          classNames?.label
        }
      >
        {label}
      </dt>
      <dd
        className={
          "text-base text-primary bg-background p-2 " + classNames?.description
        }
      >
        {description + (units ? ` ${units}` : "")}
      </dd>
    </dl>
  );
}
