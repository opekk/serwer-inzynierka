import React, { useEffect } from 'react'

export default function AuctionCard({ image, title, description, onBid, buttonText = 'Button' }) {
  useEffect(() => {
    // Try to initialize tw-elements ripples if the package is installed.
    let mounted = true
    ;(async () => {
      try {
        const twe = await import('tw-elements')
        // try both known init names
        if (!mounted) return
        if (typeof twe.initTWE === 'function') {
          twe.initTWE({ Ripple: twe.Ripple })
        } else if (typeof twe.initTE === 'function') {
          twe.initTE({ Ripple: twe.Ripple })
        }
      } catch (err) {
        // tw-elements not installed or failed to load — ignore silently
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="block rounded-lg bg-gray-600 text-white shadow-lg max-w-sm mx-auto">
      <div className="relative overflow-hidden bg-cover bg-no-repeat" data-twe-ripple-init data-twe-ripple-color="light">
        {image ? (
          <img className="rounded-t-lg w-full object-cover" src={image} alt={title} />
        ) : (
          <div className="rounded-t-lg w-full h-48 bg-gray-700" />
        )}
        <a href="#!">
          <div className="absolute inset-0 h-full w-full overflow-hidden bg-black/20 opacity-0 transition duration-300 ease-in-out hover:opacity-100" />
        </a>
      </div>
      <div className="p-6">
        <h5 className="mb-2 text-xl font-medium leading-tight">{title}</h5>
        <p className="mb-4 text-base text-gray-200">{description}</p>
        <button
          type="button"
          onClick={onBid}
          className="inline-block rounded bg-gray-100 px-4 py-2 text-sm font-medium text-white shadow-xl hover:bg-slate-700 transition"
        >
          {buttonText}
        </button>
      </div>
    </div>
  )
}
