"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { SelectedBead } from "@/lib/shopify/types";
import { getBraceletPositions, getEmptySlots } from "@/lib/utils/bracelet";
import { formatCny } from "@/lib/utils/price";

interface BraceletCanvasProps {
  beads: SelectedBead[];
  maxBeads: number;
  totalPrice: number;
  onRemove: (index: number) => void;
  onMoveTo: (fromIndex: number, toIndex: number) => void;
}

const LONG_PRESS_MS = 280;
const DELETE_THRESHOLD_RATIO = 1.52; // distance from center / radius

export function BraceletCanvas({
  beads,
  maxBeads,
  totalPrice,
  onRemove,
  onMoveTo,
}: BraceletCanvasProps) {
  const t = useTranslations("builder.canvas");
  const cx = 160;
  const cy = 160;
  const radius = 102;
  const deleteThreshold = radius * DELETE_THRESHOLD_RATIO;

  const [rotationOffset, setRotationOffset] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const rotateStartAngleRef = useRef(0);
  const rotateStartOffsetRef = useRef(0);

  const positions = getBraceletPositions(beads, cx, cy, radius, rotationOffset);
  const emptySlots = getEmptySlots(beads.length, maxBeads, cx, cy, radius, rotationOffset);

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [isInDeleteZone, setIsInDeleteZone] = useState(false);
  const [newBeadIds, setNewBeadIds] = useState<Set<string>>(new Set());
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const startedDragRef = useRef(false);
  const prevBeadIdsRef = useRef<Set<string>>(new Set());

  // Track newly added beads for entrance animation
  useEffect(() => {
    const currentIds = new Set(beads.map((b) => b.instanceId));
    const prevIds = prevBeadIdsRef.current;

    const added = new Set<string>();
    for (const id of currentIds) {
      if (!prevIds.has(id)) added.add(id);
    }

    if (added.size > 0) {
      setNewBeadIds(added);
    }

    prevBeadIdsRef.current = currentIds;
  }, [beads]);

  const indexByNearestPoint = useMemo(() => {
    return (x: number, y: number): number | null => {
      if (positions.length === 0) return null;

      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      positions.forEach((point, index) => {
        const distance = Math.hypot(point.x - x, point.y - y);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      return nearestIndex;
    };
  }, [positions]);

  function clearLongPressTimer() {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function pointerToSvgPoint(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return null;

    const rect = svg.getBoundingClientRect();
    const scaleX = 320 / rect.width;
    const scaleY = 320 / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function handlePointerDown(index: number, clientX: number, clientY: number) {
    startedDragRef.current = false;
    clearLongPressTimer();

    longPressTimerRef.current = window.setTimeout(() => {
      const point = pointerToSvgPoint(clientX, clientY);
      if (!point) return;

      setDraggingIndex(index);
      setDragPos(point);
      setHoverIndex(indexByNearestPoint(point.x, point.y));
      startedDragRef.current = true;
    }, LONG_PRESS_MS);
  }

  function handlePointerMove(clientX: number, clientY: number) {
    if (draggingIndex === null) return;

    const point = pointerToSvgPoint(clientX, clientY);
    if (!point) return;

    setDragPos(point);

    const distFromCenter = Math.hypot(point.x - cx, point.y - cy);
    const inDeleteZone = distFromCenter > deleteThreshold;
    setIsInDeleteZone(inDeleteZone);

    if (!inDeleteZone) {
      setHoverIndex(indexByNearestPoint(point.x, point.y));
    } else {
      setHoverIndex(null);
    }
  }

  function handlePointerUp() {
    clearLongPressTimer();

    if (draggingIndex !== null && startedDragRef.current) {
      if (isInDeleteZone) {
        // Trigger removal animation, then actually remove
        setRemovingIndex(draggingIndex);
        setDraggingIndex(null);
        setDragPos(null);
        setIsInDeleteZone(false);
        setHoverIndex(null);

        setTimeout(() => {
          onRemove(draggingIndex);
          setRemovingIndex(null);
        }, 220);
        return;
      }

      if (hoverIndex !== null && hoverIndex !== draggingIndex) {
        onMoveTo(draggingIndex, hoverIndex);
      }
    }

    setDraggingIndex(null);
    setDragPos(null);
    setIsInDeleteZone(false);
    setHoverIndex(null);
  }

  function handlePointerCancel() {
    clearLongPressTimer();
    setDraggingIndex(null);
    setDragPos(null);
    setIsInDeleteZone(false);
    setHoverIndex(null);
    setIsRotating(false);
  }

  function handleBgPointerDown(clientX: number, clientY: number) {
    if (draggingIndex !== null) return;
    const point = pointerToSvgPoint(clientX, clientY);
    if (!point) return;

    const distFromCenter = Math.hypot(point.x - cx, point.y - cy);
    if (distFromCenter < radius * 0.5 || distFromCenter > radius * 1.6) return;

    const angle = Math.atan2(point.y - cy, point.x - cx);
    rotateStartAngleRef.current = angle;
    rotateStartOffsetRef.current = rotationOffset;
    setIsRotating(true);
  }

  function handleBgPointerMove(clientX: number, clientY: number) {
    if (!isRotating) return;
    const point = pointerToSvgPoint(clientX, clientY);
    if (!point) return;

    const angle = Math.atan2(point.y - cy, point.x - cx);
    const delta = angle - rotateStartAngleRef.current;
    setRotationOffset(rotateStartOffsetRef.current + delta);
  }

  function handleBgPointerUp() {
    setIsRotating(false);
  }

  function handleAnimationEnd(instanceId: string) {
    setNewBeadIds((prev) => {
      const next = new Set(prev);
      next.delete(instanceId);
      return next;
    });
  }

  return (
    <div className="mx-auto w-full max-w-[380px] rounded-[24px] border border-[#E3E5EA] bg-gradient-to-b from-[#FAFBFC] to-[#F0F1F4] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
      <svg
        ref={svgRef}
        viewBox="0 0 320 320"
        className="mx-auto w-full max-w-[320px] touch-none select-none"
        role="img"
        aria-label={t("previewAria", { count: beads.length, max: maxBeads })}
        onPointerDown={(event) => {
          if (draggingIndex === null) {
            handleBgPointerDown(event.clientX, event.clientY);
          }
        }}
        onPointerMove={(event) => {
          if (isRotating) {
            handleBgPointerMove(event.clientX, event.clientY);
          } else {
            handlePointerMove(event.clientX, event.clientY);
          }
        }}
        onPointerUp={(event) => {
          if (isRotating) {
            handleBgPointerUp();
          } else {
            handlePointerUp();
          }
        }}
        onPointerCancel={handlePointerCancel}
      >
        <defs>
          <radialGradient id="bracelet-ring-grad" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#E8EBF0" />
            <stop offset="100%" stopColor="#D5D9E0" />
          </radialGradient>
          <filter id="bead-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#3F434A" floodOpacity="0.2" />
          </filter>
          {/* Per-bead crystal gradients */}
          {beads.map((bead) => (
            <radialGradient
              key={`grad-${bead.instanceId}`}
              id={`bead-grad-${bead.instanceId}`}
              cx="35%"
              cy="30%"
              r="65%"
            >
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="35%" stopColor={bead.colorHex} stopOpacity="0.8" />
              <stop offset="70%" stopColor={bead.colorHex} />
              <stop offset="100%" stopColor={`color-mix(in srgb, ${bead.colorHex} 60%, #3a3f4a)`} />
            </radialGradient>
          ))}
        </defs>

        {/* Bracelet ring */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="url(#bracelet-ring-grad)"
          strokeWidth="5"
          opacity="0.7"
        />

        {/* Delete zone indicator (shown during drag) */}
        {draggingIndex !== null && (
          <circle
            cx={cx}
            cy={cy}
            r={deleteThreshold}
            fill="none"
            stroke={isInDeleteZone ? "#E53E3E" : "#D1D5DB"}
            strokeWidth={isInDeleteZone ? "2.5" : "1.5"}
            strokeDasharray={isInDeleteZone ? "6 3" : "4 4"}
            opacity={isInDeleteZone ? "0.7" : "0.3"}
            style={{ transition: "stroke 0.15s, opacity 0.15s, stroke-width 0.15s" }}
          />
        )}

        {/* Delete zone label */}
        {draggingIndex !== null && isInDeleteZone && (
          <text
            x={cx}
            y={44}
            textAnchor="middle"
            className="fill-[#E53E3E] text-[11px] font-semibold"
          >
            {t("releaseToRemove")}
          </text>
        )}

        {/* Empty slot placeholders */}
        {emptySlots.map((slot, index) => (
          <circle
            key={`empty-${index}`}
            cx={slot.x}
            cy={slot.y}
            r={6}
            fill="none"
            stroke="#C8CDD6"
            strokeWidth="1"
            strokeDasharray="2 2"
            style={{ animation: "empty-slot-breathe 3s ease-in-out infinite", animationDelay: `${index * 0.15}s` }}
          />
        ))}

        {/* Bead positions */}
        {positions.map((bead, index) => {
          const radiusPx = Math.max(7, Math.min(16, bead.sizeMm * 1.2));
          const isDragging = draggingIndex === index;
          const isDropTarget = hoverIndex === index && draggingIndex !== null && !isInDeleteZone;
          const isNew = newBeadIds.has(bead.instanceId);
          const isRemoving = removingIndex === index;

          const renderX = isDragging && dragPos ? dragPos.x : bead.x;
          const renderY = isDragging && dragPos ? dragPos.y : bead.y;

          const fillColor = isDragging && isInDeleteZone
            ? "#E53E3E"
            : `url(#bead-grad-${bead.instanceId})`;

          return (
            <g
              key={bead.instanceId}
              className={`cursor-pointer ${isNew ? "animate-bead-in" : ""} ${isRemoving ? "animate-bead-out" : ""}`}
              style={{
                transformOrigin: `${bead.x}px ${bead.y}px`,
                transition: isDragging ? "none" : "transform 0.25s ease",
              }}
              role="button"
              aria-label={t("beadAria", { name: bead.name, size: bead.sizeMm })}
              onPointerDown={(event) => {
                event.preventDefault();
                handlePointerDown(index, event.clientX, event.clientY);
              }}
              onAnimationEnd={() => {
                if (isNew) handleAnimationEnd(bead.instanceId);
              }}
            >
              {/* Drop target indicator */}
              {isDropTarget && (
                <circle
                  cx={bead.x}
                  cy={bead.y}
                  r={radiusPx + 5}
                  fill="none"
                  stroke="#1F6B72"
                  strokeWidth="2"
                  strokeDasharray="3 2"
                  opacity="0.7"
                />
              )}

              {/* Ghost at original position when dragging */}
              {isDragging && (
                <circle
                  cx={bead.x}
                  cy={bead.y}
                  r={radiusPx}
                  fill={bead.colorHex}
                  opacity="0.2"
                  strokeDasharray="2 2"
                  stroke="#9CA3AF"
                  strokeWidth="1"
                />
              )}

              {/* Shadow */}
              <circle
                cx={renderX + 1.5}
                cy={renderY + 2.5}
                r={radiusPx}
                fill="rgba(63,67,74,0.15)"
                opacity={isDragging ? 0.5 : 1}
              />
              {/* Main bead with crystal gradient */}
              <circle
                cx={renderX}
                cy={renderY}
                r={radiusPx}
                fill={fillColor}
                stroke={`color-mix(in srgb, ${bead.colorHex} 70%, #ffffff)`}
                strokeWidth="0.5"
                filter="url(#bead-shadow)"
                opacity={isDragging ? 0.85 : isRemoving ? 0.5 : 1}
                style={{ transition: "fill 0.15s" }}
              />
              {/* Crystal inner glow */}
              <circle
                cx={renderX - radiusPx * 0.12}
                cy={renderY - radiusPx * 0.12}
                r={radiusPx * 0.55}
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="0.8"
                opacity={isDragging ? 0.3 : 0.7}
              />
              {/* Shine highlight */}
              <ellipse
                cx={renderX - radiusPx * 0.22}
                cy={renderY - radiusPx * 0.28}
                rx={radiusPx * 0.34}
                ry={radiusPx * 0.28}
                fill="rgba(255,255,255,0.7)"
                opacity={isDragging ? 0.4 : 1}
              />
              {/* Equator shine */}
              <rect
                x={renderX - radiusPx * 0.65}
                y={renderY - radiusPx * 0.08}
                width={radiusPx * 1.3}
                height={radiusPx * 0.15}
                rx={radiusPx * 0.06}
                fill="rgba(255,255,255,0.35)"
                transform={`rotate(-7 ${renderX} ${renderY})`}
                opacity={isDragging ? 0.35 : 1}
              />
              {/* Bottom reflection */}
              <ellipse
                cx={renderX + radiusPx * 0.1}
                cy={renderY + radiusPx * 0.35}
                rx={radiusPx * 0.25}
                ry={radiusPx * 0.15}
                fill="rgba(255,255,255,0.2)"
                opacity={isDragging ? 0.2 : 0.6}
              />
            </g>
          );
        })}

        {/* Center lilpeb logo */}
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-[#B8BCC6] text-[18px] tracking-[0.16em]"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          lilpeb
        </text>
        {beads.length === 0 ? (
          <text
            x={cx}
            y={cy + 18}
            textAnchor="middle"
            className="fill-[#C5CAD4] text-[11px]"
          >
            {t("startDesign")}
          </text>
        ) : (
          <text
            x={cx}
            y={cy + 18}
            textAnchor="middle"
            className="fill-[#A0A7B4] text-[10px]"
          >
            {beads.length} beads · {formatCny(totalPrice)}
          </text>
        )}
      </svg>
    </div>
  );
}
