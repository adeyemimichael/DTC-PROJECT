// import { createClient } from "@/lib/supabase/server";
// import { NextResponse } from "next/server";

// // 1. GET Request: Fetch all products
// export async function GET() {
//   const supabase = await createClient();

//   const { data, error } = await supabase.from("products").select("*");

//   if (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }

//   return NextResponse.json({ data });
// }

// // 2. POST Request: Create a new product
// export async function POST(request: Request) {
//   const supabase = await createClient();

//   try {
//     // Parse the JSON body sent from your frontend
//     const body = await request.json();
//     const { name, price } = body;

//     // Validate incoming data
//     if (!name || !price) {
//       return NextResponse.json(
//         { error: "Name and price are required" },
//         { status: 400 },
//       );
//     }

//     // Insert data into Supabase
//     const { data, error } = await supabase
//       .from("products")
//       .insert([{ name, price }])
//       .select() // Tells Supabase to return the newly created row
//       .single();

//     if (error) {
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }

//     return NextResponse.json({ data }, { status: 201 });
//   } catch (err) {
//     return NextResponse.json(
//       { error: "Invalid JSON request body" },
//       { status: 400 },
//     );
//   }
// }
