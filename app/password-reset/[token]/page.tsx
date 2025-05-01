import {FC} from "react";
import ResetPasswordWindow from "@/components/authentication/ResetPasswordWindow";

const ResetPasswordPage: FC = () => {
    return <div id="authentication-modal" className="mt-36 inset-0 z-50 items-center justify-center bg-black bg-opacity-50">
        <div className="relative p-4 max-w-xl mx-auto max-h-full">
            <div className="relative rounded-lg shadow bg-gray-800">
                <ResetPasswordWindow/>
            </div>
            Copyright © 2025 All rights reserved.
        </div>
    </div>
}

export default ResetPasswordPage;