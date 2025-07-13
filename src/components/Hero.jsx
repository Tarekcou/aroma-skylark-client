import { useEffect, useState } from "react";
import { Typewriter } from "react-simple-typewriter";
import hero1 from "../assets/hero1.jpg";
import hero2 from "../assets/hero2.jpg";
import hero3 from "../assets/hero3.jpg";
import { Link } from "react-router";
const slides = [
  {
    image: hero1,
    heading: "Track Every Brick, Cement & Cost",
    subheading:
      "Simplify your construction budgeting with real-time expense tracking.",
  },
  {
    image: hero2,
    heading: "From Blueprint to Budget",
    subheading:
      "Monitor materials, manage members & stay on top of your finances.",
  },
  {
    image: hero3,
    heading: "Smarter Construction, Clearer Cal.",
    subheading: "Gain clarity on stock, payments, and daily transactions.",
  },
];


const Hero = () => {
  const [current, setCurrent] = useState(0);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false); // reset on slide change
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 8000); // 5 sec slide change

    return () => clearInterval(timer);
  }, []);

  const { image, heading, subheading } = slides[current];

  return (
    <div className="relative w-full md:h-screen overflow-hidden">
      <img
        src={image}
        alt={`Slide ${current + 1}`}
        className="w-full h-full object-cover transition-all duration-700"
        loading="lazy"
      />

      {/* Overlay */}
      <div className="absolute inset-0 flex justify-center items-center bg-black/50 px-4 text-white">
        <div
          key={current}
          className="left-0 space-y-4 w-full max-w-5xl text-center md:text-start animate-fade-in-up"
        >
          <h1 className="font-bold text-xl md:text-6xl leading-tight">
            {heading}
          </h1>
          <p className="opacity-90 text-xs md:text-xl transition duration-500">
            {subheading}
          </p>
          <div className="z-30 w-24">
            <Link
              to={"/login"}
              className="md:bottom-1/4 left-1/4 md:left-1/10 z-30 absolute bg-purple-600 hover:bg-purple-700 shadow-lg px-6 py-3 border-none rounded-lg text-white text-xs md:text-base transition duration-300 btn btn-sm md:btn-md"
            >
              Let’s Simplify Construction
            </Link>
          </div>
          <div>
            {/* <div className="badge badge-soft badge-info"></div> */}

            <p className="hidden md:block opacity-80 md:text-md text-xs badge-xs md:badge-xl badge badge-soft badge-info">
              <Typewriter
                words={[
                  "Construction Expense Management",
                  "Material Stock Tracking",
                  "Member Installment Monitoring",
                  "Daily & Monthly Reports",
                ]}
                loop={2}
                cursor
                cursorStyle="|"
                typeSpeed={50}
                deleteSpeed={50}
                delaySpeed={1000}
              />
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute inset-0 flex justify-between items-center px-4">
        <button
          onClick={() =>
            setCurrent((current - 1 + slides.length) % slides.length)
          }
          className="btn btn-circle btn-sm md:btn-md"
        >
          ❮
        </button>
        <button
          onClick={() => setCurrent((current + 1) % slides.length)}
          className="btn btn-circle btn-sm md:btn-md"
        >
          ❯
        </button>
      </div>
    </div>
  );
};

export default Hero;
