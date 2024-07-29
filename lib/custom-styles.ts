const customStyles = {
    control: (provided: object) => ({
        ...provided,
        backgroundColor: 'rgb(31, 41, 55)',
        color: '#a6a6a6',
        borderColor: 'rgb(55, 65, 81)',
    }),
    singleValue: (provided: object) => ({
        ...provided,
        // textTransform: 'capitalize',
        color: '#a6a6a6',
    }),
    menu: (provided: object) => ({
        ...provided,
        backgroundColor: 'rgb(31, 41, 55)',
    }),
    option: (provided: object, state: { isSelected: boolean }) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#202439' : '#212b4a',
        color: '#a6a6a6',
        '&:hover': {
            backgroundColor: '#1c2235',
        },
    }),
    placeholder: (provided: object) => ({
        ...provided,
        color: '#aaa',
    }),
    input: (provided: object) => ({
        ...provided,
        color: '#a6a6a6',
    }),
};

export default customStyles;