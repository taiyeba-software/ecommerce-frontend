"use client";
import { useEffect, useRef, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { animated, useSpring, useTrail } from "@react-spring/web";
import  StarBackground  from "./StarBackground";
import { useInView } from "react-intersection-observer";

const cardData = [
  {
    title: "Radical Transparency",
    desc: "No black boxes. Nothing to hide. Just clean formulas you'll understand.",
  },
  {
    title: "Clean, Beyond Reproach",
    desc: "Truly safe, dermatologist-reviewed, verified by independent scientists.",
  },
  {
    title: "Potent & Multi-Tasking",
    desc: "Our formulas are shockingly effective and multitask like you do.",
  },
  {
    title: "Conscious & Responsible",
    desc: "Planet-friendly. Ethically sourced. Always made with care.",
  },
];

export const AboutSection = () => {
  const ref = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  const [refText, inView] = useInView({
    triggerOnce: false,
    threshold: 0.3,
  });

  // Stagger animation for text elements
  const textItems = [
    "CLEAN, CONSCIOUS,",
    "PERFORMANCE",
    "skincare.",
    "Unreasonably honest products that truly work. Be kind to skin and the planet — no exceptions."
  ];

  const trail = useTrail(textItems.length, {
    opacity: inView ? 1 : 0,
    y: inView ? 0 : 60,
    rotate: inView ? 0 : -5,
    scale: inView ? 1 : 0.9,
    config: { tension: 150, friction: 25 },
  });

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const scrollPosition = window.scrollY + window.innerHeight;
      const sectionTop = window.scrollY + rect.top;
      const sectionHeight = rect.height;

      // Calculate scroll percentage within the section (0 to 1)
      const progress = Math.min(
        1,
        Math.max(0, (scrollPosition - sectionTop) / sectionHeight)
      );

      setScrollY(progress);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Trigger on mount

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Each layer moves at a different speed
  const imageSpring = useSpring({ transform: `translateY(${scrollY * -150}px)` });
  const cardsSpring = useSpring({ transform: `translateY(${scrollY * -120}px)` });



  return (
    <section
      ref={ref}
      className="min-h-screen relative overflow-hidden py-32 px-4 bg-background filter-glitter filter-star " // Soft luxury pastel
      id="about"
    >
      {/*Background Stars (Layer 0) */}
      <StarBackground/>
    
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-1 gap-50 items-center">
        

          <div
            ref={refText}
            className="space-y-6 text-left"
          >
            <h2
              className="text-4xl md:text-5xl font-semibold leading-tight"
              style={{ fontFamily: "EduCursive" }}
            >
              <animated.span style={trail[0]} className="block will-change-transform will-change-opacity">
                CLEAN, CONSCIOUS,
              </animated.span>
              <animated.span style={trail[1]} className="block will-change-transform will-change-opacity">
                PERFORMANCE
              </animated.span>
              <animated.span style={trail[2]} className="block italic font-serif text-foreground/90 will-change-transform will-change-opacity">
                skincare.
              </animated.span>
            </h2>

            <animated.p
              style={trail[3]}
              className="text-muted-foreground max-w-md will-change-transform will-change-opacity"
            >
              Unreasonably honest products that truly work. Be kind to skin and the planet — no exceptions.
            </animated.p>
          </div>



        {/* Parallax Visual Section */}
        
        <div className="relative min-h-[600px] w-full">
          {/* Portrait Image */}
        <animated.div
          style={imageSpring}
          className="gpu absolute top-0 left-1/2 -translate-x-1/2 z-10 w-64 sm:w-72 md:w-80 lg:w-96 xl:w-[420px] aspect-[3/4] rounded-2xl overflow-hidden shadow-xl"
        >
          <img
            src="/images/about.jpg"
            alt="Model"
            className="w-full h-full object-cover"
          />
        </animated.div>

          <animated.img
            src="/images/rose2.png"
            alt="Rose"
            style={cardsSpring}
            className="gpu absolute top-[-12%] left-[calc(50%+150px)] w-28 sm:w-32 z-100 transform -translate-x-1/2 -translate-y-1/2"
          />

          <animated.img
            src="/images/rose.png"
            alt="Rose"
            style={cardsSpring}
            className="gpu absolute top-[calc(61%+96px)] left-[calc(84%+115px)] w-28 sm:w-32 z-100 transform -translate-x-1/2 -translate-y-1/2"
          />

          <animated.img
            src="/images/rose1.png"
            alt="Rose"
            style={cardsSpring}
            className="gpu absolute top-[calc(69%+148px)] left-[calc(48%+26px)] w-28 sm:w-32 z-100 transform -translate-x-1/2 -translate-y-1/2"
          />

          <animated.img
            src="/images/rose.png"
            alt="Rose"
            style={cardsSpring}
            className="gpu absolute top-[calc(58%+130px)] left-[calc(16%-75px)] w-28 sm:w-32 z-28 transform -translate-x-1/2 -translate-y-1/2"
          />

          <animated.img
            src="/images/rose1.png"
            alt="Rose"
            style={cardsSpring}
            className="gpu absolute top-[calc(31%+51px)] left-[calc(21%-141px)] w-28 sm:w-32 z-100 transform -translate-x-1/2 -translate-y-1/2"
          />

          <animated.img
            src="/images/rose.png"
            alt="Rose"
            style={cardsSpring}
            className="gpu absolute top-[calc(-3%-51px)] left-[calc(49%-141px)] w-28 sm:w-32 z-100 transform -translate-x-1/2 -translate-y-1/2"
          />

          <animated.img
            src="/images/rose2.png"
            alt="Rose"
            style={cardsSpring}
            className="gpu absolute top-[calc(17%-130px)] left-[calc(21%-75px)] w-28 sm:w-32 z-100 transform -translate-x-1/2 -translate-y-1/2"
          />

          <animated.img
            src="/images/rose.png"
            alt="Rose"
            style={cardsSpring}
            className="gpu absolute top-[calc(20%-148px)] left-[calc(82%+26px)] w-28 sm:w-32 z-100 transform -translate-x-1/2 -translate-y-1/2"
          />

          <animated.img
            src="/images/rose2.png"
            alt="Rose"
            style={cardsSpring}
            className="gpu absolute top-[calc(54%-96px)] left-[calc(81%+115px)] w-28 sm:w-32 z-100 transform -translate-x-1/2 -translate-y-1/2"
          />
         

          {/* Floating Cards */}
          <animated.div
            style={cardsSpring}
            className="gpu absolute inset-0 z-30 grid grid-cols-2 gap-4 place-items-center"
          >
            {cardData.map((card, i) => (
              <div
                key={i}
                className="w-56 h-56 sm:w-60 sm:h-60 p-6 bg-white bg-opacity-90 shadow-lg text-center flex flex-col justify-center text-[#c8145a] rounded-none"
              >
                <div className="text-xl font-semibold mb-2 text-[#c8145a]">{card.title}</div>
                <p className="text-sm text-[#c8145a]">{card.desc}</p>
              </div>
            ))}
          </animated.div>
        </div>
      </div>
    </section>
  );
};