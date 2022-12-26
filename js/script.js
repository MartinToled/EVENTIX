/*parallax scroll*/
function splitScroll(){
  const controller = new ScrollMagic.Controller();

  new ScrollMagic.Scene({
      duration: '300%',
      triggerElement: '.heading',
      triggerHook:0
  })
  .setPin('.heading')
  .addTo(controller);
}

splitScroll();