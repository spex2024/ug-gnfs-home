'use client'
import EmployeeForm from "@/app/component/form";

export default function Home() {
    return (
        <main
            className="min-h-screen py-12 md:px-4 px-2 bg-cover bg-center relative"
            style={{
                backgroundImage: `url('https://res.cloudinary.com/ddwet1dzj/image/upload/v1745722276/samples/pexels-photo-2030190_ewl2il.jpg')`,
            }}
        >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1C1F2A] via-[#1C1F2A]/60 to-transparent pointer-events-none"></div>

            <div className="container mx-auto max-w-6xl relative z-10">
                <div>
                    <EmployeeForm />
                </div>
            </div>
        </main>
    );
}
