"use client";

import React, { useEffect, useState } from "react";

interface WatermarkOverlayProps {
  empName: string;
  empId: string;
  sessionId?: string;
  ipAddress?: string;
}

export default function WatermarkOverlay({
  empName,
  empId,
  sessionId = "SMC-SESSION",
  ipAddress = "103.211.14.88",
}: WatermarkOverlayProps) {
  // Watermark removed per user request
  return null;
}
