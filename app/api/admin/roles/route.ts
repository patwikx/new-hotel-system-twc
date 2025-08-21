// app/api/roles/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // You can add authorization checks here if needed

    const roles = await prisma.role.findMany({
      orderBy: {
        displayName: 'asc'
      },
      select: {
        id: true,
        name: true,
        displayName: true
      }
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error("[ROLES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}