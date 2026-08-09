import { NextResponse } from "next/server";

const data = [
  { id: 1, name: "Test Product 1", price: 10.99 },
  { id: 2, name: "Test Product 2", price: 19.99 },
  { id: 3, name: "Test Product 3", price: 5.49 },
];

// 3. GET /api/test/:id
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    const product = data.find((p) => p.id === parseInt(id));

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// 4. EDIT /api/test/:id
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const body = await request.json();
    const { name, price } = body;
    const productIndex = data.findIndex((p) => p.id === parseInt(id));

    if (!productIndex) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    data[productIndex] = { id: parseInt(id), name, price };

    return NextResponse.json({ data: data[productIndex] });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// 5. DELETE /api/test/:id
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const productIndex = data.findIndex((p) => p.id === parseInt(id));

    if (!productIndex) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    data.splice(productIndex, 1);

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
