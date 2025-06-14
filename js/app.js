window.addEventListener('DOMContentLoaded', function(){
    document.querySelector('.header_button').addEventListener('click', function(){
    document.querySelector('.menu').classList.toggle('open-menu');
    });
    let slides = document.querySelectorAll('.slide_home');
    let currentSlide = 0;
    let slideInterval = setInterval(nextSlide, 4000);
    function nextSlide() {
        slides[currentSlide].className = 'slide_home';
        currentSlide = (currentSlide + 1)%slides.length;
        slides[currentSlide].className = 'slide_home showing';
    }
    gsap.registerPlugin(ScrollTrigger, Draggable);
            let iteration = 0;
        gsap.set('.cards .element', {xPercent: 210, scale: 0.25});
            const spacing = 0.105,
            snapTime = gsap.utils.snap(spacing), 
            cards = gsap.utils.toArray('.cards .element'),
        animateFunc = element  => {
                const tl = gsap.timeline();
                tl.fromTo(element, {scale: 0.25}, {scale: 1,  zIndex: 100, duration: 0.5, yoyo: true, repeat: 1, ease: "power1.in", immediateRender: false})
                  .fromTo(element, {xPercent: 210}, {xPercent: -210, duration: 1, ease: "none", immediateRender: true}, 0);
                return tl;
              };
        seamlessLoop = buildSeamlessLoop(cards, spacing, animateFunc),
            playhead = {offset: 0}, 
            wrapTime = gsap.utils.wrap(0, seamlessLoop.duration()), 
        scrub = gsap.to(playhead, { 
                offset: 0,
                onUpdate() {
                    seamlessLoop.time(wrapTime(playhead.offset)); 
                },
                duration: 0.5,
                ease: "power4",
                paused: true
            }),
        trigger = ScrollTrigger.create({
                start: "top",
                onUpdate(self) {
                    let scroll = self.scroll();
                    if (scroll > self.end - 1) {
                        wrap(1, 2);
                    } else if (scroll < 1 && self.direction < 0) {
                        wrap(-1, self.end - 2);
                    } else {
                        scrub.vars.offset = (iteration + self.progress) * seamlessLoop.duration();
                        scrub.invalidate().restart();
                    }
                },
                pin: ".gallery",
            });
        progressToScroll = progress => gsap.utils.clamp(1, trigger.end - 1, gsap.utils.wrap(0, 1, progress) * trigger.end),
            wrap = (iterationDelta, scrollTo) => {
                iteration += iterationDelta;
                trigger.scroll(scrollTo);
                trigger.update(); 
        };
    ScrollTrigger.addEventListener("scrollEnd", function(){scrollToOffset(scrub.vars.offset)});
        function scrollToOffset(offset) { 
            let snappedTime = snapTime(offset),
                progress = (snappedTime - seamlessLoop.duration() * iteration) / seamlessLoop.duration(),
                scroll = progressToScroll(progress);
            if (progress >= 1 || progress < 0) {
                return wrap(Math.floor(progress), scroll);
            }
            trigger.scroll(scroll);
            setTimeout(function(){centerin()}, 200);
        }
        function buildSeamlessLoop(items, spacing, animateFunc) {
            let rawSequence = gsap.timeline({paused: true}), 
                seamlessLoop = gsap.timeline({ 
                    paused: true,
                    repeat: -1, 
                    onRepeat() { 
                        this._time === this._dur && (this._tTime += this._dur - 0.01);
                    },
              onReverseComplete() {
                this.totalTime(this.rawTime() + this.duration() * 100); 
              }
                }),
                cycleDuration = spacing * items.length,
                dur;
            items.concat(items).concat(items).forEach((item, i) => {
                let anim = animateFunc(items[i % items.length]);
                rawSequence.add(anim, i * spacing);
                dur || (dur = anim.duration());
            });
            seamlessLoop.fromTo(rawSequence, {
                time: cycleDuration + dur / 2
            }, {
                time: "+=" + cycleDuration,
                duration: cycleDuration,
                ease: "none"
            });
            return seamlessLoop;
        }
        function centerin(){
            document.querySelectorAll('.element .card_img').forEach(function(elem){
              var leftl = elem.getBoundingClientRect().left-20;
              var rightl = elem.getBoundingClientRect().right+20;
              var middle = window.innerWidth / 2;
              if(leftl < middle && rightl > middle){
                elem.closest('.thumbnail_scroll').classList.add('in-center');
                }else{
                elem.closest('.thumbnail_scroll').classList.remove('in-center');
                 elem.closest('.thumbnail_scroll').classList.remove('active');
                }
              });
              setTimeout(function(){centerin();},50);
        }         
        Draggable.create(".drag-proxy", {
          type: "x",
          trigger: ".cards",
          onPress() {
            this.startOffset = scrub.vars.offset;
          },
          onDrag() {
            scrub.vars.offset = this.startOffset + (this.startX - this.x) * 0.001;
            scrub.invalidate().restart();
          },
          onDragEnd() {
            scrollToOffset(scrub.vars.offset);
          }
        });
});