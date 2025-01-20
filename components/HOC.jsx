import React from "react";


// Higher-Order Component
const withBorder = (WrappedComponent) => {
    return (props) => {
        return (
            <div style={{ border: "2px solid blue", padding: "10px" }}>
                {/* Render the wrapped component and pass props */}
                <WrappedComponent {...props} />
            </div>
        );
    };
};


/**
 * 1. The Hierarchy:
 *
 *     App (Root Component)
 *         EnhancedComponent (Returned by the HOC)
 *             SimpleComponent (Wrapped by the HOC)
 */

// Simple component to be wrapped
const SimpleComponent = (props) => {
    return <p>Hello, {props.name}!</p>;
};

// Enhanced component using the HOC
const EnhancedComponent = withBorder(SimpleComponent);

// App component
const App = () => {
    return (
        <div>
            <h1>HOC Example</h1>
            {/* Render the enhanced component */}
            <EnhancedComponent name="Eranda" />
        </div>
    );
};

export default App;
