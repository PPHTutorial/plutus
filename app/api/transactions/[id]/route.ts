import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
        const userId = await params.id;
        const count = await prisma.transaction.count({
            where: {
                userId
            }
        });

        return NextResponse.json({
            count
        });
    } catch (error) {
        console.error("Error fetching transaction count:", error);
        throw new Error("Failed to fetch transaction count");
    }
};



