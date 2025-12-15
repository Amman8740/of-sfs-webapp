"use client"
import { Tables } from "@/types_db"
import { columns } from "./models-columns"
import { DataTable } from "./models-data-table"
import { useModels } from "@/lib/utils/swr"; 
import { mutate as globalMutate } from 'swr';
import { AddModelsButton } from "@/components/ui/button/add-models";
import { AddModelModal } from "../models/add-model-modal";
import { ModelsIcon } from "@/components/ui/icons";
import { useState } from "react";
import { toast } from "sonner";

export default function ModelsListing() {
    const { models, isLoading, error, mutate } = useModels();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmitModel = async (modelData: any) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/models', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(modelData),
            });

            const responseData = await response.json();

            if (!response.ok) {
                const errorMessage = responseData.error || responseData.message || 'Failed to create model';
                toast.error('Failed to create model', {
                    description: errorMessage,
                });
                throw new Error(errorMessage);
            }

            await mutate((current: any) => ({
                ...current,
                data: [...(current?.data || []), responseData.data]
            }));
            toast.success('Model created successfully');
            setIsModalOpen(false);
            globalMutate('/api/models');
        } catch (error) {
            console.error('Error creating model:', error);
            toast.error('Failed to create model');
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };


    if (isLoading) {
        return (
            <div className="container flex flex-col gap-8 py-10 mx-auto">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Models</h1>
                    <AddModelsButton
                        onClick={() => setIsModalOpen(true)}
                        size="small"
                    />
                </div>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-gray-500">Loading models...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container flex flex-col gap-8 py-10 mx-auto">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Models</h1>
                    <AddModelsButton
                        onClick={() => setIsModalOpen(true)}
                        size="small"
                    />
                </div>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-red-500">Error loading models</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container flex flex-col gap-8 py-10 mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Models</h1>
                <AddModelsButton
                    onClick={() => setIsModalOpen(true)}
                    size="small"
                />
            </div>
            <AddModelModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmitModel}
            />
            {models && models.length > 0 ? (
                <DataTable columns={columns} data={models} />
            ) : (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div 
                        className="bg-white rounded-2xl p-10 flex flex-col items-center shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1),0px_1px_3px_0px_rgba(0,0,0,0.1)] max-w-[448px] w-full min-h-[410px]"
                    >
                        <div className="flex flex-col items-center justify-center flex-grow gap-4 mb-5">
                            <div className="mb-4 text-gray-300" style={{ width: '127.77px', height: '81.31px' }}>
                                <ModelsIcon className="w-full h-full" />
                            </div>
                            <div className="text-center">
                                <h3 className="mb-2 text-lg font-medium text-gray-900">No Models Found</h3>
                                <p className="max-w-sm text-center text-gray-500">
                                    Start by adding your first creator profile to manage profiles
                                </p>
                            </div>
                        </div>
                        <div className="mt-auto">
                            <AddModelsButton 
                                onClick={() => setIsModalOpen(true)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}