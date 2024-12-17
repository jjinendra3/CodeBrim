import resolveConfig from "tailwindcss/resolveConfig";

import tailwindConfig from "../tailwind.config";
import { useMediaQuery } from "./use-media-query";
const config = resolveConfig(tailwindConfig);

const breakpoints = config.theme.screens;
type BreakpointKey = "sm" | keyof typeof config.theme.screens;

export function useBreakpoint(breakpointKey: BreakpointKey) {
  return useMediaQuery(`(min-width: ${breakpoints[breakpointKey]})`);
}
