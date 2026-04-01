const customStyles = {
    control: (provided: object, state: { isFocused: boolean }) => ({
        ...provided,
        backgroundColor: "var(--surface-elevated)",
        color: "var(--foreground)",
        borderColor: state.isFocused ? "var(--accent-strong)" : "var(--border-subtle)",
        boxShadow: state.isFocused ? "0 0 0 4px var(--accent-soft)" : "none",
        borderRadius: "var(--radius-sm)",
        minHeight: "46px",
    }),
    singleValue: (provided: object) => ({
        ...provided,
        color: "var(--foreground)",
    }),
    menu: (provided: object) => ({
        ...provided,
        backgroundColor: "var(--surface-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-sm)",
        overflow: "hidden",
    }),
    option: (provided: object, state: { isFocused: boolean; isSelected: boolean }) => ({
        ...provided,
        backgroundColor: state.isSelected ? "var(--accent)" : state.isFocused ? "var(--surface-soft)" : "transparent",
        color: state.isSelected ? "#ffffff" : "var(--foreground)",
        cursor: "pointer",
    }),
    placeholder: (provided: object) => ({
        ...provided,
        color: "var(--muted)",
    }),
    input: (provided: object) => ({
        ...provided,
        color: "var(--foreground)",
    }),
};

export default customStyles;
