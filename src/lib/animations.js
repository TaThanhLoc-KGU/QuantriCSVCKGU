// Shared Framer Motion variants

export const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 }
  }
}

export const itemVariants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } }
}

export const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in:      { opacity: 1, x: 0 },
  out:     { opacity: 0, x: -20 }
}

export const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.25
}

export const accordionVariants = {
  open:   { height: 'auto', opacity: 1 },
  closed: { height: 0,      opacity: 0 }
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } }
}
