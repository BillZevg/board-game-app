import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

// Δημιουργία PostgreSQL Connection Pool
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter, // Πέρασμα του adapter αντί για datasources / url
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
