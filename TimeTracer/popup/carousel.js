


// BUG: this needs to check that all this is loaded before looking for ti in the dom

document.addEventListener('DOMContentLoaded', () => {
  const carouselWrapper = document.querySelector('.carousel-wrapper');
  const carouselSlides = document.querySelectorAll('.carousel-slide');
  const prevBtn = document.querySelector('.carousel-button.prev');
  const nextBtn = document.querySelector('.carousel-button.next');

  let currentIndex = 0;
  const totalSlides = carouselSlides.length;
  const slideWidth = carouselSlides[0].clientWidth; // Get the width of a single slide

  // Function to update the carousel position
  function updateCarousel() {
    // Calculate the new transform value based on the current slide index
    const offset = -currentIndex * slideWidth;
    carouselWrapper.style.transform = `translateX(${offset}px)`;
  }

  // Event listener for the "Next" button
  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % totalSlides; // Loop back to the start if at the end
    updateCarousel();
  });

  // Event listener for the "Previous" button
  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides; // Loop to the end if at the start
    updateCarousel();
  });

  // Optional: Add keyboard navigation (left/right arrow keys)
  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      nextBtn.click();
    } else if (event.key === 'ArrowLeft') {
      prevBtn.click();
    }
  });

  // Optional: Recalculate slideWidth on window resize to ensure responsiveness
  window.addEventListener('resize', () => {
    // Re-get the width of a slide as it might change on resize
    const currentSlideWidth = carouselSlides[0].clientWidth;
    // If the width has changed, update the carousel position
    if (currentSlideWidth !== slideWidth) {
      slideWidth = currentSlideWidth; // Update the reference width
      updateCarousel(); // Re-adjust the carousel to the new width
    }
  });
});
