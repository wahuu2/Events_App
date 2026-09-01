import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/database";
import Event from "@/database/event.model";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim();
    const category = searchParams.get("category")?.trim();
    const location = searchParams.get("location")?.trim();
    const dateFilter = searchParams.get("date")?.trim().toLowerCase();
    const priceFilter = searchParams.get("price")?.trim().toLowerCase();
    const sort = searchParams.get("sort")?.trim().toLowerCase();

    const filter: Record<string, unknown> = {};

    // Search by title, description, or location
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by category
    if (category && category.toLowerCase() !== "all") {
      filter.category = {
        $regex: `^${category}$`,
        $options: "i",
      };
    }

    // Filter by location
    if (location && location.toLowerCase() !== "all") {
      filter.location = {
        $regex: location,
        $options: "i",
      };
    }

    // Filter by date
    if (dateFilter === "today") {
      const now = new Date();

      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      filter.date = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    if (dateFilter === "week") {
      const now = new Date();

      const startOfWeek = new Date(now);
      startOfWeek.setHours(0, 0, 0, 0);

      const day = startOfWeek.getDay();
      const difference = day === 0 ? 6 : day - 1;

      startOfWeek.setDate(startOfWeek.getDate() - difference);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      filter.date = {
        $gte: startOfWeek,
        $lte: endOfWeek,
      };
    }

    if (dateFilter === "month") {
      const now = new Date();

      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );

      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      filter.date = {
        $gte: startOfMonth,
        $lte: endOfMonth,
      };
    }

    // Filter by price
    if (priceFilter === "free") {
      filter.price = 0;
    }

    if (priceFilter === "paid") {
      filter.price = {
        $gt: 0,
      };
    }

    // Sorting
let sortOption: Record<string, 1 | -1> = {
  date: 1,
};

if (sort === "latest") {
  sortOption = {
    date: -1,
  };
}

if (sort === "price-low") {
  sortOption = {
    price: 1,
  };
}

if (sort === "price-high") {
  sortOption = {
    price: -1,
  };
}

const events = await Event.find(filter)
  .populate(
    "organizer",
    "firstName lastName email imageUrl"
  )
  .sort(sortOption)
  .limit(100)
  .lean();

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Get events error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch events",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please sign in.",
        },
        { status: 401 }
      );
    }

    // Only organizers can create events
    if (user.role !== "organizer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only organizers can create events.",
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const body = await request.json();

    const {
      title,
      description,
      image,
      location,
      date,
      time,
      category,
      price,
      capacity,
    } = body;

    // Basic validation
    if (
      !title ||
      !description ||
      !image ||
      !location ||
      !date ||
      !time ||
      !category ||
      price === undefined ||
      capacity === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide all required event fields.",
        },
        { status: 400 }
      );
    }

    // Validate numbers
    const eventPrice = Number(price);
    const eventCapacity = Number(capacity);

    if (
      Number.isNaN(eventPrice) ||
      Number.isNaN(eventCapacity)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Price and capacity must be valid numbers.",
        },
        { status: 400 }
      );
    }

    if (eventPrice < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Price cannot be negative.",
        },
        { status: 400 }
      );
    }

    if (eventCapacity < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Capacity must be at least 1.",
        },
        { status: 400 }
      );
    }

    // Create event
    const event = await Event.create({
      title,
      description,
      image,
      location,
      date,
      time,
      category,
      price: eventPrice,
      capacity: eventCapacity,
      organizer: user._id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Event created successfully.",
        event,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create event error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create event.",
      },
      { status: 500 }
    );
  }
}