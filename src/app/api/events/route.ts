import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/database";
import Event from "@/database/event.model";
import { getCurrentUser } from "@/lib/auth";
import { sensitiveRateLimiter } from "@/lib/rate-limit";

const MAX_SEARCH_LENGTH = 100;
const MAX_TEXT_LENGTH = 5000;

const ALLOWED_CREATE_FIELDS = [
  "title",
  "description",
  "image",
  "location",
  "date",
  "time",
  "category",
  "price",
  "capacity",
] as const;

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidDate(value: unknown): boolean {
  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }

  if (typeof value !== "string" && typeof value !== "number") {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
}

/**
 * GET /api/events
 *
 * Public event listing with search and filters.
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const location = searchParams.get("location")?.trim() || "";
    const date = searchParams.get("date")?.trim() || "";
    const price = searchParams.get("price")?.trim() || "";
    const sort = searchParams.get("sort")?.trim() || "latest";

    if (search.length > MAX_SEARCH_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          message: "Search query is too long.",
        },
        { status: 400 }
      );
    }

    if (category.length > MAX_SEARCH_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          message: "Category filter is too long.",
        },
        { status: 400 }
      );
    }

    if (location.length > MAX_SEARCH_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          message: "Location filter is too long.",
        },
        { status: 400 }
      );
    }

    const validDateFilters = ["today", "week", "month"];

    if (date && !validDateFilters.includes(date)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid date filter.",
        },
        { status: 400 }
      );
    }

    const validPriceFilters = ["free", "paid"];

    if (price && !validPriceFilters.includes(price)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid price filter.",
        },
        { status: 400 }
      );
    }

    const validSortOptions = [
      "latest",
      "price-low",
      "price-high",
    ];

    if (!validSortOptions.includes(sort)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid sort option.",
        },
        { status: 400 }
      );
    }

    const query: Record<string, unknown> = {};

    if (search) {
      const safeSearch = escapeRegex(search);

      query.$or = [
        {
          title: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          description: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          location: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          category: {
            $regex: safeSearch,
            $options: "i",
          },
        },
      ];
    }

    if (category) {
      query.category = {
        $regex: escapeRegex(category),
        $options: "i",
      };
    }

    if (location) {
      query.location = {
        $regex: escapeRegex(location),
        $options: "i",
      };
    }

    if (price === "free") {
      query.price = 0;
    }

    if (price === "paid") {
      query.price = { $gt: 0 };
    }

    if (date) {
      const now = new Date();

      if (date === "today") {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        query.date = {
          $gte: start,
          $lt: end,
        };
      }

      if (date === "week") {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(end.getDate() + 7);

        query.date = {
          $gte: start,
          $lt: end,
        };
      }

      if (date === "month") {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);

        query.date = {
          $gte: start,
          $lt: end,
        };
      }
    }

    let sortQuery: Record<string, 1 | -1> = {
      date: 1,
    };

    if (sort === "latest") {
      sortQuery = {
        createdAt: -1,
      };
    }

    if (sort === "price-low") {
      sortQuery = {
        price: 1,
      };
    }

    if (sort === "price-high") {
      sortQuery = {
        price: -1,
      };
    }

    const events = await Event.find(query)
      .populate(
        "organizer",
        "firstName lastName email imageUrl"
      )
      .sort(sortQuery)
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
        message: "Failed to fetch events.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events
 *
 * Create a new event.
 * Only authenticated organizers can create events.
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be signed in.",
        },
        { status: 401 }
      );
    }

    if (currentUser.role !== "organizer") {
      return NextResponse.json(
        {
          success: false,
          message: "Only organizers can create events.",
        },
        { status: 403 }
      );
    }

    const rateLimit = await sensitiveRateLimiter.limit(
      `event:create:${currentUser._id.toString()}`
    );

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many event creation attempts. Please try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (rateLimit.reset - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Request body must be a valid object.",
        },
        { status: 400 }
      );
    }

    const requestBody = body as Record<string, unknown>;

    const unknownFields = Object.keys(requestBody).filter(
      (field) =>
        !ALLOWED_CREATE_FIELDS.includes(
          field as (typeof ALLOWED_CREATE_FIELDS)[number]
        )
    );

    if (unknownFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Unexpected field(s): ${unknownFields.join(", ")}.`,
        },
        { status: 400 }
      );
    }

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
    } = requestBody;

    if (!isNonEmptyString(title)) {
      return NextResponse.json(
        {
          success: false,
          message: "Title is required.",
        },
        { status: 400 }
      );
    }

    if (!isNonEmptyString(description)) {
      return NextResponse.json(
        {
          success: false,
          message: "Description is required.",
        },
        { status: 400 }
      );
    }

    if (!isNonEmptyString(image)) {
      return NextResponse.json(
        {
          success: false,
          message: "Image is required.",
        },
        { status: 400 }
      );
    }

    if (!isNonEmptyString(location)) {
      return NextResponse.json(
        {
          success: false,
          message: "Location is required.",
        },
        { status: 400 }
      );
    }

    if (!isValidDate(date)) {
      return NextResponse.json(
        {
          success: false,
          message: "Date must be a valid date.",
        },
        { status: 400 }
      );
    }

    if (!isNonEmptyString(time)) {
      return NextResponse.json(
        {
          success: false,
          message: "Time is required.",
        },
        { status: 400 }
      );
    }

    if (!isNonEmptyString(category)) {
      return NextResponse.json(
        {
          success: false,
          message: "Category is required.",
        },
        { status: 400 }
      );
    }

    if (title.trim().length > 200) {
      return NextResponse.json(
        {
          success: false,
          message: "Title is too long.",
        },
        { status: 400 }
      );
    }

    if (description.trim().length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          message: "Description is too long.",
        },
        { status: 400 }
      );
    }

    if (image.trim().length > 2000) {
      return NextResponse.json(
        {
          success: false,
          message: "Image URL is too long.",
        },
        { status: 400 }
      );
    }

    if (location.trim().length > 200) {
      return NextResponse.json(
        {
          success: false,
          message: "Location is too long.",
        },
        { status: 400 }
      );
    }

    if (time.trim().length > 50) {
      return NextResponse.json(
        {
          success: false,
          message: "Time is too long.",
        },
        { status: 400 }
      );
    }

    if (category.trim().length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Category is too long.",
        },
        { status: 400 }
      );
    }

    if (typeof price === "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "Price must be a valid number.",
        },
        { status: 400 }
      );
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Price must be a valid non-negative number.",
        },
        { status: 400 }
      );
    }

    if (typeof capacity === "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "Capacity must be a valid number.",
        },
        { status: 400 }
      );
    }

    const numericCapacity = Number(capacity);

    if (
      !Number.isInteger(numericCapacity) ||
      numericCapacity < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Capacity must be a whole number greater than 0.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      image: image.trim(),
      location: location.trim(),
      date: new Date(date as string | number),
      time: time.trim(),
      category: category.trim(),
      price: numericPrice,
      capacity: numericCapacity,

      // IMPORTANT:
      // The organizer is always taken from the authenticated
      // database user, never from the client request.
      organizer: currentUser._id,
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