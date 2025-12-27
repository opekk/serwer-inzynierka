import React from 'react'

export default function AuctionCard({ image, title, description, onBid, buttonText = 'Button' }) {
  return (
    <div className="block rounded-lg bg-gray-600 text-white shadow-lg max-w-sm mx-auto">
      {image && (
        <img className="rounded-t-lg w-full object-cover" src={image} alt={title} />
      )}
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
