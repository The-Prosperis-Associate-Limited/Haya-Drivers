import {
  CalendarDays,
  Car,
  Clock,
  House,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { TRANSMISSION_OPTIONS, WORK_SCHEDULE_LABELS } from "@/lib/utils";
import type { DriverShortlist } from "@/types/hire";

interface Props {
  request: Pick<
    DriverShortlist["hire_request"],
    | "schedule"
    | "resumption_time"
    | "closing_time"
    | "transmission"
    | "provides_accommodation"
    | "state"
    | "nearest_area"
  >;
}

export const ShortlistFacts = function ({ request }: Props) {
  const area = [request.nearest_area, request.state].filter(Boolean).join(", ");

  const facts = [
    { icon: CalendarDays, label: WORK_SCHEDULE_LABELS[request.schedule] },
    request.resumption_time && request.closing_time
      ? {
          icon: Clock,
          label: `${request.resumption_time} - ${request.closing_time}`,
        }
      : null,
    request.transmission
      ? {
          icon: Car,
          label: TRANSMISSION_OPTIONS.find(
            (option) => option.value === request.transmission,
          )?.label,
        }
      : null,
    area ? { icon: MapPin, label: area } : null,
    request.provides_accommodation
      ? { icon: House, label: "Accommodation provided" }
      : null,
  ].filter((fact): fact is { icon: LucideIcon; label: string } =>
    Boolean(fact?.label),
  );

  return (
    <div className="flex flex-wrap gap-1.5">
      {facts.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className="border-border text-foreground/80 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium"
        >
          <Icon className="size-3.5" />
          {label}
        </span>
      ))}
    </div>
  );
};
