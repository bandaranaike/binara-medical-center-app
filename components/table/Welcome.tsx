import React from 'react';

const Welcome: React.FC = () => {

    return (
        <div>
            <h1 className="text-xl font-bold">Welcome to the Binara Medical Center Internal Portal</h1>
            <p className="text-gray-500 mt-3">This portal is for internal use only and may not contain relevant information for you.
                Please visit the
                <a className="text-purple-600 hover:text-purple-500 mx-1 font-semibold" href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/dashboard`}>
                    Web Portal</a>
                to access your
                activities. Thank you!</p>
        </div>
    );
};


export default Welcome;
