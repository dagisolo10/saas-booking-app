import { getBusinessById } from "@/app/customer/_actions/get-business";
import ServiceListWithSelected from "@/app/customer/_components/services-list";
import { notFound } from "next/navigation";
import { Service } from "@/lib/types";

export default async function BusinessServiceCart({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    if (!id) return notFound();

    const business = await getBusinessById(id);

    if (!business || "error" in business) return notFound();

    const services = business.services as Service[];

    return <ServiceListWithSelected services={services} business={business} />;
}
