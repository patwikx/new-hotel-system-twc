// app/api/business-units/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const businessUnits = await prisma.businessUnit.findMany({
      orderBy: {
        displayName: 'asc'
      },
      select: {
        id: true,
        name: true,
        displayName: true
      }
    });

    return NextResponse.json(businessUnits);
  } catch (error) {
    console.error("[BUSINESS_UNITS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}