import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { onMounted, onBeforeUnmount, type Ref } from "vue"

gsap.registerPlugin(ScrollTrigger)

interface AnimationOptions {
  y?: number
  opacity?: number
  scale?: number
  x?: number
  rotation?: number
  duration?: number
  delay?: number
  ease?: string
}

const defaultOptions: AnimationOptions = {
  y: 50,
  opacity: 0,
  duration: 0.8,
  delay: 0,
  ease: "power3.out",
}

export function useScrollAnimation() {
  const triggers: ScrollTrigger[] = []

  function fadeInUp(
    element: string | Element | NodeListOf<Element>,
    options: AnimationOptions = {},
  ) {
    const opts = { ...defaultOptions, ...options }
    const animation = gsap.from(element, {
      y: opts.y,
      opacity: opts.opacity,
      scale: opts.scale,
      x: opts.x,
      rotation: opts.rotation,
      duration: opts.duration,
      delay: opts.delay,
      ease: opts.ease,
      scrollTrigger: {
        trigger: element as gsap.DOMTarget,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    })
    if (animation.scrollTrigger) {
      triggers.push(animation.scrollTrigger)
    }
    return animation
  }

  function fadeInLeft(
    element: string | Element | NodeListOf<Element>,
    options: AnimationOptions = {},
  ) {
    const opts = { ...defaultOptions, ...options }
    const animation = gsap.from(element, {
      x: opts.x ?? -50,
      opacity: opts.opacity,
      duration: opts.duration,
      delay: opts.delay,
      ease: opts.ease,
      scrollTrigger: {
        trigger: element as gsap.DOMTarget,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    })
    if (animation.scrollTrigger) {
      triggers.push(animation.scrollTrigger)
    }
    return animation
  }

  function fadeInRight(
    element: string | Element | NodeListOf<Element>,
    options: AnimationOptions = {},
  ) {
    const opts = { ...defaultOptions, ...options }
    const animation = gsap.from(element, {
      x: opts.x ?? 50,
      opacity: opts.opacity,
      duration: opts.duration,
      delay: opts.delay,
      ease: opts.ease,
      scrollTrigger: {
        trigger: element as gsap.DOMTarget,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    })
    if (animation.scrollTrigger) {
      triggers.push(animation.scrollTrigger)
    }
    return animation
  }

  function staggerReveal(
    element: string | Element | NodeListOf<Element>,
    staggerOptions: {
      children?: string
      amount?: number
      from?: string
    } = {},
  ) {
    const { children: _children = "> *", amount = 0.8, from: _from = "start" } = staggerOptions

    const animation = gsap.from(element, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element as gsap.DOMTarget,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    })

    const targetElements = typeof element === "string" ? (element as string) : element

    const staggerAnimation = gsap.from(targetElements, {
      y: 40,
      opacity: 0,
      duration: 0.6,
      stagger: amount,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element as gsap.DOMTarget,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    })

    if (staggerAnimation.scrollTrigger) {
      triggers.push(staggerAnimation.scrollTrigger)
    }
    return { main: animation, stagger: staggerAnimation }
  }

  function parallax(element: string | Element | NodeListOf<Element>, speed: number = 0.5) {
    const animation = gsap.to(element, {
      y: () => -window.innerHeight * speed * 0.1,
      ease: "none",
      scrollTrigger: {
        trigger: element as gsap.DOMTarget,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    })
    if (animation.scrollTrigger) {
      triggers.push(animation.scrollTrigger)
    }
    return animation
  }

  function scaleIn(
    element: string | Element | NodeListOf<Element>,
    options: AnimationOptions = {},
  ) {
    const opts = { ...defaultOptions, ...options }
    const animation = gsap.from(element, {
      scale: opts.scale ?? 0.8,
      opacity: opts.opacity,
      duration: opts.duration,
      delay: opts.delay,
      ease: "back.out(1.7)",
      scrollTrigger: {
        trigger: element as gsap.DOMTarget,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    })
    if (animation.scrollTrigger) {
      triggers.push(animation.scrollTrigger)
    }
    return animation
  }

  function textReveal(
    element: string | Element | NodeListOf<Element>,
    options: AnimationOptions = {},
  ) {
    const opts = { ...defaultOptions, ...options }
    gsap.set(element, { overflow: "hidden" })

    const animation = gsap.from(element, {
      y: "100%",
      duration: opts.duration ?? 0.8,
      delay: opts.delay ?? 0,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element as gsap.DOMTarget,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    })
    if (animation.scrollTrigger) {
      triggers.push(animation.scrollTrigger)
    }
    return animation
  }

  function cleanup() {
    triggers.forEach((trigger) => trigger.kill())
    triggers.length = 0
    ScrollTrigger.getAll().forEach((st) => st.kill())
  }

  onBeforeUnmount(() => {
    cleanup()
  })

  return {
    fadeInUp,
    fadeInLeft,
    fadeInRight,
    staggerReveal,
    parallax,
    scaleIn,
    textReveal,
    cleanup,
  }
}

export function useScrollAnimationOnMount(
  ref: Ref<HTMLElement | undefined>,
  options: AnimationOptions & { type?: "fadeInUp" | "fadeInLeft" | "fadeInRight" | "scaleIn" } = {},
) {
  const { fadeInUp, fadeInLeft, fadeInRight, scaleIn, cleanup } = useScrollAnimation()
  let animation:
    | gsap.core.Animation
    | { main: gsap.core.Animation; stagger: gsap.core.Animation }
    | null = null

  onMounted(() => {
    if (ref.value) {
      const { type = "fadeInUp", ...animOptions } = options
      switch (type) {
        case "fadeInLeft":
          animation = fadeInLeft(ref.value, animOptions)
          break
        case "fadeInRight":
          animation = fadeInRight(ref.value, animOptions)
          break
        case "scaleIn":
          animation = scaleIn(ref.value, animOptions)
          break
        default:
          animation = fadeInUp(ref.value, animOptions)
      }
    }
  })

  onBeforeUnmount(() => {
    cleanup()
  })

  return { animation }
}

export { gsap, ScrollTrigger }
