"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Komponen Tombol yang Dirancang Ulang (Gaya Glassy Dark) ---

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "number" | "operator" | "special";
  className?: string;
  span?: string;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  variant = "number",
  className = "",
  span = "col-span-1",
}) => {
  const variants = {
    // Tombol angka: Kaca transparan terang
    number:
      "bg-white/10 text-white " +
      "hover:bg-white/20 active:bg-white/30 " +
      "border border-white/10",

    // Tombol spesial: Kaca transparan lebih gelap
    special:
      "bg-black/10 text-white " +
      "hover:bg-black/20 active:bg-black/30 " +
      "border border-white/10",

    // Tombol operator: Solid biru untuk kontras
    operator:
      "bg-blue-500 text-white " +
      "hover:bg-blue-600 active:bg-blue-700 " +
      "shadow-lg shadow-blue-500/20",
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "tween", duration: 0.1 }}
      className={`h-14 ${span} ${variants[variant]} ${className}
                  rounded-xl text-xl font-medium focus:outline-none
                  backdrop-blur-sm`} // Tambahkan backdrop-blur di sini
    >
      {children}
    </motion.button>
  );
};

// --- Komponen Kalkulator Utama ---

export default function SmartCalc() {
  const [mode, setMode] = useState("basic");
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [currentOperator, setCurrentOperator] = useState("");
  const [previousValue, setPreviousValue] = useState("");
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [programmerBase, setProgrammerBase] = useState(10); // 2, 8, 10, 16

  const modes = [
    { id: "basic", name: "Basic" },
    { id: "scientific", name: "Scientific" },
    { id: "programmer", name: "Programmer" },
  ];

  const layoutConfig: {
    [key: string]: { width: string; cols: string };
  } = {
    basic: { width: "max-w-sm", cols: "grid-cols-4" },
    scientific: { width: "max-w-xl", cols: "grid-cols-6" },
    programmer: { width: "max-w-2xl", cols: "grid-cols-7" },
  };

  // --- Fungsi Helper ---
  const toBase = (num: number, base: number): string => {
    if (base === 10) return num.toString();
    if (base === 2) return num.toString(2);
    if (base === 8) return num.toString(8);
    if (base === 16) return num.toString(16).toUpperCase();
    return num.toString();
  };

  const fromBase = (str: string, base: number): number => {
    return parseInt(str, base);
  };

  // --- Penangan Logika (Tidak diubah) ---
  const handleNumber = (num: string) => {
    if (mode === "programmer" && programmerBase === 16) {
      const validHex = [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
      ];
      if (!validHex.includes(num.toUpperCase())) return;
    }

    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" || display === "Error" ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (mode === "programmer") return;
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const handleOperator = (op: string) => {
    const inputValue =
      mode === "programmer"
        ? fromBase(display, programmerBase)
        : parseFloat(display);

    if (previousValue === "") {
      setPreviousValue(display);
    } else if (currentOperator) {
      const result = performCalculation(
        mode === "programmer"
          ? fromBase(previousValue, programmerBase)
          : parseFloat(previousValue),
        inputValue,
        currentOperator
      );

      const displayValue =
        mode === "programmer"
          ? toBase(Math.floor(result), programmerBase)
          : result.toString();

      setDisplay(displayValue);
      setPreviousValue(displayValue);
    }

    setWaitingForOperand(true);
    setCurrentOperator(op);
    setExpression(`${display} ${op}`);
  };

  const performCalculation = (
    a: number,
    b: number,
    operator: string
  ): number => {
    switch (operator) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "×":
        return a * b;
      case "÷":
        return b !== 0 ? a / b : 0;
      case "AND":
        return Math.floor(a) & Math.floor(b);
      case "OR":
        return Math.floor(a) | Math.floor(b);
      case "XOR":
        return Math.floor(a) ^ Math.floor(b);
      case "<<":
        return Math.floor(a) << Math.floor(b);
      case ">>":
        return Math.floor(a) >> Math.floor(b);
      default:
        return b;
    }
  };

  const calculate = () => {
    const inputValue =
      mode === "programmer"
        ? fromBase(display, programmerBase)
        : parseFloat(display);

    if (currentOperator && previousValue !== "") {
      const result = performCalculation(
        mode === "programmer"
          ? fromBase(previousValue, programmerBase)
          : parseFloat(previousValue),
        inputValue,
        currentOperator
      );

      const displayValue =
        mode === "programmer"
          ? toBase(Math.floor(result), programmerBase)
          : result.toString();

      setDisplay(displayValue);
      setExpression("");
      setPreviousValue("");
      setCurrentOperator("");
      setWaitingForOperand(true);
    }
  };

  const clear = () => {
    setDisplay(mode === "programmer" ? toBase(0, programmerBase) : "0");
    setExpression("");
    setPreviousValue("");
    setCurrentOperator("");
    setWaitingForOperand(false);
  };

  const deleteLast = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay(mode === "programmer" ? toBase(0, programmerBase) : "0");
    }
  };

  const handlePercentage = () => {
    if (mode === "programmer") return;
    const value = parseFloat(display) / 100;
    setDisplay(value.toString());
  };

  const handleScientific = (fn: string) => {
    if (display === "Error") return;
    const value = parseFloat(display);
    let result: number;

    try {
      switch (fn) {
        case "sin":
          result = Math.sin((value * Math.PI) / 180);
          break;
        case "cos":
          result = Math.cos((value * Math.PI) / 180);
          break;
        case "tan":
          result = Math.tan((value * Math.PI) / 180);
          break;
        case "log":
          result = Math.log10(value);
          break;
        case "ln":
          result = Math.log(value);
          break;
        case "sqrt":
          result = Math.sqrt(value);
          break;
        case "x²":
          result = value * value;
          break;
        case "π":
          result = Math.PI;
          break;
        case "e":
          result = Math.E;
          break;
        case "1/x":
          result = 1 / value;
          break;
        default:
          result = value;
      }
      setDisplay(result.toString());
      setWaitingForOperand(true);
    } catch (e) {
      setDisplay("Error");
    }
  };

  const handleProgrammer = (fn: string) => {
    if (["BIN", "OCT", "DEC", "HEX"].includes(fn)) {
      const currentValue = fromBase(display, programmerBase);
      const newBase =
        fn === "BIN" ? 2 : fn === "OCT" ? 8 : fn === "DEC" ? 10 : 16;
      setProgrammerBase(newBase);
      setDisplay(toBase(currentValue, newBase));
    } else if (fn === "NOT") {
      const value = fromBase(display, programmerBase);
      const result = ~Math.floor(value);
      setDisplay(toBase(result >>> 0, programmerBase));
      setWaitingForOperand(true);
    } else {
      handleOperator(fn);
    }
  };

  // --- Komponen Tombol dengan Fungsi (Tidak diubah) ---

  const MappedBasicButtons = () => (
    <>
      <Button onClick={clear} variant="special">
        C
      </Button>
      <Button onClick={deleteLast} variant="special">
        DEL
      </Button>
      <Button onClick={handlePercentage} variant="special">
        %
      </Button>
      <Button onClick={() => handleOperator("÷")} variant="operator">
        ÷
      </Button>
      <Button onClick={() => handleNumber("7")}>7</Button>
      <Button onClick={() => handleNumber("8")}>8</Button>
      <Button onClick={() => handleNumber("9")}>9</Button>
      <Button onClick={() => handleOperator("×")} variant="operator">
        ×
      </Button>
      <Button onClick={() => handleNumber("4")}>4</Button>
      <Button onClick={() => handleNumber("5")}>5</Button>
      <Button onClick={() => handleNumber("6")}>6</Button>
      <Button onClick={() => handleOperator("-")} variant="operator">
        -
      </Button>
      <Button onClick={() => handleNumber("1")}>1</Button>
      <Button onClick={() => handleNumber("2")}>2</Button>
      <Button onClick={() => handleNumber("3")}>3</Button>
      <Button onClick={() => handleOperator("+")} variant="operator">
        +
      </Button>
      <Button onClick={() => handleNumber("0")} span="col-span-2">
        0
      </Button>
      <Button onClick={handleDecimal}>.</Button>
      <Button onClick={calculate} variant="operator">
        =
      </Button>
    </>
  );

  const MappedScientificButtons = () => (
    <>
      {["sin", "cos", "tan", "log", "ln"].map((op) => (
        <Button key={op} onClick={() => handleScientific(op)} variant="special">
          {op}
        </Button>
      ))}
      <Button onClick={() => handleScientific("sqrt")} variant="special">
        √
      </Button>
      <Button onClick={() => handleScientific("x²")} variant="special">
        x²
      </Button>
      <Button onClick={() => handleScientific("π")} variant="special">
        π
      </Button>
      <Button onClick={() => handleScientific("e")} variant="special">
        e
      </Button>
      <Button onClick={() => handleScientific("1/x")} variant="special">
        1/x
      </Button>
    </>
  );

  const MappedProgrammerButtons = () => (
    <>
      {["BIN", "OCT", "DEC", "HEX"].map((op) => (
        <Button
          key={op}
          onClick={() => handleProgrammer(op)}
          variant={
            programmerBase ===
            (op === "BIN" ? 2 : op === "OCT" ? 8 : op === "DEC" ? 10 : 16)
              ? "operator"
              : "special"
          }
          className="text-sm"
        >
          {op}
        </Button>
      ))}
      {["AND", "OR", "XOR", "NOT", "<<", ">>"].map((op) => (
        <Button
          key={op}
          onClick={() => handleProgrammer(op)}
          variant="special"
          className="text-sm"
        >
          {op}
        </Button>
      ))}
      {["A", "B", "C", "D", "E", "F"].map((op) => (
        <Button
          key={op}
          onClick={() => handleNumber(op)}
          variant="number"
          className="text-sm"
        >
          {op}
        </Button>
      ))}
    </>
  );

  // --- Render JSX ---

  return (
    // Latar belakang diubah ke gradient gelap agar efek glass terlihat
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-gray-900 to-black p-4 md:p-8 flex items-center justify-center font-sans">
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`w-full ${layoutConfig[mode].width} 
                    bg-white/10 backdrop-blur-lg rounded-[2.5rem] 
                    border border-white/20 
                    shadow-2xl shadow-black/30 p-6 transition-all text-white`}
      >
        {/* Header */}
        <div className="mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Kalkulator Pintar
            </h1>
            {mode === "programmer" && (
              <div className="text-xs text-neutral-200 mt-1">
                Base:{" "}
                {programmerBase === 2
                  ? "Binary"
                  : programmerBase === 8
                  ? "Octal"
                  : programmerBase === 10
                  ? "Decimal"
                  : "Hexadecimal"}
              </div>
            )}
          </div>
        </div>

        {/* Pemilih Mode */}
        <div className="flex items-center gap-2 mb-4 p-1 bg-black/20 rounded-xl">
          {modes.map((m) => (
            <motion.button
              key={m.id}
              onClick={() => {
                setMode(m.id);
                clear();
              }}
              className="relative py-1 px-3 rounded-lg text-sm font-semibold focus:outline-none w-full"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {mode === m.id && (
                <motion.div
                  layoutId="active-mode-pill"
                  className="absolute inset-0 bg-white rounded-lg"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span
                className={`relative z-10 ${
                  mode === m.id ? "text-black" : "text-neutral-200"
                }`}
              >
                {m.name}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Display dengan Animasi */}
        <div className="mb-6 text-right min-h-[100px]">
          <div className="text-sm text-neutral-200 font-mono h-6 mb-1 truncate">
            {expression || "..."}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={display}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="text-5xl md:text-6xl font-light font-mono text-white break-all"
            >
              {display}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Area Tombol */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            className={`grid ${layoutConfig[mode].cols} gap-2`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {mode === "basic" && <MappedBasicButtons />}

            {mode === "scientific" && (
              <>
                <div className="col-span-2 grid grid-cols-2 gap-2">
                  <MappedScientificButtons />
                </div>
                <div className="col-span-4 grid grid-cols-4 gap-2">
                  <MappedBasicButtons />
                </div>
              </>
            )}

            {mode === "programmer" && (
              <>
                <div className="col-span-3 grid grid-cols-3 gap-2">
                  <MappedProgrammerButtons />
                </div>
                <div className="col-span-4 grid grid-cols-4 gap-2">
                  <MappedBasicButtons />
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
