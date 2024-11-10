import React, { useState } from "react";
import "../../css/Dropdown.css";

const Dropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState("X-force");

    const options = ["X-force", "BitCorp", "opcion 1"];

    const handleSelect = (option) => {
        setSelected(option);
        setIsOpen(false);
    };

    return (
        <div className={`custom-dropdown ${isOpen ? "open" : ""}`}>
            <div className="dropdown-button" onClick={() => setIsOpen(!isOpen)}>
                {selected}
                <span className={`arrow ${isOpen ? "up" : ""}`}>
                    <i className="fa-solid fa-angle-down" />
                </span>
            </div>
            <div className="dropdown-options">
                {options.map((option) => (
                    <div
                        key={option}
                        className="option"
                        onClick={() => handleSelect(option)}
                    >
                        {option}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dropdown;
