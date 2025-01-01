import React from 'react';

const withExtension = <P extends object>(Component: React.ComponentType<P>) => {
    return (props: P & { additionalProp?: string }) => {
        return (
            <div>
                <Component {...props} />
                {props.additionalProp && <p>Additional: {props.additionalProp}</p>}
            </div>
        );
    };
};

export default withExtension;