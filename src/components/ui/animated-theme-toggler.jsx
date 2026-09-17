"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { flushSync } from "react-dom"
import { Moon, Sun } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export const AnimatedThemeToggler = ({ className, isDark, onToggle: onToggleProp }) => {
  const buttonRef = useRef(null)
  const isTransitioningRef = useRef(false)
  
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof isDark === "boolean") return isDark
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pos_emmanuella_theme") || localStorage.getItem("theme")
      if (saved) return saved === "dark"
      return document.documentElement.classList.contains("dark")
    }
    return false
  })

  // Synchronize with isDark prop if controlled
  useEffect(() => {
    if (typeof isDark === "boolean") {
      setDarkMode(isDark)
    }
  }, [isDark])

  // Observe HTML class changes to keep state perfectly in sync
  useEffect(() => {
    const syncTheme = () => {
      const isDocDark = document.documentElement.classList.contains("dark")
      setDarkMode(isDocDark)
    }

    const observer = new MutationObserver(syncTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [])

  const onToggle = useCallback(async (e) => {
    if (e) e.stopPropagation()
    if (isTransitioningRef.current) return

    const toggled = !darkMode
    const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false
    const durationMs = isMobile ? 550 : 750 // Slower & ultra fluid on PC, smooth & reliable on mobile

    const applyThemeChange = () => {
      setDarkMode(toggled)
      document.documentElement.classList.toggle("dark", toggled)
      if (document.body) {
        document.body.classList.toggle("dark", toggled)
      }
      document.documentElement.setAttribute("data-theme", toggled ? "dark" : "light")
      localStorage.setItem("theme", toggled ? "dark" : "light")
      localStorage.setItem("pos_emmanuella_theme", toggled ? "dark" : "light")
      if (onToggleProp) {
        onToggleProp(toggled)
      }
    }

    if (!buttonRef.current) {
      applyThemeChange()
      return
    }

    const { left, top, width, height } = buttonRef.current.getBoundingClientRect()
    const centerX = left + width / 2
    const centerY = top + height / 2
    const maxDistance = Math.hypot(
      Math.max(centerX, window.innerWidth - centerX),
      Math.max(centerY, window.innerHeight - centerY)
    )

    // Set CSS variables for native View Transition animation
    document.documentElement.style.setProperty('--ripple-x', `${centerX}px`)
    document.documentElement.style.setProperty('--ripple-y', `${centerY}px`)
    document.documentElement.style.setProperty('--ripple-r', `${maxDistance}px`)
    document.documentElement.style.setProperty('--ripple-duration', `${durationMs}ms`)

    // Modern browsers with View Transitions API (Chrome, Edge, Safari 18+)
    if (document.startViewTransition) {
      try {
        isTransitioningRef.current = true

        const transition = document.startViewTransition(() => {
          flushSync(() => {
            applyThemeChange()
          })
        })

        await transition.ready

        // Web Animations API (Chromium / Firefox / Safari 18.2+)
        try {
          if (typeof document.documentElement.animate === 'function') {
            const animation = document.documentElement.animate(
              {
                clipPath: [
                  `circle(0px at ${centerX}px ${centerY}px)`,
                  `circle(${maxDistance}px at ${centerX}px ${centerY}px)`,
                ],
              },
              {
                duration: durationMs,
                easing: "cubic-bezier(0.4, 0, 0.2, 1)",
                pseudoElement: "::view-transition-new(root)",
              }
            )
            await animation.finished
          }
        } catch {
          // Safari WebKit might throw on pseudoElement in animate(), but the CSS @keyframes circle-expand handles it seamlessly!
        }
      } catch {
        applyThemeChange()
      } finally {
        isTransitioningRef.current = false
      }
      return
    }

    // Universal Fallback for Mobile browsers without View Transitions (e.g. iOS Safari < 18, WebViews)
    try {
      isTransitioningRef.current = true

      const overlay = document.createElement('div')
      overlay.style.position = 'fixed'
      overlay.style.top = '0'
      overlay.style.left = '0'
      overlay.style.width = '100vw'
      overlay.style.height = '100vh'
      overlay.style.pointerEvents = 'none'
      overlay.style.zIndex = '99999'
      overlay.style.backgroundColor = toggled ? '#0F0F1A' : '#F5F5FA'
      overlay.style.clipPath = `circle(0px at ${centerX}px ${centerY}px)`
      overlay.style.transition = `clip-path ${durationMs}ms cubic-bezier(0.4, 0, 0.2, 1)`
      document.body.appendChild(overlay)

      // Force reflow and expand circle
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          overlay.style.clipPath = `circle(${maxDistance}px at ${centerX}px ${centerY}px)`
        })
      })

      // Switch theme under the expanding wave
      setTimeout(() => {
        applyThemeChange()
      }, Math.round(durationMs * 0.45))

      // Clean up overlay
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay)
        }
        isTransitioningRef.current = false
      }, durationMs + 60)
    } catch {
      applyThemeChange()
      isTransitioningRef.current = false
    }
  }, [darkMode, onToggleProp])

  return (
    <button
      ref={buttonRef}
      onClick={onToggle}
      role="switch"
      aria-checked={darkMode}
      aria-label={darkMode ? "Basculer en Mode Clair" : "Basculer en Mode Sombre"}
      title={darkMode ? "Basculer en Mode Clair" : "Basculer en Mode Sombre"}
      className={cn(
        "relative w-16 h-8 rounded-full p-1 cursor-pointer select-none flex items-center justify-between border shadow-sm active:scale-95 transition-all outline-none focus:outline-none",
        darkMode
          ? "bg-slate-900 border-indigo-500/50 shadow-indigo-500/10"
          : "bg-slate-200 border-slate-300 shadow-inner",
        className
      )}
      type="button"
    >
      {/* Background Track with Sun and Moon */}
      <div className="flex items-center justify-around w-full z-0 px-0.5 pointer-events-none">
        <Sun
          size={13}
          className={cn(
            "transition-opacity duration-300",
            darkMode ? "opacity-30 text-slate-500" : "opacity-100 text-amber-500 fill-amber-500"
          )}
        />
        <Moon
          size={13}
          className={cn(
            "transition-opacity duration-300",
            darkMode ? "opacity-100 text-indigo-400 fill-indigo-400" : "opacity-30 text-slate-400"
          )}
        />
      </div>

      {/* Sliding Thumb Knob with Framer Motion */}
      <motion.div
        animate={{ x: darkMode ? 32 : 0 }}
        transition={{ type: "spring", stiffness: 450, damping: 30 }}
        className={cn(
          "absolute top-1 left-1 w-6 h-6 rounded-full shadow-md flex items-center justify-center pointer-events-none",
          darkMode
            ? "bg-gradient-to-tr from-primary to-indigo-500 text-white shadow-primary/40"
            : "bg-white text-amber-500 shadow-sm shadow-slate-400/20"
        )}
      >
        {darkMode ? (
          <Moon size={11} className="fill-white text-white" />
        ) : (
          <Sun size={11} className="fill-amber-500 text-amber-500" />
        )}
      </motion.div>
    </button>
  )
}

export default AnimatedThemeToggler
