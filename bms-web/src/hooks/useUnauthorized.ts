"use client";
import { useState } from "react";

export function useUnauthorized() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<{
    requiredRoles?: string[];
    resource?: string;
  }>({});

  const showUnauthorized = (options?: {
    requiredRoles?: string[];
    resource?: string;
  }) => {
    setConfig(options || {});
    setIsOpen(true);
  };

  const hideUnauthorized = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    config,
    showUnauthorized,
    hideUnauthorized,
  };
}
