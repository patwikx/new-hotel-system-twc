// app/api/dashboard/route.ts

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ReservationStatus, HousekeepingStatus } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // --- UPDATED: Get businessUnitId exclusively from headers ---
    const businessUnitId = req.headers.get("x-business-unit-id")
    if (!businessUnitId) {
      return new NextResponse("Missing x-business-unit-id header", { status: 400 })
    }
    // --- END UPDATE ---

    const hasAccess = session.user.assignments.some(
      (assignment) => assignment.businessUnitId === businessUnitId
    )
    if (!hasAccess) {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const timeRange = searchParams.get("timeRange") || 'today'

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const startDate = new Date(today)
    if (timeRange === '7d') {
      startDate.setDate(today.getDate() - 7)
    } else if (timeRange === '30d') {
      startDate.setDate(today.getDate() - 30)
    }

    const [
      totalRoomsResult,
      reservations,
      cleanCount,
      dirtyCount,
      outOfOrderCount,
      todaysArrivals,
      todaysDepartures,
    ] = await prisma.$transaction([
      prisma.room.count({ where: { businessUnitId, isActive: true } }),
      prisma.reservation.findMany({
        where: {
          businessUnitId,
          status: { in: [ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN, ReservationStatus.CHECKED_OUT] },
          checkInDate: { gte: startDate },
        },
        select: { totalAmount: true, nights: true },
      }),
      prisma.room.count({ where: { businessUnitId, isActive: true, housekeeping: HousekeepingStatus.CLEAN } }),
      prisma.room.count({ where: { businessUnitId, isActive: true, housekeeping: HousekeepingStatus.DIRTY } }),
      prisma.room.count({ where: { businessUnitId, isActive: true, housekeeping: HousekeepingStatus.OUT_OF_ORDER } }),
      prisma.reservation.findMany({
        where: {
          businessUnitId,
          checkInDate: { gte: today, lt: tomorrow },
          status: { in: [ReservationStatus.CONFIRMED, ReservationStatus.CHECKED_IN] }
        },
        include: { guest: true, rooms: true }
      }),
      prisma.reservation.findMany({
        where: {
          businessUnitId,
          checkOutDate: { gte: today, lt: tomorrow },
          status: { in: [ReservationStatus.CHECKED_IN, ReservationStatus.CHECKED_OUT] }
        },
        include: { guest: true, rooms: true }
      }),
    ])

    const totalActiveRooms = totalRoomsResult > 0 ? totalRoomsResult : 1;
    const totalRevenue = reservations.reduce((sum, r) => sum + r.totalAmount.toNumber(), 0)
    const totalRoomNights = reservations.reduce((sum, r) => sum + r.nights, 0)
    
    const guestsCheckedIn = await prisma.reservation.count({
        where: { businessUnitId, status: ReservationStatus.CHECKED_IN }
    })

    const averageDailyRate = totalRoomNights > 0 ? totalRevenue / totalRoomNights : 0
    const occupancyRate = (guestsCheckedIn / totalActiveRooms) * 100

    const housekeeping = {
      clean: cleanCount,
      dirty: dirtyCount,
      outOfOrder: outOfOrderCount,
    }

    const todaysActivity = [
      ...todaysArrivals.map(r => ({
        id: r.id,
        type: 'ARRIVAL' as const,
        guestName: `${r.guest.firstName} ${r.guest.lastName}`,
        roomNumber: r.rooms[0]?.roomId || 'TBD',
        status: r.status,
      })),
      ...todaysDepartures.map(r => ({
        id: r.id,
        type: 'DEPARTURE' as const,
        guestName: `${r.guest.firstName} ${r.guest.lastName}`,
        roomNumber: r.rooms[0]?.roomId || 'N/A',
        status: r.status,
      })),
    ]

    const dashboardData = {
      summary: {
        occupancyRate, totalRevenue, averageDailyRate,
        guestsCheckedIn,
        todaysArrivals: todaysArrivals.length,
        todaysDepartures: todaysDepartures.length,
      },
      housekeeping,
      todaysActivity,
      recentBookings: [], 
      openServiceRequests: [],
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("[DASHBOARD_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}