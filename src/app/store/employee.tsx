import { create } from 'zustand';
import axios from 'axios';
import {ZodDate, ZodOptional, ZodString} from "zod";

const API_URL = process.env.NODE_ENV === 'production'
    ? "https://ug-gnfs-backend.vercel.app"
    : "http://localhost:8080";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

interface Employee {
    firstName: string;
    middleName: string;
    lastName: string;
    dob: string;
    rank: string;
    appointmentDate: string;
    staffId: string;
    serviceNumber: string;
    bankName: string;
    accountNumber: string;
    address: string;
    phoneNumber: string;
    emergencyContact: string;
}

interface State {
    isLoading: boolean;
    success: boolean;
    error: string | null;
    addEmployee: (employee: {
        firstName: ZodString["_output"];
        lastName: ZodString["_output"];
        dob: ZodDate["_output"];
        gender: ZodString["_output"];
        maritalStatus: ZodString["_output"];
        levelOfficer: ZodString["_output"];
        rank: ZodString["_output"];
        qualification: ZodString["_output"];
        appointmentDate: ZodDate["_output"];
        staffId: ZodString["_output"];
        serviceNumber: ZodString["_output"];
        bankName: ZodString["_output"];
        accountNumber: ZodString["_output"];
        address: ZodString["_output"];
        email: ZodString["_output"];
        nationalId: ZodString["_output"];
        phoneNumber: ZodString["_output"];
        emergencyContactName: ZodString["_output"];
        emergencyContact: ZodString["_output"];
        middleName?: ZodOptional<ZodString>["_output"];
        mateType?: ZodOptional<ZodString>["_output"];
        mateNumber?: ZodOptional<ZodString>["_output"];
        mateInfo: string
    }) => Promise<void>;
}

export const useEmployeeStore = create<State>((set) => ({
    isLoading: false,
    success: false,
    error: null,

    addEmployee: async (employee) => {
        set({ isLoading: true, success: false, error: null });

        try {
            await api.post('/api/employee/add', employee); // <-- using `api` instead of `axios`
            set({ isLoading: false, success: true });
        } catch (err: unknown) {
            let errorMsg = 'Failed to add employee';

            if (axios.isAxiosError(err)) {
                errorMsg = err.response?.data?.message || err.message || errorMsg;
            } else if (err instanceof Error) {
                errorMsg = err.message;
            }

            set({ isLoading: false, success: false, error: errorMsg });
        }
    },
}));
