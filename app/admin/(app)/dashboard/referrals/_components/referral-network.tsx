"use client";

import { cn, formatDate } from "@/lib/utils";
import type { NetworkNodeStatus, ReferralNetworkNode } from "@/types/referral";
import { useMemo, useRef, useState } from "react";

interface Props {
  roots: ReferralNetworkNode[];
  onSelect: (node: ReferralNetworkNode) => void;
}

interface Placed {
  node: ReferralNetworkNode;
  parent: Placed | null;
  depth: number;
  x: number;
  y: number;
}

export const NETWORK_STATUS: Record<NetworkNodeStatus, { label: string; ring: string; dashed?: boolean }> = {
  root: { label: "Referrer (joined directly)", ring: "#2f6bf6" },
  rewarded: { label: "Submitted · reward paid", ring: "#16a34a" },
  held: { label: "Held for review", ring: "#7c3aed" },
  onboarding: { label: "Onboarding", ring: "#d97706" },
  signed_up: { label: "Signed up only", ring: "#94a3b8", dashed: true },
  reversed: { label: "Refused or reversed", ring: "#dc2626" },
};

const FILLS = [
  ["#e0ecff", "#1d4ed8"],
  ["#dcfce7", "#15803d"],
  ["#fde7d9", "#c2410c"],
  ["#f3e8ff", "#7e22ce"],
  ["#fef3c7", "#a16207"],
];

const GAP = 58;
const ROW = 104;
const PAD_X = 48;
const PAD_Y = 40;

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const tint = (id: string) => FILLS[[...id].reduce((total, char) => total + char.charCodeAt(0), 0) % FILLS.length];

const layout = (roots: ReferralNetworkNode[]) => {
  const placed: Placed[] = [];
  let cursor = 0;
  let maxDepth = 0;

  const place = (node: ReferralNetworkNode, parent: Placed | null, depth: number): Placed => {
    const entry: Placed = { node, parent, depth, x: 0, y: depth * ROW };
    placed.push(entry);
    maxDepth = Math.max(maxDepth, depth);

    if (!node.children.length) {
      entry.x = cursor++ * GAP;
    } else {
      const kids = node.children.map((child) => place(child, entry, depth + 1));
      entry.x = (kids[0].x + kids[kids.length - 1].x) / 2;
    }

    return entry;
  };

  roots.forEach((root, index) => {
    if (index) cursor += 0.6;
    place(root, null, 0);
  });

  return { placed, width: Math.max(0, (cursor - 1) * GAP), height: maxDepth * ROW };
};

export const ReferralNetwork = function ({ roots, onSelect }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ entry: Placed; left: number } | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  const { placed, width, height } = useMemo(() => layout(roots), [roots]);

  const svgWidth = width + PAD_X * 2;
  const svgHeight = height + PAD_Y * 2 + 24;

  const branch = useMemo(() => {
    if (!focused) return null;
    const target = placed.find((entry) => entry.node.id === focused);
    if (!target) return null;

    const ids = new Set<string>();
    const down = (node: ReferralNetworkNode) => {
      ids.add(node.id);
      node.children.forEach(down);
    };
    down(target.node);
    for (let parent = target.parent; parent; parent = parent.parent) ids.add(parent.node.id);
    return ids;
  }, [focused, placed]);

  if (!roots.length) {
    return (
      <p className="text-muted-foreground px-5 py-14 text-center text-sm">
        No referrals yet. The network appears as soon as a driver signs up with a code.
      </p>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="border-border relative overflow-x-auto border-t bg-[radial-gradient(circle,#e2e8f0_1px,transparent_1.2px)] bg-[length:22px_22px] bg-[#fbfcfe]"
      onClick={(event) => {
        if (event.target === event.currentTarget || (event.target as Element).tagName === "svg") setFocused(null);
      }}
    >
      <svg width={svgWidth} height={svgHeight} role="img" aria-label="Referral network - who referred whom" className="mx-auto block">
        <g transform={`translate(${PAD_X},${PAD_Y})`}>
          {placed
            .filter((entry) => entry.parent)
            .map((entry) => {
              const parent = entry.parent!;
              const y0 = parent.y + (parent.depth === 0 ? 22 : 16) + 22;
              const y1 = entry.y - 16;
              const mid = (y0 + y1) / 2;
              const lit = branch?.has(entry.node.id);

              return (
                <path
                  key={`edge-${entry.node.id}`}
                  d={`M${parent.x},${y0} C${parent.x},${mid} ${entry.x},${mid} ${entry.x},${y1}`}
                  fill="none"
                  stroke={lit ? "#2f6bf6" : "#cbd5e1"}
                  strokeWidth={lit ? 2 : 1.6}
                  opacity={branch && !lit ? 0.18 : 1}
                  className="transition-opacity"
                />
              );
            })}

          {placed.map((entry) => {
            const root = entry.depth === 0;
            const radius = root ? 22 : 16;
            const status = NETWORK_STATUS[entry.node.status];
            const [fill, ink] = tint(entry.node.id);
            const dim = branch && !branch.has(entry.node.id);

            return (
              <g
                key={entry.node.id}
                transform={`translate(${entry.x},${entry.y})`}
                className="cursor-pointer transition-opacity"
                opacity={dim ? 0.18 : 1}
                onMouseEnter={() => {
                  const wrap = wrapRef.current;
                  const left = entry.x + PAD_X + 26 - (wrap?.scrollLeft ?? 0);
                  setHover({ entry, left: Math.max(8, Math.min(left, (wrap?.clientWidth ?? 600) - 216)) });
                }}
                onMouseLeave={() => setHover(null)}
                onClick={() => {
                  setFocused(entry.node.id);
                  onSelect(entry.node);
                }}
              >
                <circle r={radius + 8} fill="transparent" />
                {root ? (
                  <circle r={radius} fill={status.ring} stroke="#fff" strokeWidth={2} />
                ) : (
                  <circle r={radius} fill={fill} stroke={status.ring} strokeWidth={3} strokeDasharray={status.dashed ? "4 3" : undefined} />
                )}
                <text textAnchor="middle" dy="0.35em" fontSize={root ? 12 : 10.5} fontWeight={600} fill={root ? "#fff" : ink} className="pointer-events-none">
                  {initials(entry.node.name)}
                </text>
                <text textAnchor="middle" y={radius + 15} fontSize={root ? 12 : 10.5} fontWeight={root ? 600 : 500} fill={root ? "#0f172a" : "#64748b"} className="pointer-events-none">
                  {root ? entry.node.name : entry.node.name.split(" ")[0]}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {hover && (
        <div
          className="border-border pointer-events-none absolute z-10 min-w-[200px] rounded-xl border bg-white px-3 py-2.5 text-xs shadow-lg"
          style={{ left: hover.left, top: hover.entry.y + PAD_Y - 10 }}
        >
          <strong className="block text-[13px]">{hover.entry.node.name}</strong>
          {[
            ["Status", NETWORK_STATUS[hover.entry.node.status].label],
            ["Joined", formatDate(hover.entry.node.joined_at)],
            ["Referred by", hover.entry.parent?.node.name ?? "-"],
            ["Their referrals", String(hover.entry.node.children.length)],
          ].map(([key, value]) => (
            <div key={key} className="text-muted-foreground flex justify-between gap-4">
              <span>{key}</span>
              <b className={cn("text-foreground font-semibold")}>{value}</b>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const NetworkLegend = function () {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
      {Object.entries(NETWORK_STATUS).map(([key, status]) => (
        <span key={key} className="inline-flex items-center gap-1.5">
          <i
            className="size-3 rounded-full border-[3px]"
            style={{
              borderColor: status.ring,
              borderStyle: status.dashed ? "dashed" : "solid",
              background: key === "root" ? status.ring : undefined,
            }}
          />
          <b className="font-semibold">{status.label}</b>
        </span>
      ))}
    </div>
  );
};
