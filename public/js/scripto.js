var TrandingSlider = new Swiper('.tranding-slider', {
    effect: 'coverflow', // Use coverflow effect
    grabCursor: true, // Allow grabbing the cursor to slide
    centeredSlides: true, // Center the active slide
    loop: true, // Enable infinite loop of slides
    slidesPerView: 'auto', // Automatically determine the number of slides per view
    coverflowEffect: {
      rotate: 0,
      stretch: 0,
      depth: 100,
      modifier: 2.5,
    },
    pagination: {
      el: '.swiper-pagination', // Enable pagination
      clickable: true, // Make pagination clickable
    },
    navigation: {
      nextEl: '.swiper-button-next', // Next slide button
      prevEl: '.swiper-button-prev', // Previous slide button
    },
    autoplay: {
      delay: 3000, // Time in milliseconds before changing to the next slide (3 seconds)
      disableOnInteraction: false, // Keep auto-play running even after user interaction
    },
  });
  