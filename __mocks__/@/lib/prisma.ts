
import { mockDeep } from "vitest-mock-extended";
import { PrismaClient } from "@/generated/prisma/client";

const prisma = mockDeep<PrismaClient>();

export default prisma;