import React, { memo, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { indiaSvgString } from "./assets/indiaSvgString";
import "./IndiaMap.css";

const inlineIndiaSvg = indiaSvgString.replace(/^<\?xml[^>]*>\s*/, "");

const IndiaSvgMarkup = memo(function IndiaSvgMarkup() {
  return <div className="india-map__svg" dangerouslySetInnerHTML={{ __html: inlineIndiaSvg }} />;
});

function statePathFromTarget(target) {
  return target instanceof Element
    ? target.closest("path[data-state-id]")
    : null;
}

export function IndiaMap({
  variant = "light-interactive",
  activeStates,
  selectedStateId = null,
  onSelectState,
  className = ""
}) {
  const rootRef = useRef(null);
  const instancePrefix = useId().replace(/:/g, "");
  const [hoveredStateId, setHoveredStateId] = useState(null);
  const interactive = variant === "light-interactive";
  
  const statesById = useMemo(
    () => new Map(activeStates.map((state) => [state.svgId, state])),
    [activeStates]
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    const svg = root?.querySelector("svg");
    if (!root || !svg) return;

    svg.setAttribute("viewBox", "0 0 611.86 695.702");
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    if (interactive) svg.removeAttribute("focusable");
    else svg.setAttribute("focusable", "false");
    svg.setAttribute("aria-hidden", interactive ? "false" : "true");

    root.querySelectorAll("[id]").forEach((node) => {
      const sourceId = node.dataset.sourceId ?? node.id;
      node.dataset.sourceId = sourceId;
      node.id = `${instancePrefix}-${sourceId}`;
    });

    root.querySelectorAll("path[data-source-id]").forEach((path) => {
      const sourceId = path.dataset.sourceId ?? "";
      const state = statesById.get(sourceId);
      path.classList.add("india-map__state");
      path.classList.toggle("is-active", Boolean(state));
      path.classList.toggle("is-disabled", !state);
      path.classList.toggle("is-selected", Boolean(state && sourceId === selectedStateId));
      path.removeAttribute("role");
      path.removeAttribute("aria-label");
      path.removeAttribute("aria-pressed");
      path.removeAttribute("data-state-id");
      path.setAttribute("tabindex", "-1");
      path.setAttribute("aria-hidden", "true");

      if (state && interactive) {
        path.dataset.stateId = state.svgId;
        path.setAttribute("role", "button");
        path.setAttribute("aria-label", state.name);
        path.setAttribute("aria-pressed", String(state.svgId === selectedStateId));
        path.setAttribute("aria-hidden", "false");
        path.setAttribute("tabindex", "0");
      }
    });

    if (!interactive) return;

    const selectTarget = (target) => {
      const path = statePathFromTarget(target);
      if (path?.dataset.stateId) onSelectState?.(path.dataset.stateId);
    };
    const setHoverTarget = (target) => {
      const path = statePathFromTarget(target);
      setHoveredStateId(path?.dataset.stateId ?? null);
    };
    const handleClick = (event) => selectTarget(event.target);
    const handleKeyDown = (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const path = statePathFromTarget(event.target);
      if (!path) return;
      event.preventDefault();
      selectTarget(path);
    };
    const handleMouseOver = (event) => setHoverTarget(event.target);
    const handleMouseOut = (event) => {
      if (!(event.relatedTarget instanceof Node) || !root.contains(event.relatedTarget)) {
        setHoveredStateId(null);
      }
    };
    const handleFocusIn = (event) => setHoverTarget(event.target);
    const handleFocusOut = (event) => {
      if (!(event.relatedTarget instanceof Node) || !root.contains(event.relatedTarget)) {
        setHoveredStateId(null);
      }
    };

    root.addEventListener("click", handleClick);
    root.addEventListener("keydown", handleKeyDown);
    root.addEventListener("mouseover", handleMouseOver);
    root.addEventListener("mouseout", handleMouseOut);
    root.addEventListener("focusin", handleFocusIn);
    root.addEventListener("focusout", handleFocusOut);

    return () => {
      root.removeEventListener("click", handleClick);
      root.removeEventListener("keydown", handleKeyDown);
      root.removeEventListener("mouseover", handleMouseOver);
      root.removeEventListener("mouseout", handleMouseOut);
      root.removeEventListener("focusin", handleFocusIn);
      root.removeEventListener("focusout", handleFocusOut);
    };
  }, [hoveredStateId, instancePrefix, interactive, onSelectState, selectedStateId, statesById]);

  const hoveredState = hoveredStateId ? statesById.get(hoveredStateId) : null;

  return (
    <div
      ref={rootRef}
      className={`india-map india-map--${variant} ${className}`}
      role={interactive ? "group" : "img"}
      aria-label={interactive
        ? "Interactive map of 21 states where Sama is active"
        : "Map highlighting 21 Indian states where Sama is active"}
    >
      <IndiaSvgMarkup />
      {interactive && (
        <span className={`india-map__tooltip ${hoveredState ? "is-visible" : ""}`} aria-hidden="true">
          {hoveredState?.name ?? "Select an active state"}
        </span>
      )}
    </div>
  );
}
