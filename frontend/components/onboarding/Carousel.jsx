import React from "react";
/**
 * Carousel.jsx
 * Lightweight looping carousel used for the marketing intro (step 0).
 * Props:
 *  - slides: [{ title, image }]
 *  - currentSlide: index used for positioning
 *  - isTransitioning: enables/disables CSS transition for seamless looping
 *  - onPrev/onNext: navigation handlers
 *  - onDot: jump directly to an index (dot indicator)
 *  - onGetStarted: callback to enter onboarding steps
 */

export function Carousel({
  slides,
  currentSlide,
  isTransitioning,
  onPrev,
  onNext,
  onDot,
  onGetStarted,
}) {
  return (
    <div className="relative w-full max-w-6xl flex items-center justify-center">
      {/* Left Arrow */}
      <button
        onClick={onPrev}
        className="absolute left-4 md:left-[-60px] w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:bg-gray-50 transition z-10"
        aria-label="Previous slide"
      >
        <svg
          className="w-5 h-5 md:w-6 md:h-6 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Content */}
      <section className="flex flex-col items-center justify-center gap-2 md:gap-3 text-center w-full max-w-md">
        {/* Phone Mockup with Swipe Animation - Fixed Container */}
        <div className="relative w-full h-[50vh] max-h-72">
          <div className="relative w-full max-w-xs h-full mx-auto overflow-hidden">
            {/* Clone last slide at beginning */}
            <div
              className="absolute inset-0"
              style={{
                transform: `translateX(${(-1 - currentSlide) * 100}%)`,
                transition: isTransitioning ? "transform 0.5s ease-out" : "none",
              }}
            >
              <img
                src={slides[slides.length - 1].image}
                alt={slides[slides.length - 1].title}
                className="w-full h-full object-contain px-8"
              />
            </div>

            {/* Actual slides */}
            {slides.map((slide, index) => (
              <div
                key={index}
                className="absolute inset-0"
                style={{
                  transform: `translateX(${(index - currentSlide) * 100}%)`,
                  transition: isTransitioning ? "transform 0.5s ease-out" : "none",
                }}
              >
                <img src={slide.image} alt={slide.title} className="w-full h-full object-contain px-8" />
              </div>
            ))}

            {/* Clone first slide at end */}
            <div
              className="absolute inset-0"
              style={{
                transform: `translateX(${(slides.length - currentSlide) * 100}%)`,
                transition: isTransitioning ? "transform 0.5s ease-out" : "none",
              }}
            >
              <img src={slides[0].image} alt={slides[0].title} className="w-full h-full object-contain px-8" />
            </div>
          </div>
        </div>

        {/* Text with Fade Animation - Fixed Height */}
        <div className="relative w-full h-16 md:h-20 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <h1
              key={currentSlide % slides.length}
              className="text-sm md:text-base font-semibold text-gray-800 max-w-xs animate-fadeIn"
            >
              {slides[currentSlide % slides.length]?.title}
            </h1>
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex gap-2 mb-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => onDot(index)}
              className={`w-2 h-2 rounded-full transition ${
                currentSlide % slides.length === index ? "bg-gray-800" : "bg-gray-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Get Started Button */}
        <button
          onClick={onGetStarted}
          className="inline-flex items-center justify-center rounded-full bg-primary-yellow text-gray-800 font-semibold px-8 md:px-10 py-3 md:py-4 hover:opacity-90 transition shadow-md text-sm md:text-base"
        >
          Get started!
        </button>
      </section>

      {/* Right Arrow */}
      <button
        onClick={onNext}
        className="absolute right-4 md:right-[-60px] w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:bg-gray-50 transition z-10"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
