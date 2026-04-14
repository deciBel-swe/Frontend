"use client";
import { useState } from "react";

export function useToggleArrow(defaultState = false) {
  const [open, setOpen] = useState(defaultState);

  const toggle = () => setOpen((prev) => !prev);

  return { open, toggle };
}