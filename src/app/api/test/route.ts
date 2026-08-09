import { NextResponse } from "next/server";

const data = [
  { id: 1, name: "Test Product 1", price: 10.99 },
  { id: 2, name: "Test Product 2", price: 19.99 },
  { id: 3, name: "Test Product 3", price: 5.49 },
];

1; // GET /api/test
export async function GET() {
  try {
    return NextResponse.json(
      {
        data: data,
        message: "Successfully retrieved test data",
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

2; // POST /api/test
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price } = body;
    const newData = { id: data.length + 1, name, price };
    data.push(newData);

    return NextResponse.json(
      {
        data: data,
        message: "Successfully created test data",
      },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
