import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth"; // Assuming this is your NextAuth.js setup
import { prisma } from "@/lib/prisma";
import bcryptjs from "bcryptjs";
import { UserStatus } from "@prisma/client";

/**
 * GET all users for a specific Business Unit.
 * The requesting user must be assigned to the Business Unit.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const businessUnitId = req.headers.get("x-business-unit-id");
    if (!businessUnitId) {
      return new NextResponse("Missing x-business-unit-id header", {
        status: 400,
      });
    }

    // Check if the authenticated user has access to this business unit
    const hasAccess = session.user.assignments.some(
      (assignment) => assignment.businessUnitId === businessUnitId
    );

    if (!hasAccess) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: {
        assignments: {
          some: {
            businessUnitId: businessUnitId,
          },
        },
      },
      // Exclude passwordHash from the response for security
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        status: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        createdAt: true,
        assignments: {
          select: {
            businessUnit: {
              select: {
                id: true,
                name: true,
              },
            },
            role: {
              select: {
                id: true,
                name: true, // Updated from 'role' to 'name'
                displayName: true,
              },
            },
          },
        },
      },
      orderBy: {
        firstName: "asc", // Updated from 'name' to 'firstName'
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[USERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

/**
 * POST a new user and assign them to one or more Business Units/Roles.
 * The requesting user must have an admin-level role in the target Business Unit.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const businessUnitId = req.headers.get("x-business-unit-id");
    if (!businessUnitId) {
      return new NextResponse("Missing x-business-unit-id header", {
        status: 400,
      });
    }

    // Check if user has an admin role for this business unit
    // NOTE: Adjust 'SUPER_ADMIN' if you use a different role name for user management
    const hasAdminAccess = session.user.assignments.some(
      (assignment) =>
        assignment.businessUnitId === businessUnitId &&
        (assignment.role.name === "SUPER_ADMIN" || assignment.role.name === "HOTEL_MANAGER") // Updated from role.role === 'Admin'
    );

    if (!hasAdminAccess) {
      return new NextResponse("Forbidden: Insufficient privileges", { status: 403 });
    }

    const body = await req.json();
    const { email, username, password, firstName, lastName, status, assignments } = body;

    // Updated validation to match the new schema
    if (!email || !username || !password || !firstName || !lastName || !assignments?.length) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check for existing user by email or username
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Username";
      return new NextResponse(`${field} already exists`, { status: 409 }); // 409 Conflict
    }

    const passwordHash = await bcryptjs.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash, // Updated from 'password'
        firstName,    // Updated from 'name'
        lastName,     // Updated from 'name'
        status: status || UserStatus.PENDING_ACTIVATION, // Updated from 'isActive'
        createdBy: session.user.id, // Track who created the user
        assignments: {
          create: assignments.map(
            (assignment: { businessUnitId: string; roleId: string }) => ({
              businessUnitId: assignment.businessUnitId,
              roleId: assignment.roleId,
              assignedBy: session.user.id, // Track who made the assignment
            })
          ),
        },
      },
      // Select the fields to return, excluding the password hash
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        status: true,
        createdAt: true,
        assignments: {
          select: {
            businessUnit: {
              select: {
                id: true,
                name: true,
              },
            },
            role: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
          },
        },
      }
    });

    return NextResponse.json(user, { status: 201 }); // 201 Created
  } catch (error) {
    console.error("[USERS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}