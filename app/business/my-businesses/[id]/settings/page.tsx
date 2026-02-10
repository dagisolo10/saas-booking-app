import { getMyBusinessById } from "@/app/business/_actions/get-my-business";
import UpdateBusinessForm from "@/app/business/_components/business-settings";
import { notFound } from "next/navigation";

export default async function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const business = await getMyBusinessById(id);

    if (!business || "error" in business) return notFound();

    return <UpdateBusinessForm initialData={business} />;
}
