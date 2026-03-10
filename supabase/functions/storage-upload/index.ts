/**
 * Storage Upload Edge Function
 * Handles secure file uploads with validation for B2C account
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Allowed file types by category
const ALLOWED_TYPES: Record<string, string[]> = {
  avatar: ["image/jpeg", "image/png", "image/webp"],
  document: ["application/pdf", "image/jpeg", "image/png"],
  vehicle: ["image/jpeg", "image/png", "image/webp"],
}

// Max file sizes in bytes
const MAX_SIZES: Record<string, number> = {
  avatar: 2 * 1024 * 1024, // 2MB
  document: 10 * 1024 * 1024, // 10MB
  vehicle: 5 * 1024 * 1024, // 5MB
}

interface UploadRequest {
  action: "upload" | "delete" | "get_signed_url"
  category: "avatar" | "document" | "vehicle"
  fileName?: string
  filePath?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      throw new Error("Missing authorization header")
    }

    // Create admin client for storage operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    )

    // Create user client for auth
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      throw new Error("Unauthorized")
    }

    const contentType = req.headers.get("Content-Type") || ""

    // Handle multipart form data for file upload
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData()
      const file = formData.get("file") as File | null
      const category = formData.get("category") as string | null
      const fileName = formData.get("fileName") as string | null

      if (!file || !category) {
        throw new Error("Missing file or category")
      }

      // Validate category
      if (!ALLOWED_TYPES[category]) {
        throw new Error(`Invalid category: ${category}`)
      }

      // Validate file type
      if (!ALLOWED_TYPES[category].includes(file.type)) {
        throw new Error(`Invalid file type ${file.type} for category ${category}`)
      }

      // Validate file size
      if (file.size > MAX_SIZES[category]) {
        throw new Error(`File too large. Max size: ${MAX_SIZES[category] / 1024 / 1024}MB`)
      }

      // Generate unique file path
      const ext = file.name.split(".").pop() || "bin"
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 8)
      const finalFileName = fileName || `${timestamp}-${randomStr}.${ext}`
      const filePath = `${user.id}/${category}/${finalFileName}`

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from("user-uploads")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true,
        })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from("user-uploads")
        .getPublicUrl(filePath)

      return new Response(
        JSON.stringify({
          success: true,
          path: uploadData.path,
          publicUrl: urlData.publicUrl,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Handle JSON requests for other actions
    const body: UploadRequest = await req.json()

    switch (body.action) {
      case "delete": {
        if (!body.filePath) {
          throw new Error("Missing filePath")
        }

        // Verify user owns the file
        if (!body.filePath.startsWith(`${user.id}/`)) {
          throw new Error("Access denied")
        }

        const { error: deleteError } = await supabaseAdmin.storage
          .from("user-uploads")
          .remove([body.filePath])

        if (deleteError) {
          throw new Error(`Delete failed: ${deleteError.message}`)
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      case "get_signed_url": {
        if (!body.filePath) {
          throw new Error("Missing filePath")
        }

        // Verify user owns the file
        if (!body.filePath.startsWith(`${user.id}/`)) {
          throw new Error("Access denied")
        }

        const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
          .from("user-uploads")
          .createSignedUrl(body.filePath, 3600) // 1 hour expiry

        if (signedUrlError) {
          throw new Error(`Failed to create signed URL: ${signedUrlError.message}`)
        }

        return new Response(
          JSON.stringify({ signedUrl: signedUrlData.signedUrl }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      default:
        throw new Error(`Unknown action: ${body.action}`)
    }
  } catch (error) {
    console.error("Storage upload error:", error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
