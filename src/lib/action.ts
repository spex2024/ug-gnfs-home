"use server"

import { z } from "zod"

// Define the validation schema using Zod
const employeeFormSchema = z.object({
    firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
    middleName: z.string().optional(),
    lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
    dob: z.string(), // Date comes as string from form
    rank: z.string().min(1, { message: "Rank is required" }),
    appointmentDate: z.string(), // Date comes as string from form
    staffId: z.string().min(1, { message: "Staff ID is required" }),
    serviceNumber: z.string().min(1, { message: "Service number is required" }),
    bankName: z.string().min(1, { message: "Bank name is required" }),
    accountNumber: z
        .string()
        .regex(/^\d+$/, { message: "Account number must contain only digits" })
        .min(10, { message: "Account number must be at least 10 digits" }),
    address: z.string().min(5, { message: "Address must be at least 5 characters" }),
    phoneNumber: z
        .string()
        .regex(/^\+\d{1,3}\d{9,}$/, { message: "Phone number must be in international format (e.g., +233XXXXXXXXX)" }),
    emergencyContactName: z.string().min(2, { message: "Emergency contact name is required" }),
    emergencyContact: z
        .string()
        .regex(/^\+\d{1,3}\d{9,}$/, { message: "Emergency contact must be in international format (e.g., +233XXXXXXXXX)" }),
})

export type EmployeeFormData = z.infer<typeof employeeFormSchema>

export async function registerEmployee(formData: EmployeeFormData) {
    // Validate the form data
    const validatedFields = employeeFormSchema.safeParse(formData)

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    try {
        // Here you would typically save the data to your database
        // For now, we'll just return success

        // Simulate database operation
        await new Promise((resolve) => setTimeout(resolve, 1000))

        return {
            success: true,
            message: "Employee registered successfully",
        }
    } catch (error) {
        // Log the error and include it in the response
        console.error('Error registering employee:', error)


    }
}
