import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "y2m5kubk";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "strongmate_videos";

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const cldFormData = new FormData();
    const blob = new Blob([buffer], { type: file.type || "video/mp4" });
    cldFormData.append("file", blob, file.name);
    cldFormData.append("upload_preset", uploadPreset);

    const cldRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: "POST",
      body: cldFormData,
    });

    const cldData = await cldRes.json();

    if (cldRes.ok && cldData.secure_url) {
      return NextResponse.json({
        success: true,
        url: cldData.secure_url,
        duration: cldData.duration ? Math.round(cldData.duration) : 300,
        fileName: file.name,
      });
    }

    throw new Error(cldData.error?.message || "Cloudinary upload failed");
  } catch (error: any) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload video file to Cloudinary" },
      { status: 500 }
    );
  }
}
