'use client'

import { LanguageToggle } from './language-toggle'

export function CheckoutHeader() {
  return (
    <div className="bg-background border-b">
      <div className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Secure Checkout</h1>
          <p className="text-muted-foreground">Complete your purchase to start learning</p>
        </div>
        <LanguageToggle />
      </div>
    </div>
  )
}
