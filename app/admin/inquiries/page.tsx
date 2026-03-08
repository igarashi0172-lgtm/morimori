import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminInquiryClient from "./AdminInquiryClient";
import { headers } from "next/headers";

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const adminKey = process.env.ADMIN_KEY ?? "morimori-admin";

  if (key !== adminKey) {
    redirect(`/admin/inquiries/login`);
  }

  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminInquiryClient
      initialItems={inquiries.map(i => ({
        ...i,
        createdAt: i.createdAt.toISOString(),
      }))}
    />
  );
}
