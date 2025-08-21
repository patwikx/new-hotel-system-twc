// app/api/users/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcryptjs from "bcryptjs";
import { UserStatus } from "@prisma/client";

// GET all users for a Business Unit
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const businessUnitId = req.headers.get("x-business-unit-id");
    if (!businessUnitId) {
      return new NextResponse("Missing x-business-unit-id header", { status: 400 });
    }
    const hasAccess = session.user.assignments.some(
      (a) => a.businessUnitId === businessUnitId
    );
    if (!hasAccess) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: {
        assignments: {
          some: { businessUnitId: businessUnitId },
        },
      },
      select: {
        id: true, email: true, username: true, firstName: true, lastName: true,
        phone: true, avatar: true, status: true, emailVerifiedAt: true,
        lastLoginAt: true, createdAt: true,
        assignments: {
          select: {
            businessUnit: { select: { id: true, name: true } },
            role: { select: { id: true, name: true, displayName: true } },
          },
        },
      },
      orderBy: { firstName: "asc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[USERS_GET_ALL]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// POST (create) a new user
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { email, username, password, firstName, lastName, status, assignments } = body;

    if (!email || !username || !password || !firstName || !lastName || !assignments?.length) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existingUser) {
      return new NextResponse("Email or Username already exists", { status: 409 });
    }

    const passwordHash = await bcryptjs.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email, username, passwordHash, firstName, lastName,
        status: status || UserStatus.PENDING_ACTIVATION,
        createdBy: session.user.id,
        assignments: {
          create: assignments.map((a: { businessUnitId: string; roleId: string }) => ({
            businessUnitId: a.businessUnitId,
            roleId: a.roleId,
            assignedBy: session.user.id,
          })),
        },
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("[USERS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}