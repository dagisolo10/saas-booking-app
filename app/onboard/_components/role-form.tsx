"use client";
import React, { SyntheticEvent, useState } from "react";
import { Button } from "../../../components/ui/button";
import { useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "../../../components/ui/label";
import updateRole from "../_actions/update-role";

export default function RoleForm() {
    type UserRole = "CUSTOMER" | "ADMIN" | "BUSINESS";
    const [role, setRole] = useState<UserRole>("CUSTOMER");
    const router = useRouter();

    async function handleRoleChoice(e: SyntheticEvent) {
        e.preventDefault();
        await updateRole({ role });

        if (role === "BUSINESS") router.push("/business");
        else if (role === "CUSTOMER") router.push("/customer");
        else router.push("/admin/dashboard");
    }

    return (
        <form className="space-y-4" onSubmit={handleRoleChoice}>
            <RadioGroup onValueChange={(value) => setRole(value as UserRole)} defaultValue="CUSTOMER" className="w-fit">
                <div className="flex items-center gap-3">
                    <RadioGroupItem value="CUSTOMER" id="customer" />
                    <Label htmlFor="customer">I’m a Customer</Label>
                </div>
                <div className="flex items-center gap-3">
                    <RadioGroupItem value="BUSINESS" id="owner" />
                    <Label htmlFor="owner">I’m a Business Owner</Label>
                </div>
            </RadioGroup>
            <Button>Continue</Button>
        </form>
    );
}
