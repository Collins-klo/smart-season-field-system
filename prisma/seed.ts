import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Role, FieldStage } from "../types";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const agentPassword = await bcrypt.hash("agent123", 10);

  // 1. Create Users
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const admin = await prisma.user.upsert({
    where: { email: "admin@smartseason.co" },
    update: {},
    create: {
      email: "admin@smartseason.co",
      password: adminPassword,
      role: Role.ADMIN,
      name: "Amara Osei",
    },
  });

  const james = await prisma.user.upsert({
    where: { email: "james@smartseason.co" },
    update: {},
    create: {
      email: "james@smartseason.co",
      password: agentPassword,
      role: Role.FIELD_AGENT,
      name: "James Mwangi",
    },
  });

  const grace = await prisma.user.upsert({
    where: { email: "grace@smartseason.co" },
    update: {},
    create: {
      email: "grace@smartseason.co",
      password: agentPassword,
      role: Role.FIELD_AGENT,
      name: "Grace Achieng",
    },
  });

  // Helper date function
  const daysAgo = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  };

  // 2. Create Fields and Updates
  const fieldsData = [
    {
      name: "North Plot A",
      cropType: "Maize",
      plantingDate: daysAgo(5),
      stage: FieldStage.PLANTED,
      sizeHectares: 2.5,
      location: "Kiambu County",
      agentId: james.id,
      updates: [
        { agentId: james.id, stage: FieldStage.PLANTED, notes: "Seeds planted after morning rain.", createdAt: daysAgo(5) }
      ]
    },
    {
      name: "East Valley Farm",
      cropType: "Tea",
      plantingDate: daysAgo(65),
      stage: FieldStage.GROWING,
      sizeHectares: 5.0,
      location: "Kericho County",
      agentId: james.id,
      updates: [
        { agentId: james.id, stage: FieldStage.PLANTED, notes: "Initial planting complete.", createdAt: daysAgo(65) },
        { agentId: james.id, stage: FieldStage.GROWING, notes: "Weeding and fertilizer applied.", createdAt: daysAgo(30) },
        // Will be At Risk due to > 7 days since last update
      ]
    },
    {
      name: "Sunset Ridge",
      cropType: "Coffee",
      plantingDate: daysAgo(85),
      stage: FieldStage.READY,
      sizeHectares: 3.2,
      location: "Nyeri County",
      agentId: grace.id,
      updates: [
        { agentId: grace.id, stage: FieldStage.PLANTED, notes: "Seedlings planted.", createdAt: daysAgo(85) },
        { agentId: grace.id, stage: FieldStage.GROWING, notes: "Good growth observed.", createdAt: daysAgo(60) },
        { agentId: grace.id, stage: FieldStage.READY, notes: "Berries are ripening well.", createdAt: daysAgo(2) }
      ]
    },
    {
      name: "River Side Beans",
      cropType: "Beans",
      plantingDate: daysAgo(90),
      stage: FieldStage.HARVESTED,
      sizeHectares: 1.5,
      location: "Nakuru County",
      agentId: grace.id,
      updates: [
        { agentId: grace.id, stage: FieldStage.PLANTED, notes: "Planted.", createdAt: daysAgo(90) },
        { agentId: grace.id, stage: FieldStage.GROWING, notes: "Growing.", createdAt: daysAgo(75) },
        { agentId: grace.id, stage: FieldStage.READY, notes: "Ready for harvest.", createdAt: daysAgo(20) },
        { agentId: grace.id, stage: FieldStage.HARVESTED, notes: "Harvest completed. Yield was good.", createdAt: daysAgo(5) }
      ]
    },
    {
      name: "South Sorghum",
      cropType: "Sorghum",
      plantingDate: daysAgo(40), // 40 days planted, stage is PLANTED
      stage: FieldStage.PLANTED,
      sizeHectares: 4.0,
      location: "Machakos County",
      agentId: james.id,
      updates: [
        { agentId: james.id, stage: FieldStage.PLANTED, notes: "Planted late.", createdAt: daysAgo(40) }
        // Will be At Risk due to days since planting (40 > expected 14)
      ]
    },
    {
      name: "West Wing Wheat",
      cropType: "Wheat",
      plantingDate: daysAgo(20),
      stage: FieldStage.GROWING,
      sizeHectares: 10.0,
      location: "Narok County",
      agentId: grace.id,
      updates: [
        { agentId: grace.id, stage: FieldStage.PLANTED, notes: "Sown.", createdAt: daysAgo(20) },
        { agentId: grace.id, stage: FieldStage.GROWING, notes: "Germination successful.", createdAt: daysAgo(2) }
      ]
    },
    {
      name: "Central Maize B",
      cropType: "Maize",
      plantingDate: daysAgo(10),
      stage: FieldStage.PLANTED,
      sizeHectares: 2.0,
      location: "Kiambu County",
      agentId: james.id,
      updates: [
        { agentId: james.id, stage: FieldStage.PLANTED, notes: "Done.", createdAt: daysAgo(10) }
      ]
    },
    {
      name: "Highland Tea",
      cropType: "Tea",
      plantingDate: daysAgo(75),
      stage: FieldStage.READY,
      sizeHectares: 6.5,
      location: "Kericho County",
      agentId: grace.id,
      updates: [
        { agentId: grace.id, stage: FieldStage.PLANTED, notes: "Planted.", createdAt: daysAgo(75) },
        { agentId: grace.id, stage: FieldStage.GROWING, notes: "Growing.", createdAt: daysAgo(50) },
        { agentId: grace.id, stage: FieldStage.READY, notes: "Ready for harvest.", createdAt: daysAgo(1) }
      ]
    }
  ];

  for (const field of fieldsData) {
    const { updates, ...fData } = field;
    await prisma.field.create({
      data: {
        ...fData,
        updates: {
          create: updates
        }
      }
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
