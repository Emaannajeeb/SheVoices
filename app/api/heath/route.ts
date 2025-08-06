// import { NextResponse } from "next/server"
// import { prisma } from "@/lib/prisma"

// export async function GET() {
//   try {
//     // Check database connection
//     await prisma.$queryRaw`SELECT 1`

//     // Check environment variables
//     const requiredEnvVars = ["DATABASE_URL", "NEXTAUTH_SECRET", "NEXTAUTH_URL"]
//     const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

//     const health = {
//       status: "healthy",
//       timestamp: new Date().toISOString(),
//       database: "connected",
//       environment: missingEnvVars.length === 0 ? "configured" : "missing variables",
//       missingEnvVars: missingEnvVars.length > 0 ? missingEnvVars : undefined,
//       version: "1.0.0",
//     }

//     return NextResponse.json(health)
//   } catch (error) {
//     console.error("Health check failed:", error)
//     return NextResponse.json(
//       {
//         status: "unhealthy",
//         timestamp: new Date().toISOString(),
//         error: "Database connection failed",
//       },
//       { status: 500 },
//     )
//   }
// }
