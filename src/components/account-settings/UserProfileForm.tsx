import Input from "../form/input/InputField";
import { useUserSession } from "../context/UserSessionContext";
import Button from "../ui/button/Button";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import Swal from "../utils/AlertContainer";
import { useState } from "react";

export interface UserFormData {
    id: number;
    name: string;
    email: string;
    position: string;
    company: string;
    country: string;
    updatedBy: number;
}

export function UserProfileForm() {
    const { isOpen, openModal, closeModal } = useModal();
    const {user, setUser} = useUserSession();
    const [formData, setFormData] = useState<UserFormData>(user ? {
        id: user.id || 0,
        name: user.name || "",
        email: user.email || "",
        position: user.position || "",
        company: user.company || "",
        country: user.country || "",
        updatedBy: user.id || 0,
    } : {
        id: 0,
        name: "",
        email: "",
        position: "",
        company: "",
        country: "",
        updatedBy: 0,
    });

    const handleSave = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/profiles/update`, {
                method: 'POST',
                headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error("Failed to update profile");
            }
            
            Swal.fire({
                icon: "success",
                text: "Profile updated successfully!",
                duration: 3000,
            });

            localStorage.setItem('user', JSON.stringify(data.data));
            setUser(data.data);   
        } catch (error) {
            console.error("Error saving profile:", error);
            Swal.fire({
                icon: "error",  
                text: "Failed to save profile. Please try again.",
                duration: 3000,
            });
        }
        closeModal();
    };
    return (    
        <div className="rounded-2xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                    <div>
                        <p className="mb-2 text-md leading-normal text-gray-500 dark:text-gray-400">
                        Name
                        </p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {user?.name ?? "-"}
                        </p>
                    </div>
        
                    <div>
                        <p className="mb-2 text-md leading-normal text-gray-500 dark:text-gray-400">
                        Email address
                        </p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {user?.email ?? "-"}
                        </p>
                    </div>
        
                    <div>
                        <p className="mb-2 text-md leading-normal text-gray-500 dark:text-gray-400">
                        Company
                        </p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {user?.company ?? "-"}
                        </p>
                    </div>
        
                    <div>
                        <p className="mb-2 text-md leading-normal text-gray-500 dark:text-gray-400">
                        Country
                        </p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {user?.country ?? "-"}
                        </p>
                    </div>
                    </div>
                </div>
        
                <button
                    onClick={openModal}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
                >
                    <svg
                    className="fill-current"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                        fill=""
                    />
                    </svg>
                    Edit
                </button>
            </div>
    
            <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
                <div className="relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                    <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                        Edit Personal Information
                    </h4>
                    <p className="mb-5 text-sm text-gray-500 dark:text-gray-400 lg:mb-5">
                        Update your details to keep your profile up-to-date.
                    </p>
                    </div>
                    <form className="flex flex-col">
                        <div className="overflow-y-auto px-2 pb-3">
                            <div className="mt-5">
                                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-3">
                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Name</Label>
                                        <Input type="text" value={formData.name ?? ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} readonly/>
                                    </div>
                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Email</Label>
                                        <Input type="text" value={formData.email ?? ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} readonly/>
                                    </div>
                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Position</Label>
                                        <Input type="text" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })}/>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-x-6 gap-y-3 lg:grid-cols-2 mt-3">
                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Company</Label>
                                        <Input type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                                    </div>
                
                                    <div className="col-span-2 lg:col-span-1">
                                        <Label>Country</Label>
                                        <Input type="text" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                                    </div>
                
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                                <Button size="sm" variant="outline" onClick={closeModal}>
                                Close
                                </Button>
                                <Button size="sm" onClick={handleSave}>
                                Save Changes
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    )
}