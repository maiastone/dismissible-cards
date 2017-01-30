'use strict';

class Cards {
  constructor() {
    this.cards = document.querySelectorAll('.card');
    this.onStart = this.onStart.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onEnd = this.onEnd.bind(this);
    this.update = this.update.bind(this);
    this.targetBCR = null;
    this.target = null;
    this.startX = 0;
    this.currentX = 0;
    this.screenX = 0;
    this.targetX = 0;
    this.draggingCard = false;

    this.addEventListeners();

    requestAnimationFrame(this.update);
  }

  addEventListeners() {
    document.addEventListener('touchstart', this.onStart);
    document.addEventListener('touchmove', this.onMove);
    document.addEventListener('touchend', this.onEnd);

    document.addEventListener('mousedown', this.onStart);
    document.addEventListener('mousemove', this.onMove);
    document.addEventListener('mouseup', this.onEnd);
  }

  onStart(e) {
    e.preventDefault();

    if (this.target)
      return;

    if(!e.target.classList.contains('card'))
      return;

    this.target = e.target;
    this.targetBCR  = this.target.getBoundingClientRect();

    this.startX = e.pageX || e.touches[0].pageX;
    this.currentX = this.startX;

    this.draggingCard = true;
    this.target.style.willChange = 'transform';
  }

  onMove(e) {
    if (!this.target)
      return;

    this.currentX = e.pageX || e.touches[0].pageX;
  }

  onEnd(e) {
    if (!this.target)
      return;

    this.targetX = 0;
    let screenX = this.currentX - this.startX;
    const threshold = this.targetBCR.width * 0.35;
    if (Math.abs(screenX) > threshold) {
      this.targetX = (screenX > 0) ?
        this.targetBCR.width :
        -this.targetBCR.width;
    }

    this.draggingCard = false;
  }

  update() {

    requestAnimationFrame(this.update);

    if (!this.target)
      return;

    if (this.draggingCard) {
      this.screenX = this.currentX - this.startX;
    } else {
      this.screenX += (this.targetX - this.screenX) / 4;
    }

    const normalizedDragDistance =
      (Math.abs(this.screenX) / this.targetBCR.width)
    const opacity = 1 - Math.pow(normalizedDragDistance, 3)

    this.target.style.transform = `translateX(${this.screenX}px)`;
    this.target.style.opacity = opacity;

    if (this.draggingCard)
      return;

      const isNearlyAtStart = (Math.abs(this.screenX) < 0.01);
      const isNearlyInvisible = (opacity < 0.01);

      if (isNearlyInvisible) {

        if (!this.target || !this.target.parentNode)
          return;

        this.target.parentNode.removeChild(this.target);
        let isAfterCurrentTarget = false;

        const onTransitionEnd = e => {
          this.target = null;
          e.target.style.transition = 'none';
          e.target.removeEventListener('transitionend', onTransitionEnd);
        }

        for (let i = 0; i < this.cards.length; i++) {
          const card = this.cards[i];

          if (card === this.target) {
            isAfterCurrentTarget = true;
            continue;
          }

          if (!isAfterCurrentTarget)
            continue;


          card.style.transform = `translateY(${this.targetBCR.height + 20}px)`;
          requestAnimationFrame( _ => {
            card.style.transition = 'transform .5s cubic-bezier(0,0,0.31,1)';
            card.style.transform = 'none';
          });

          card.addEventListener('transitionend', onTransitionEnd);
        }

      }

      if (isNearlyAtStart) {
        this.target.style.willChange = 'initial';
        this.target.style.transform = 'none';
        this.target = null;
      }
    }
  }



window.addEventListener('load', () => new Cards())
