"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"
import toast from "react-hot-toast"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useEmployeeStore } from "@/app/store/employee"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DayPicker } from "react-day-picker"

// Function to validate Roman numerals
const isValidRomanNumeral = (value: string) => {
    return /^(M{0,3})(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/i.test(value)
}

// Define the validation schema using Zod
const employeeFormSchema = z
    .object({
        firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
        middleName: z.string().optional(),
        lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
        dob: z.date({ required_error: "Date of birth is required" }),
        gender: z.string().min(1, { message: "Gender is required" }),
        maritalStatus: z.string().min(1, { message: "Marital status is required" }),
        levelOfficer: z.string().min(1, { message: "Level officer is required" }),
        rank: z.string().min(1, { message: "Rank is required" }),
        qualification: z.string().min(1, { message: "Qualification is required" }),
        mateType: z.string().optional(),
        mateNumber: z.string().optional(),
        appointmentDate: z.date({ required_error: "Appointment date is required" }),
        staffId: z.string().min(1, { message: "Staff ID is required" }),
        serviceNumber: z.string().min(1, { message: "Service number is required" }),
        bankName: z.string().min(1, { message: "Bank name is required" }),
        accountNumber: z
            .string()
            .regex(/^\d+$/, { message: "Account number must contain only digits" })
            .min(10, { message: "Account number must be at least 10 digits" }),
        address: z.string().min(5, { message: "Address must be at least 5 characters" }),
        email: z.string().email({ message: "Please enter a valid email address" }),
        nationalId: z.string().min(1, { message: "National ID is required" }),
        phoneNumber: z
            .string()
            .regex(/^0\d{9,}$/, { message: "Phone number must start with 0 followed by at least 9 digits" }),
        emergencyContactName: z.string().min(2, { message: "Emergency contact name is required" }),
        emergencyContact: z.string().regex(/^0\d{9,}$/, {
            message: "Emergency contact must start with 0 followed by at least 9 digits",
        }),
    })
    .refine(
        (data) => {
            // Custom validation for mate number based on mate type
            if (data.mateType === "intake") {
                return isValidRomanNumeral(data.mateNumber || "")
            }
            return true
        },
        {
            message: "Intake mate number must be a valid Roman numeral (e.g., I, II, III, IV, V, etc.)",
            path: ["mateNumber"],
        },
    )

type EmployeeFormValues = z.infer<typeof employeeFormSchema>

// Custom date picker component with improved design
function CustomDatePicker({
                              value,
                              onChange,
                              disabled,
                          }: {
    value?: Date
    onChange: (date?: Date) => void
    disabled?: (date: Date) => boolean
}) {
    const [month, setMonth] = useState<Date>(value || new Date())

    const years = Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => new Date().getFullYear() - i)

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]

    const handleMonthChange = (newMonth: number) => {
        const newDate = new Date(month)
        newDate.setMonth(newMonth)
        setMonth(newDate)
    }

    const handleYearChange = (newYear: number) => {
        const newDate = new Date(month)
        newDate.setFullYear(newYear)
        setMonth(newDate)
    }

    const handlePrevMonth = () => {
        const newDate = new Date(month)
        newDate.setMonth(newDate.getMonth() - 1)
        setMonth(newDate)
    }

    const handleNextMonth = () => {
        const newDate = new Date(month)
        newDate.setMonth(newDate.getMonth() + 1)
        setMonth(newDate)
    }

    return (
        <div className="p-3 bg-white rounded-lg shadow-sm">
            {/* Header with month/year selection */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        onClick={handlePrevMonth}
                    >
                        <ChevronLeft className="h-5 w-5" />
                        <span className="sr-only">Previous month</span>
                    </Button>

                    <div className="flex items-center gap-1">
                        <Select
                            value={month.getMonth().toString()}
                            onValueChange={(value) => handleMonthChange(Number.parseInt(value))}
                        >
                            <SelectTrigger className="h-8 min-w-[120px] border-0 bg-slate-50 hover:bg-slate-100 focus:ring-0">
                                <SelectValue>{months[month.getMonth()]}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {months.map((monthName, index) => (
                                    <SelectItem key={monthName} value={index.toString()}>
                                        {monthName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={month.getFullYear().toString()}
                            onValueChange={(value) => handleYearChange(Number.parseInt(value))}
                        >
                            <SelectTrigger className="h-8 min-w-[90px] border-0 bg-slate-50 hover:bg-slate-100 focus:ring-0">
                                <SelectValue>{month.getFullYear()}</SelectValue>
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {years.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        onClick={handleNextMonth}
                    >
                        <ChevronRight className="h-5 w-5" />
                        <span className="sr-only">Next month</span>
                    </Button>
                </div>
            </div>

            {/* Calendar */}
            <DayPicker
                mode="single"
                selected={value}
                onSelect={onChange}
                month={month}
                onMonthChange={setMonth}
                disabled={disabled}
                className="border-0 p-0 m-0"
                classNames={{
                    months: "flex flex-col",
                    month: "space-y-2",
                    caption: "hidden", // Hide default caption since we have our custom header
                    caption_label: "hidden",
                    nav: "hidden",
                    table: "w-full border-collapse",
                    head_row: "flex",
                    head_cell: "text-slate-500 rounded-md w-9 font-normal text-[0.8rem] m-0.5",
                    row: "flex w-full",
                    cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-transparent",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md m-0.5 flex items-center justify-center",
                    day_selected:
                        "bg-[#DC143C] text-white hover:bg-[#c01235] hover:text-white focus:bg-[#DC143C] focus:text-white",
                    day_today: "bg-slate-100 text-slate-900",
                    day_outside: "text-slate-300 opacity-50",
                    day_disabled: "text-slate-300 opacity-50",
                    day_range_middle: "aria-selected:bg-slate-100 aria-selected:text-slate-900",
                    day_hidden: "invisible",
                }}
                components={{
                    IconLeft: () => null, // We're handling navigation in our custom header
                    IconRight: () => null,
                }}
                footer={
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            onClick={() => {
                                onChange(new Date())
                                setMonth(new Date())
                            }}
                        >
                            Today
                        </Button>
                    </div>
                }
            />
        </div>
    )
}

// Define section colors for consistent theming using the provided color scheme
const sectionColors = {
    personal: {
        border: "border-t-[#DC143C]",
        bg: "bg-[#DC143C]/10",
        title: "text-[#DC143C]",
        icon: "text-[#DC143C]",
    },
    employment: {
        border: "border-t-[#8B4513]",
        bg: "bg-[#8B4513]/10",
        title: "text-[#8B4513]",
        icon: "text-[#8B4513]",
    },
    banking: {
        border: "border-t-[#2E8B57]",
        bg: "bg-[#2E8B57]/10",
        title: "text-[#2E8B57]",
        icon: "text-[#2E8B57]",
    },
    contact: {
        border: "border-t-[#FFD700]",
        bg: "bg-[#FFD700]/10",
        title: "text-[#1C1F2A]",
        icon: "text-[#FFD700]",
    },
}

// Animation variants for Framer Motion
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15,
        },
    },
}

const formFieldVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 10,
        },
    },
}

export default function EmployeeForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [levelOfficer, setLevelOfficer] = useState<string>("")
    const [mateType, setMateType] = useState<string>("")
    const [currentStep, setCurrentStep] = useState(1)
    const [formProgress, setFormProgress] = useState(0)
    const [isStepValid, setIsStepValid] = useState(false)

    // Default values for the form
    const defaultValues: Partial<EmployeeFormValues> = {
        firstName: "",
        middleName: "",
        lastName: "",
        levelOfficer: "",
        rank: "",
        qualification: "",
        mateType: "",
        mateNumber: "",
        staffId: "",
        serviceNumber: "",
        bankName: "",
        accountNumber: "",
        address: "",
        email: "",
        nationalId: "",
        phoneNumber: "",
        emergencyContactName: "",
        emergencyContact: "",
        gender: "",
        maritalStatus: "",
    }

    const form = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeFormSchema),
        defaultValues,
    })

    // Watch for mate type changes to update validation
    const watchedMateType = form.watch("mateType")

    useEffect(() => {
        setMateType(watchedMateType || "")
        // Reset mate number when mate type changes
        if (watchedMateType !== mateType) {
            form.setValue("mateNumber", "")
        }
    }, [watchedMateType, form, mateType])

    // Calculate form progress
    useEffect(() => {
        const formValues = form.getValues()
        // Define the total number of fields manually instead of using Object.keys on the schema
        const totalFields = 22 // Total number of fields in the form
        const filledFields = Object.entries(formValues).filter(([_, value]) => {
            if (value === undefined || value === "") return false
            return true
        }).length

        setFormProgress(Math.round((filledFields / totalFields) * 100))
    }, [form.watch()])

    const { addEmployee } = useEmployeeStore()
    async function onSubmit(data: EmployeeFormValues) {
        setIsSubmitting(true)
        let loadingToast: string | undefined

        try {
            loadingToast = toast.loading("Registering employee...")

            // Combine mateType and mateNumber
            const combinedData = {
                ...data,
                mateInfo: `${data.mateType}-${data.mateNumber}`, // Combine as one string
            }

            console.log(combinedData)

            await addEmployee(combinedData)

            toast.dismiss(loadingToast)
            toast.success(`${data.firstName} ${data.lastName} has been registered successfully! 👏`, {
                duration: 5000,
                style: {
                    background: "#DC143C",
                    color: "#fff",
                    borderRadius: "10px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                },
            })

            handleResetForm()
        } catch (error) {
            toast.dismiss(loadingToast)

            const errMsg = error instanceof Error ? error.message : "There was a problem registering the employee."
            toast.error(errMsg, {
                duration: 5000,
                style: {
                    background: "#ef4444",
                    color: "#fff",
                    borderRadius: "10px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                },
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Function to handle step navigation
    const goToStep = (step: number) => {
        setCurrentStep(step)
        // Scroll to top when changing steps
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    // Function to properly reset the form including select fields
    const handleResetForm = () => {
        form.reset(defaultValues)
        setLevelOfficer("")
        setMateType("")
        setCurrentStep(1)
    }

    // Function to check if the current step's required fields are filled
    const isCurrentStepValid = () => {
        const formValues = form.getValues()
        const formErrors = form.formState.errors

        // Check if there are any errors in the form
        if (Object.keys(formErrors).length > 0) return false

        // Define required fields for each step
        const requiredFieldsByStep = {
            1: ["firstName", "lastName", "dob", "gender", "maritalStatus", "nationalId"],
            2: ["levelOfficer", "rank", "qualification", "appointmentDate", "staffId", "serviceNumber", "email"],
            3: ["bankName", "accountNumber"],
            4: ["address", "phoneNumber", "emergencyContactName", "emergencyContact"],
        }

        // Check if all required fields for the current step are filled
        return requiredFieldsByStep[currentStep as keyof typeof requiredFieldsByStep].every((field) => {
            const value = formValues[field as keyof typeof formValues]
            return value !== undefined && value !== ""
        })
    }

    // Update step validation status whenever form values change
    useEffect(() => {
        setIsStepValid(isCurrentStepValid())
    }, [form.watch(), currentStep])

    return (
        <div className="py-8  min-h-screen">
            <motion.div className="container mx-auto px-4" initial="hidden" animate="visible" variants={containerVariants}>
                {/* Header with Logo */}
                <motion.div
                    className="flex flex-col bg-white p-6 rounded-xl shadow-md mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center gap-4 mb-4">
                        <img
                            src="https://res.cloudinary.com/ddwet1dzj/image/upload/v1745603414/samples/gE0ZW3qx_400x400_kyfgdz.jpg"
                            alt="University of Ghana Fire Station Logo"
                            className="w-16 h-16 rounded-full border-4 border-[#8B4513] shadow-md"
                        />
                        <div>
                            <h1 className="sm:text-2xl font-bold text-[#1C1F2A]">University of Ghana Fire Station</h1>
                            <p className="sm:text-base text-[#8B4513] ">Staff Data Collection</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex flex-col items-end mt-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#1C1F2A]">{formProgress}% Complete</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                            <motion.div
                                className="h-full bg-gradient-to-r from-[#DC143C] to-[#8B4513] rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${formProgress}%` }}
                                transition={{ duration: 0.5 }}
                            ></motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content - Side by Side Layout */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column - Consent and Information */}
                    <motion.div
                        className="lg:w-1/3 space-y-6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {/* Information Card */}
                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#DC143C]">
                            <h2 className="text-xl font-semibold text-[#1C1F2A] flex items-center gap-2 mb-4">
                                <CheckCircle2 className="h-5 w-5 text-[#DC143C]" />
                                Staff Information System
                            </h2>

                            <p className="text-sm text-[#1C1F2A] mb-4 leading-relaxed">
                                Welcome to the University of Ghana Fire Station Staff Data Collection system. This digital platform
                                streamlines our administrative processes and ensures that we have accurate information about all our
                                personnel.
                            </p>

                            <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                    <div className="mt-1 text-[#DC143C] font-bold">•</div>
                                    <p className="text-sm text-[#1C1F2A]">
                                        <span className="font-medium">Complete all sections</span> - Personal, Employment, Banking, and
                                        Contact details
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="mt-1 text-[#DC143C] font-bold">•</div>
                                    <p className="text-sm text-[#1C1F2A]">
                                        <span className="font-medium">Accurate information</span> - Ensure all details are current and
                                        correct
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="mt-1 text-[#DC143C] font-bold">•</div>
                                    <p className="text-sm text-[#1C1F2A]">
                                        <span className="font-medium">Save progress</span> - You can complete the form in multiple sessions
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Consent Card */}
                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#8B4513]">
                            <h2 className="text-xl font-semibold text-[#1C1F2A] flex items-center gap-2 mb-4">
                                <CheckCircle2 className="h-5 w-5 text-[#8B4513]" />
                                Consent and Privacy
                            </h2>

                            <p className="text-sm text-[#1C1F2A] mb-4 leading-relaxed">
                                As part of our ongoing efforts to ensure organized and centralized staff data management, we are
                                collecting the following:
                            </p>

                            <div className="bg-slate-50 p-4 rounded-md border-l-4 border-[#DC143C] mb-4">
                                <ul className="space-y-2 text-sm text-[#1C1F2A]">
                                    <li className="flex items-start gap-2">
                                        <div className="mt-1 text-[#DC143C]">•</div>
                                        <div>
                                            <span className="font-medium">Data Centralization:</span> All staff data will be stored in a
                                            centralized system.
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="mt-1 text-[#DC143C]">•</div>
                                        <div>
                                            <span className="font-medium">Efficiency:</span> Streamlines administrative tasks and improves
                                            operations.
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="mt-1 text-[#DC143C]">•</div>
                                        <div>
                                            <span className="font-medium">Confidentiality:</span> Your data is kept confidential at all times.
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="mt-1 text-[#DC143C]">•</div>
                                        <div>
                                            <span className="font-medium">Data Protection:</span> Protected by robust security measures.
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="mt-1 text-[#DC143C]">•</div>
                                        <div>
                                            <span className="font-medium">Compliance:</span> This process complies with relevant data
                                            protection laws.
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <p className="text-sm italic bg-[#FFD700]/10 p-3 rounded-md border-l-2 border-[#FFD700]">
                                By submitting your data, you consent to the collection and use of your information as described above.
                                We assure you that your privacy and data security are our top priorities.
                            </p>
                        </div>
                    </motion.div>

                    {/* Right Column - Multi-step Form */}
                    <motion.div
                        className="lg:w-2/3 space-y-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {/* Step Navigation */}
                        <div className="bg-white p-4 rounded-xl shadow-md">
                            <div className="flex flex-wrap gap-2 justify-between">
                                <Button
                                    variant={currentStep === 1 ? "default" : "outline"}
                                    onClick={() => goToStep(1)}
                                    className={cn(
                                        "flex-1 rounded-full bg-white/90 text-[#1C1F2A] border-[#DC143C] hover:bg-white",
                                        currentStep === 1 ? "bg-[#DC143C] text-white hover:bg-[#c01235]" : "",
                                    )}
                                >
                                    1. Personal
                                </Button>
                                <Button
                                    variant={currentStep === 2 ? "default" : "outline"}
                                    onClick={() => goToStep(2)}
                                    className={cn(
                                        "flex-1 rounded-full bg-white/90 text-[#1C1F2A] border-[#8B4513] hover:bg-white",
                                        currentStep === 2 ? "bg-[#8B4513] text-white hover:bg-[#7a3b10]" : "",
                                    )}
                                >
                                    2. Employment
                                </Button>
                                <Button
                                    variant={currentStep === 3 ? "default" : "outline"}
                                    onClick={() => goToStep(3)}
                                    className={cn(
                                        "flex-1 rounded-full bg-white/90 text-[#1C1F2A] border-[#2E8B57] hover:bg-white",
                                        currentStep === 3 ? "bg-[#2E8B57] text-white hover:bg-[#267a4b]" : "",
                                    )}
                                >
                                    3. Banking
                                </Button>
                                <Button
                                    variant={currentStep === 4 ? "default" : "outline"}
                                    onClick={() => goToStep(4)}
                                    className={cn(
                                        "flex-1 rounded-full bg-white/90 text-[#1C1F2A] border-[#FFD700] hover:bg-white",
                                        currentStep === 4 ? "bg-[#FFD700] text-[#1C1F2A] hover:bg-[#e6c200]" : "",
                                    )}
                                >
                                    4. Contact
                                </Button>
                            </div>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Personal Information */}
                                {currentStep === 1 && (
                                    <motion.div initial="hidden" animate="visible" variants={cardVariants}>
                                        <Card
                                            className={`shadow-md ${sectionColors.personal.border} border-t-4 hover:shadow-lg transition-all duration-300 bg-white`}
                                        >
                                            <CardHeader className="rounded-t-lg">
                                                <CardTitle className={`${sectionColors.personal.title} text-xl flex items-center gap-2`}>
                                                    <motion.div
                                                        initial={{ rotate: -10, scale: 0.9 }}
                                                        animate={{ rotate: 0, scale: 1 }}
                                                        transition={{ type: "spring", stiffness: 200 }}
                                                    >
                                                        <CheckCircle2 className={`h-5 w-5 ${sectionColors.personal.icon}`} />
                                                    </motion.div>
                                                    Personal Information
                                                </CardTitle>
                                                <CardDescription>Enter the employee&#39;s personal details.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6 pt-3">
                                                <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4" variants={formFieldVariants}>
                                                    <FormField
                                                        control={form.control}
                                                        name="firstName"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-slate-700 font-medium">First Name</FormLabel>
                                                                <div className="space-y-0">
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="Jane"
                                                                            {...field}
                                                                            className="border-slate-300 rounded-md focus:border-[#DC143C] focus:ring focus:ring-[#DC143C]/20 focus:ring-opacity-50 transition-all"
                                                                        />
                                                                    </FormControl>
                                                                    <div className="h-5">
                                                                        <FormMessage className="text-[#DC143C]" />
                                                                    </div>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="middleName"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-slate-700 font-medium">Middle Name</FormLabel>
                                                                <div className="space-y-0">
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="A."
                                                                            {...field}
                                                                            className="border-slate-300 rounded-md focus:border-[#DC143C] focus:ring focus:ring-[#DC143C]/20 focus:ring-opacity-50 transition-all"
                                                                        />
                                                                    </FormControl>
                                                                    <div className="h-5">
                                                                        <FormMessage className="text-[#DC143C]" />
                                                                    </div>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="lastName"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-slate-700 font-medium">Last Name</FormLabel>
                                                                <div className="space-y-0">
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="Smith"
                                                                            {...field}
                                                                            className="border-slate-300 rounded-md focus:border-[#DC143C] focus:ring focus:ring-[#DC143C]/20 focus:ring-opacity-50 transition-all"
                                                                        />
                                                                    </FormControl>
                                                                    <div className="h-5">
                                                                        <FormMessage className="text-[#DC143C]" />
                                                                    </div>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </motion.div>
                                                <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4" variants={formFieldVariants}>
                                                    <FormField
                                                        control={form.control}
                                                        name="dob"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-slate-700 font-medium">Date of Birth</FormLabel>
                                                                <div className="space-y-0">
                                                                    <Popover>
                                                                        <PopoverTrigger asChild>
                                                                            <FormControl>
                                                                                <Button
                                                                                    variant={"outline"}
                                                                                    className={cn(
                                                                                        "w-full pl-3 text-left font-normal border-slate-300 rounded-md focus:border-[#DC143C] focus:ring focus:ring-[#DC143C]/20 focus:ring-opacity-50 transition-all",
                                                                                        !field.value && "text-muted-foreground",
                                                                                    )}
                                                                                >
                                                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                                </Button>
                                                                            </FormControl>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent className="w-auto p-0" align="start">
                                                                            <CustomDatePicker
                                                                                value={field.value}
                                                                                onChange={field.onChange}
                                                                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                                            />
                                                                        </PopoverContent>
                                                                    </Popover>
                                                                    <div className="h-5">
                                                                        <FormMessage className="text-[#DC143C]" />
                                                                    </div>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="gender"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-slate-700 font-medium">Gender</FormLabel>
                                                                <div className="space-y-0">
                                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="border-slate-300 rounded-md focus:border-[#DC143C] focus:ring focus:ring-[#DC143C]/20 focus:ring-opacity-50 transition-all">
                                                                                <SelectValue placeholder="Select gender" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            <SelectItem value="Male">Male</SelectItem>
                                                                            <SelectItem value="Female">Female</SelectItem>
                                                                            <SelectItem value="Other">Other</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <div className="h-5">
                                                                        <FormMessage className="text-[#DC143C]" />
                                                                    </div>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="maritalStatus"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-slate-700 font-medium">Marital Status</FormLabel>
                                                                <div className="space-y-0">
                                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="border-slate-300 rounded-md focus:border-[#DC143C] focus:ring focus:ring-[#DC143C]/20 focus:ring-opacity-50 transition-all">
                                                                                <SelectValue placeholder="Select status" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            <SelectItem value="Single">Single</SelectItem>
                                                                            <SelectItem value="Married">Married</SelectItem>
                                                                            <SelectItem value="Divorced">Divorced</SelectItem>
                                                                            <SelectItem value="Widowed">Widowed</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <div className="h-5">
                                                                        <FormMessage className="text-[#DC143C]" />
                                                                    </div>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </motion.div>
                                                <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4" variants={formFieldVariants}>
                                                    <FormField
                                                        control={form.control}
                                                        name="nationalId"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-slate-700 font-medium">National ID</FormLabel>
                                                                <div className="space-y-0">
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="GHA-123456789-0"
                                                                            {...field}
                                                                            className="border-slate-300 rounded-md focus:border-[#DC143C] focus:ring focus:ring-[#DC143C]/20 focus:ring-opacity-50 transition-all"
                                                                        />
                                                                    </FormControl>
                                                                    <div className="h-5">
                                                                        <FormMessage className="text-[#DC143C]" />
                                                                    </div>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </motion.div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}

                                {/* Employment Information */}
                                {currentStep === 2 && (
                                    <motion.div initial="hidden" animate="visible" variants={cardVariants}>
                                        <Card
                                            className={`shadow-md ${sectionColors.employment.border} border-t-4 hover:shadow-lg transition-all duration-300 bg-white`}
                                        >
                                            <CardHeader className="rounded-t-lg">
                                                <CardTitle className={`${sectionColors.employment.title} text-xl flex items-center gap-2`}>
                                                    <motion.div
                                                        initial={{ rotate: -10, scale: 0.9 }}
                                                        animate={{ rotate: 0, scale: 1 }}
                                                        transition={{ type: "spring", stiffness: 200 }}
                                                    >
                                                        <CheckCircle2 className={`h-5 w-5 ${sectionColors.employment.icon}`} />
                                                    </motion.div>
                                                    Employment Information
                                                </CardTitle>
                                                <CardDescription>Enter the employee&#39;s work-related details.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6 pt-3">
                                                <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4" variants={formFieldVariants}>
                                                    <FormField
                                                        control={form.control}
                                                        name="levelOfficer"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-slate-700 font-medium">Level Officer</FormLabel>
                                                                <div className="space-y-0">
                                                                    <Select
                                                                        onValueChange={(value) => {
                                                                            field.onChange(value)
                                                                            setLevelOfficer(value)
                                                                            // Reset rank when level officer changes
                                                                            form.setValue("rank", "")
                                                                        }}
                                                                        value={field.value}
                                                                    >
                                                                        <FormControl>
                                                                            <SelectTrigger className="border-slate-300 rounded-md focus:border-[#8B4513] focus:ring focus:ring-[#8B4513]/20 focus:ring-opacity-50 transition-all">
                                                                                <SelectValue placeholder="Select level" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            <SelectItem value="Senior Officer">Senior Officer</SelectItem>
                                                                            <SelectItem value="Junior Officer">Junior Officer</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <div className="h-5">
                                                                        <FormMessage className="text-[#DC143C]" />
                                                                    </div>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="rank"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-slate-700 font-medium">Rank</FormLabel>
                                                                <div className="space-y-0">
                                                                    <Select onValueChange={field.onChange} value={field.value} disabled={!levelOfficer}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="border-slate-300 rounded-md focus:border-[#8B4513] focus:ring focus:ring-[#8B4513]/20 focus:ring-opacity-50 transition-all">
                                                                                <SelectValue
                                                                                    placeholder={levelOfficer ? "Select rank" : "Select level officer first"}
                                                                                />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            {levelOfficer === "Senior Officer" ? (
                                                                                <>
                                                                                    <SelectItem value="DCFO">DCFO</SelectItem>
                                                                                    <SelectItem value="AFCO I">AFCO I</SelectItem>
                                                                                    <SelectItem value="AFCO II">AFCO II</SelectItem>
                                                                                    <SelectItem value="DO I">DO I</SelectItem>
                                                                                    <SelectItem value="DO II">DO II</SelectItem>
                                                                                    <SelectItem value="DO III">DO III</SelectItem>
                                                                                    <SelectItem value="ADO I">ADO I</SelectItem>
                                                                                    <SelectItem value="ADO II">ADO II</SelectItem>
                                                                                </>
                                                                            ) : levelOfficer === "Junior Officer" ? (
                                                                                <>
                                                                                    <SelectItem value="RFW">RFW</SelectItem>
                                                                                    <SelectItem value="RFM">RFM</SelectItem>
                                                                                    <SelectItem value="FM">FM</SelectItem>
                                                                                    <SelectItem value="FW">FW</SelectItem>
                                                                                    <SelectItem value="LFM">LFM</SelectItem>
                                                                                    <SelectItem value="LFW">LFW</SelectItem>
                                                                                    <SelectItem value="SUB">SUB</SelectItem>
                                                                                    <SelectItem value="ASTNO">ASTNO</SelectItem>
                                                                                    <SelectItem value="AGO">AGO</SelectItem>
                                                                                    <SelectItem value="STNO II">STNO II</SelectItem>
                                                                                    <SelectItem value="STNO I">STNO I</SelectItem>
                                                                                    <SelectItem value="DGO">DGO</SelectItem>
                                                                                    <SelectItem value="GO">GO</SelectItem>
                                                                                </>
                                                                            ) : null}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <div className="h-5">
                                                                        <FormMessage className="text-[#DC143C]" />
                                                                    </div>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="qualification"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-slate-700 font-medium">Qualification</FormLabel>
                                                                <div className="space-y-0">
                                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="border-slate-300 rounded-md focus:border-[#8B4513] focus:ring focus:ring-[#8B4513]/20 focus:ring-opacity-50 transition-all">
                                                                                <SelectValue placeholder="Select qualification" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            <SelectItem value="JHS">JHS</SelectItem>
                                                                            <SelectItem value="SHS">SHS</SelectItem>
                                                                            <SelectItem value="DBS">DBS</SelectItem>
                                                                            <SelectItem value="Diploma">Diploma</SelectItem>
                                                                            <SelectItem value="NVTI">NVTI</SelectItem>
                                                                            <SelectItem value="Professional Certificate">Professional Certificate</SelectItem>
                                                                            <SelectItem value="HND">HND</SelectItem>
                                                                            <SelectItem value="Degree">Degree</SelectItem>
                                                                            <SelectItem value="Masters">Masters</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <div className="h-5">
                                                                        <FormMessage className="text-[#DC143C]" />
                                                                    </div>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </motion.div>

                                                {/* Rest of the employment fields */}
                                                {/* More form fields here... */}
                                                <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4" variants={formFieldVariants}>
                                                    <FormField
                                                        control={form.control}
                                                        name="appointmentDate"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-slate-700 font-medium">Appointment Date</FormLabel>
                                                                <div className="space-y-0">
                                                                    <Popover>
                                                                        <PopoverTrigger asChild>
                                                                            <FormControl>
                                                                                <Button
                                                                                    variant={"outline"}
                                                                                    className={cn(
                                                                                        "w-full pl-3 text-left font-normal border-slate-300 rounded-md focus:border-[#8B4513] focus:ring focus:ring-[#8B4513]/20 focus:ring-opacity-50 transition-all",
                                                                                        !field.value && "text-muted-foreground",
                                                                                    )}
                                                                                >
                                                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                                </Button>
                                                                            </FormControl>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent className="w-auto p-0" align="start">
                                                                            <CustomDatePicker
                                                                                value={field.value}
                                                                                onChange={field.onChange}
                                                                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                                            />
                                                                        </PopoverContent>
                                                                    </Popover>
                                                                    <div className="h-5">
                                                                        <FormMessage className="text-[#DC143C]" />
                                                                    </div>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="staffId"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-slate-700 font-medium">Staff ID</FormLabel>
                                                                <div className="space-y-0">
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="EMP002"
                                                                            {...field}
                                                                            className="border-slate-300 rounded-md focus:border-[#8B4513] focus:ring focus:ring-[#8B4513]/20 focus:ring-opacity-50 transition-all"
                                                                        />
                                                                    </FormControl>
                                                                    <div className="h-5">
                                                                        <FormMessage className="text-[#DC143C]" />
                                                                    </div>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="serviceNumber"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-slate-700 font-medium">Service Number</FormLabel>
                                                                <div className="space-y-0">
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="SN654321"
                                                                            {...field}
                                                                            className="border-slate-300 rounded-md focus:border-[#8B4513] focus:ring focus:ring-[#8B4513]/20 focus:ring-opacity-50 transition-all"
                                                                        />
                                                                    </FormControl>
                                                                    <div className="h-5">
                                                                        <FormMessage className="text-[#DC143C]" />
                                                                    </div>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </motion.div>
                                                <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4" variants={formFieldVariants}>
                                                    <FormField
                                                        control={form.control}
                                                        name="email"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-slate-700 font-medium">Email</FormLabel>
                                                                <div className="space-y-0">
                                                                    <FormControl>
                                                                        <Input
                                                                            type="email"
                                                                            placeholder="example@fireghana.gov.gh"
                                                                            {...field}
                                                                            className="border-slate-300 rounded-md focus:border-[#8B4513] focus:ring focus:ring-[#8B4513]/20 focus:ring-opacity-50 transition-all"
                                                                        />
                                                                    </FormControl>
                                                                    <div className="h-5">
                                                                        <FormMessage className="text-[#DC143C]" />
                                                                    </div>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="mateType"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-slate-700 font-medium">Mate Type</FormLabel>
                                                                <div className="space-y-0">
                                                                    <Select
                                                                        onValueChange={(value) => {
                                                                            field.onChange(value)
                                                                            // Reset mate number when mate type changes
                                                                            form.setValue("mateNumber", "")
                                                                        }}
                                                                        value={field.value}
                                                                    >
                                                                        <FormControl>
                                                                            <SelectTrigger className="border-slate-300 rounded-md focus:border-[#8B4513] focus:ring focus:ring-[#8B4513]/20 focus:ring-opacity-50 transition-all">
                                                                                <SelectValue placeholder="Select mate type" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            <SelectItem value="intake">Intake (Senior)</SelectItem>
                                                                            <SelectItem value="course">Course (Junior)</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <div className="h-5">
                                                                        <FormMessage className="text-[#DC143C]" />
                                                                    </div>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="mateNumber"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-slate-700 font-medium">Mate Number</FormLabel>
                                                                <div className="space-y-0">
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder={
                                                                                mateType === "intake"
                                                                                    ? "Roman numeral (e.g., IV)"
                                                                                    : "Number or alphanumeric (e.g., 123 or A123)"
                                                                            }
                                                                            {...field}
                                                                            className="border-slate-300 rounded-md focus:border-[#8B4513] focus:ring focus:ring-[#8B4513]/20 focus:ring-opacity-50 transition-all"
                                                                            disabled={!mateType}
                                                                        />
                                                                    </FormControl>
                                                                    <div className="h-5">
                                                                        <FormMessage className="text-[#DC143C]" />
                                                                    </div>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </motion.div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}

                                {/* Banking Information */}
                                {currentStep === 3 && (
                                    <motion.div initial="hidden" animate="visible" variants={cardVariants}>
                                        <Card
                                            className={`shadow-md ${sectionColors.banking.border} border-t-4 hover:shadow-lg transition-all duration-300 bg-white`}
                                        >
                                            <CardHeader className="rounded-t-lg">
                                                <CardTitle className={`${sectionColors.banking.title} text-xl flex items-center gap-2`}>
                                                    <motion.div
                                                        initial={{ rotate: -10, scale: 0.9 }}
                                                        animate={{ rotate: 0, scale: 1 }}
                                                        transition={{ type: "spring", stiffness: 200 }}
                                                    >
                                                        <CheckCircle2 className={`h-5 w-5 ${sectionColors.banking.icon}`} />
                                                    </motion.div>
                                                    Banking Information
                                                </CardTitle>
                                                <CardDescription>Enter the employee&#39;s banking details.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6 pt-3">
                                                <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={formFieldVariants}>
                                                    <FormField
                                                        control={form.control}
                                                        name="bankName"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-slate-700 font-medium">Bank Name</FormLabel>
                                                                <div className="space-y-0">
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="UBA"
                                                                            {...field}
                                                                            className="border-slate-300 rounded-md focus:border-[#2E8B57] focus:ring focus:ring-[#2E8B57]/20 focus:ring-opacity-50 transition-all"
                                                                        />
                                                                    </FormControl>
                                                                    <div className="h-5">
                                                                        <FormMessage className="text-[#DC143C]" />
                                                                    </div>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="accountNumber"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-slate-700 font-medium">Account Number</FormLabel>
                                                                <div className="space-y-0">
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="9876543210"
                                                                            {...field}
                                                                            className="border-slate-300 rounded-md focus:border-[#2E8B57] focus:ring focus:ring-[#2E8B57]/20 focus:ring-opacity-50 transition-all"
                                                                        />
                                                                    </FormControl>
                                                                    <div className="h-5">
                                                                        <FormMessage className="text-[#DC143C]" />
                                                                    </div>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </motion.div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}

                                {/* Contact Information */}
                                {currentStep === 4 && (
                                    <motion.div initial="hidden" animate="visible" variants={cardVariants}>
                                        <Card
                                            className={`shadow-md ${sectionColors.contact.border} border-t-4 hover:shadow-lg transition-all duration-300 bg-white`}
                                        >
                                            <CardHeader className="rounded-t-lg">
                                                <CardTitle className={`${sectionColors.contact.title} text-xl flex items-center gap-2`}>
                                                    <motion.div
                                                        initial={{ rotate: -10, scale: 0.9 }}
                                                        animate={{ rotate: 0, scale: 1 }}
                                                        transition={{ type: "spring", stiffness: 200 }}
                                                    >
                                                        <CheckCircle2 className={`h-5 w-5 ${sectionColors.contact.icon}`} />
                                                    </motion.div>
                                                    Contact Information
                                                </CardTitle>
                                                <CardDescription>Enter the employee&#39;s contact details.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6 pt-3">
                                                <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={formFieldVariants}>
                                                    <FormField
                                                        control={form.control}
                                                        name="address"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-slate-700 font-medium">Address</FormLabel>
                                                                <div className="space-y-0">
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="456 Flame Ave, Kumasi"
                                                                            {...field}
                                                                            className="border-slate-300 rounded-md focus:border-[#FFD700] focus:ring focus:ring-[#FFD700]/20 focus:ring-opacity-50 transition-all"
                                                                        />
                                                                    </FormControl>
                                                                    <div className="h-5">
                                                                        <FormMessage className="text-[#DC143C]" />
                                                                    </div>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="phoneNumber"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-slate-700 font-medium">Phone Number</FormLabel>
                                                                <div className="space-y-0">
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="0500000001"
                                                                            {...field}
                                                                            className="border-slate-300 rounded-md focus:border-[#FFD700] focus:ring focus:ring-[#FFD700]/20 focus:ring-opacity-50 transition-all"
                                                                        />
                                                                    </FormControl>
                                                                    <div className="h-5">
                                                                        <FormMessage className="text-[#DC143C]" />
                                                                    </div>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </motion.div>
                                                <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={formFieldVariants}>
                                                    <FormField
                                                        control={form.control}
                                                        name="emergencyContactName"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-slate-700 font-medium">Emergency Contact Name</FormLabel>
                                                                <div className="space-y-0">
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="John Smith"
                                                                            {...field}
                                                                            className="border-slate-300 rounded-md focus:border-[#FFD700] focus:ring focus:ring-[#FFD700]/20 focus:ring-opacity-50 transition-all"
                                                                        />
                                                                    </FormControl>
                                                                    <div className="h-5">
                                                                        <FormMessage className="text-[#DC143C]" />
                                                                    </div>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="emergencyContact"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-2">
                                                                <FormLabel className="text-slate-700 font-medium">Emergency Contact Number</FormLabel>
                                                                <div className="space-y-0">
                                                                    <FormControl>
                                                                        <Input
                                                                            placeholder="0550000002"
                                                                            {...field}
                                                                            className="border-slate-300 rounded-md focus:border-[#FFD700] focus:ring focus:ring-[#FFD700]/20 focus:ring-opacity-50 transition-all"
                                                                        />
                                                                    </FormControl>
                                                                    <div className="h-5">
                                                                        <FormMessage className="text-[#DC143C]" />
                                                                    </div>
                                                                </div>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </motion.div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}

                                {/* Navigation Buttons */}
                                <motion.div
                                    className="flex justify-between items-center mt-6"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => currentStep > 1 && goToStep(currentStep - 1)}
                                        disabled={currentStep === 1}
                                        className="px-6 py-2 rounded-full shadow-sm transition-all hover:translate-y-[-2px] bg-white border-[#1C1F2A] text-[#1C1F2A] hover:bg-white"
                                    >
                                        Previous
                                    </Button>

                                    <div className="flex gap-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleResetForm}
                                            className="px-6 py-2 rounded-full shadow-sm transition-all hover:translate-y-[-2px] bg-white border-[#1C1F2A] text-[#1C1F2A] hover:bg-white"
                                        >
                                            Reset Form
                                        </Button>

                                        {currentStep < 4 ? (
                                            <Button
                                                type="button"
                                                onClick={() => goToStep(currentStep + 1)}
                                                disabled={!isStepValid}
                                                className={`px-6 py-2 rounded-full shadow-sm transition-all hover:translate-y-[-2px] ${
                                                    !isStepValid ? "opacity-50 cursor-not-allowed" : ""
                                                } ${
                                                    currentStep === 1
                                                        ? "bg-[#DC143C] text-white hover:bg-[#c01235]"
                                                        : currentStep === 2
                                                            ? "bg-[#8B4513] text-white hover:bg-[#7a3b10]"
                                                            : "bg-[#2E8B57] text-white hover:bg-[#267a4b]"
                                                }`}
                                            >
                                                Next
                                            </Button>
                                        ) : (
                                            <Button
                                                type="submit"
                                                disabled={isSubmitting || !isStepValid}
                                                className={`bg-[#FFD700] hover:bg-[#e6c200] text-[#1C1F2A] px-8 py-2 rounded-full shadow-sm transition-all hover:translate-y-[-2px] ${
                                                    !isStepValid ? "opacity-50 cursor-not-allowed" : ""
                                                }`}
                                            >
                                                {isSubmitting ? (
                                                    <div className="flex items-center gap-2">
                                                        <svg
                                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#1C1F2A]"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                            ></circle>
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                            ></path>
                                                        </svg>
                                                        Processing...
                                                    </div>
                                                ) : (
                                                    "Submit Details"
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>

                            </form>
                        </Form>
                    </motion.div>
                </div>

                {/* Footer */}
                <motion.div
                    className="mt-12 text-center text-slate-400 text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <p>© {new Date().getFullYear()} University of Ghana Fire Station. All rights reserved.</p>
                </motion.div>
            </motion.div>
        </div>
    )
}
