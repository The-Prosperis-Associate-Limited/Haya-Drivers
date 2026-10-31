import { format } from "date-fns";

interface Props {
  weekly: { week_start: string; count: number }[];
}

const niceMax = (value: number) => {
  if (value <= 4) return 4;
  const step = Math.pow(10, Math.floor(Math.log10(value)));
  return Math.ceil(value / step) * step;
};

export const WeeklySignupsChart = function ({ weekly }: Props) {
  const max = niceMax(Math.max(...weekly.map((week) => week.count), 0));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => Math.round(max * ratio));

  return (
    <div className="pl-7">
      <div className="border-border relative h-[170px] border-b">
        {ticks.map((tick) => (
          <div
            key={tick}
            className="border-border/70 absolute inset-x-0 border-t border-dashed"
            style={{ bottom: `${(tick / max) * 100}%` }}
          >
            <span className="text-muted-foreground absolute -top-2 -left-7 w-6 text-right text-[10.5px] leading-none">
              {tick}
            </span>
          </div>
        ))}

        <div className="relative z-[1] flex h-full items-end gap-1">
          {weekly.map((week) => (
            <div key={week.week_start} className="group relative flex h-full flex-1 items-end justify-center">
              <span className="bg-foreground pointer-events-none absolute -top-1 z-10 -translate-y-full rounded-md px-2 py-1 text-[11px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                {week.count} sign-up{week.count === 1 ? "" : "s"} · week of{" "}
                {format(new Date(week.week_start), "d MMM")}
              </span>
              <i
                className="bg-brand group-hover:bg-brand/80 block w-full max-w-[26px] rounded-t-[4px] transition-colors"
                style={{ height: `${(week.count / max) * 100}%`, minHeight: week.count ? 3 : 0 }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-1.5 flex gap-1">
        {weekly.map((week, index) => (
          <span key={week.week_start} className="text-muted-foreground flex-1 text-center text-[10.5px] whitespace-nowrap">
            {index % 2 === 0 || index === weekly.length - 1 ? format(new Date(week.week_start), "d MMM") : ""}
          </span>
        ))}
      </div>
    </div>
  );
};
